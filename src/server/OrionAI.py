import re
import regex
import uvicorn
from fastapi import FastAPI, HTTPException, Body
from nltk.stem.snowball import SnowballStemmer
from sentence_transformers import SentenceTransformer, util
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase connection
supabase_url = os.getenv("SUPABASE_URL", "https://nlabffngmifszpwrqetx.supabase.co")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

# Hungarian language stemmer for keyword normalization
stemmer = SnowballStemmer("hungarian")


def stem_word(word: str) -> str:
    """Return the stemmed lowercase form of a Hungarian word."""
    return stemmer.stem(word.lower())


async def get_jobs() -> list:
    """Fetch all active job advertisements from Supabase."""
    try:
        response = supabase.table("advertisement").select(
            "id,title,position,location,hourly_wage,tasks,requirements,job_description"
        ).eq('is_active', True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching data from Supabase: {e}")
        return []


# Scoring weights for final recommendation ranking
WEIGHTS = {
    "TEXT": 0.80,
    "WAGE": 0.05,
    "LOCATION": 0.15,
}

MIN_TEXT_SCORE = 0.4
TITLE_MULTIPLIER = 1.8

# Common Hungarian stop words filtered out during text analysis
STOP_WORDS = {
    "és", "vagy", "hogy", "egy", "az", "a", "meg",
    "van", "volt", "lesz", "nem", "igen",
    "is", "mert", "mint", "sok", "kevés", "munka", "munkát",
    "keres", "keresem", "szeretne", "szeretnék", "lenni",
    "lehetőleg", "keresek",
}

# Short technical tokens that should not be discarded by length filters
ONE_CHAR_TECH = {"c", "r"}
TECH_TOKENS = {"c#", "c++", ".net", "asp.net"}

# Semantic embedding model for multilingual text similarity
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


def normalize_location(text: str) -> list:
    """Extract rough location stems from Hungarian text by stripping common suffixes."""
    if not text:
        return []
    text = text.lower()
    text = regex.sub(r'[^\p{L}\p{N}\s]', '', text)
    words = []
    for w in text.split():
        base = w.rstrip('banbenbólbőlrólrőltőlnálnelonenöttottrare')
        if len(base) > 2:
            words.append(base)
    return words


def normalize(text: str) -> list:
    """Tokenize and stem text, preserving recognised tech tokens."""
    if not text:
        return []
    text = text.lower()
    text = regex.sub(r'[\/,;()\[\]]', ' ', text)
    text = regex.sub(r'[^\p{L}\p{N}\s#+\.]', '', text)
    words = re.split(r'\s+', text.strip())
    tokens = []
    for w in words:
        if w in TECH_TOKENS:
            tokens.append(w)
        elif len(w) == 1 and w in ONE_CHAR_TECH:
            tokens.append(w)
        elif len(w) > 2 and w not in STOP_WORDS:
            tokens.append(stem_word(w))
    return tokens


def cosine_similarity(a: str, b: str) -> float:
    """Compute cosine similarity between two text strings using sentence embeddings."""
    if not a or not b:
        return 0.0
    emb_a = model.encode(a, convert_to_tensor=True)
    emb_b = model.encode(b, convert_to_tensor=True)
    return float(util.cos_sim(emb_a, emb_b))


def calculate_wage_score(job_wage: float, target_wage: float) -> float:
    """Score how well the job wage meets the user's target (1.0 if equal or higher)."""
    if not job_wage or not target_wage:
        return 0.0
    if job_wage >= target_wage:
        return 1.0
    return job_wage / target_wage


def score_job(user_text: str, target_wage: int, job: dict) -> dict:
    """Score a single job against user preferences and return it with attached scores."""
    job_title = job.get("title", "")
    job_location = job.get("location", "")
    job_desc = f"{job.get('job_description', '')} {job.get('tasks', '')} {job.get('requirements', '')}"
    full_job_text = f"{job_title} {job_desc}"

    # Location matching
    user_loc_tokens = set(normalize_location(user_text))
    job_loc_tokens = set(normalize_location(job_location))
    is_location_match = bool(user_loc_tokens & job_loc_tokens)
    location_score = 1.0 if is_location_match else 0.0

    # Build a profession-only query by removing location words and stop words
    prof_words = [
        w for w in user_text.lower().split()
        if not (normalize_location(w) and normalize_location(w)[0] in job_loc_tokens)
        and w not in STOP_WORDS
    ]
    prof_text = " ".join(prof_words).strip()

    # Semantic text similarity
    text_score = cosine_similarity(prof_text, full_job_text)

    # Boost score when user keywords appear in the job title
    title_tokens = normalize(job_title)
    prof_tokens = normalize(prof_text)
    if any(t in title_tokens for t in prof_tokens):
        text_score = min(1.0, text_score * TITLE_MULTIPLIER)

    # Wage comparison
    wage_score = calculate_wage_score(float(job.get("hourly_wage", 0)), target_wage)

    # Weighted final score (zero if text relevance is too low)
    final_score = 0.0
    if text_score >= MIN_TEXT_SCORE:
        final_score = (text_score * WEIGHTS["TEXT"]) + (wage_score * WEIGHTS["WAGE"])
        if is_location_match:
            final_score += location_score * WEIGHTS["LOCATION"]

    result = job.copy()
    result["scores"] = {
        "total": final_score,
        "text": text_score,
        "wage": wage_score,
        "location": location_score,
        "isTitleMatch": any(t in title_tokens for t in prof_tokens),
    }
    return result


async def orion_ai(user_input: str, wage: int) -> list:
    """Run the recommendation engine and return the top 10 job IDs."""
    jobs = await get_jobs()

    ranked = [score_job(user_input, wage, job) for job in jobs]
    ranked = [j for j in ranked if j["scores"]["total"] > 0]
    ranked.sort(key=lambda x: x["scores"]["total"], reverse=True)

    return [job.get("id") for job in ranked[:10]]


@app.post("/OrionAI")
async def recommend_jobs(body: dict = Body(...)):
    """API endpoint that accepts user input and wage, returns ranked job IDs."""
    try:
        user_input = body.get("userinput")
        wage = body.get("wage")
        if not user_input or wage is None or wage <= 0:
            raise HTTPException(status_code=400, detail="Invalid input")
        return await orion_ai(user_input, wage)
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))