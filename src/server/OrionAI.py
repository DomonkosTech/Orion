import re
import regex
import uvicorn
from fastapi import FastAPI, HTTPException, Body
from nltk.stem.snowball import SnowballStemmer
from sentence_transformers import SentenceTransformer, util
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://nlabffngmifszpwrqetx.supabase.co")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

stemmer = SnowballStemmer("hungarian")
def stem_hunspell(word: str) -> str:
    return stemmer.stem(word.lower())

async def get_jobs():
    try:
        response = supabase.table("advertisement").select(
            "id,title,position,location,hourly_wage,tasks,requirements,job_description"
        ).eq('is_active', True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching data from Supabase: {e}")
        return []

WEIGHTS = {
    "TEXT": 0.65,
    "WAGE": 0.20,
    "LOCATION": 0.15
}

MIN_TEXT_SCORE = 0.4
TITLE_MULTIPLIER = 1.8

STOP_WORDS = {
    "és", "vagy", "hogy", "egy", "az", "a", "meg",
    "van", "volt", "lesz", "nem", "igen",
    "is", "mert", "mint", "sok", "kevés", "munka", "munkát", "keres", "keresem", "szeretne",
    "szeretnék", "lenni", "lehetőleg", "keresek"
}

ONE_CHAR_TECH = {"c", "r"}
TECH_TOKENS = {"c#", "c++", ".net", "asp.net"}

def normalize_location(text: str) -> list:
    if not text:
        return []
    text = text.lower()
    text = regex.sub(r'[^\p{L}\p{N}\s]', '', text)
    words = []
    for w in text.split():
        base_word = w.rstrip('banbenbólbőlrólrőltőlnálnelonenöttottrare')
        if len(base_word) > 2:
            words.append(base_word)
    return words

def normalize(text: str) -> list:
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
            tokens.append(stem_hunspell(w))
    return tokens

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def cosine_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    emb_a = model.encode(a, convert_to_tensor=True)
    emb_b = model.encode(b, convert_to_tensor=True)
    return float(util.cos_sim(emb_a, emb_b))

def calculate_wage_score(job_wage: float, target_wage: float) -> float:
    if not job_wage or not target_wage:
        return 0.0
    if job_wage >= target_wage:
        return 1.0
    return job_wage / target_wage

def recommend(user_text: str, target_wage: int, job: dict) -> dict:
    job_title = job.get("title", "")
    job_location = job.get("location", "")
    job_desc = f"{job.get('job_description', '')} {job.get('tasks', '')} {job.get('requirements', '')}"
    full_job_text = f"{job_title} {job_desc}"

    user_loc_tokens = set(normalize_location(user_text))
    job_loc_tokens = set(normalize_location(job_location))
    is_location_match = bool(user_loc_tokens & job_loc_tokens)
    location_score = 1.0 if is_location_match else 0.0

    words = user_text.lower().split()
    prof_words = []
    for w in words:
        locs = normalize_location(w)
        if locs and locs[0] in job_loc_tokens:
            continue
        if w not in STOP_WORDS:
            prof_words.append(w)
    prof_text = " ".join(prof_words).strip()

    text_score = cosine_similarity(prof_text, full_job_text)

    title_tokens = normalize(job_title)
    prof_tokens = normalize(prof_text)
    has_match_in_title = any(t in title_tokens for t in prof_tokens)
    if has_match_in_title:
        text_score = min(1.0, text_score * TITLE_MULTIPLIER)

    wage_score = calculate_wage_score(float(job.get("hourly_wage", 0)), target_wage)

    final_score = 0.0
    if text_score >= MIN_TEXT_SCORE:
        final_score = (text_score * WEIGHTS["TEXT"]) + (wage_score * WEIGHTS["WAGE"])
        if is_location_match:
            final_score += (location_score * WEIGHTS["LOCATION"])
    else:
        final_score = 0.0

    job_with_scores = job.copy()
    job_with_scores["scores"] = {
        "total": final_score,
        "text": text_score,
        "wage": wage_score,
        "location": location_score,
        "isTitleMatch": has_match_in_title
    }

    return job_with_scores

async def OrionAI(userinput, wage):
    jobs = await get_jobs()  # Using the Supabase fetch function instead of loading from jobs.json
    user_input = userinput
    min_wage = wage

    ranked = [recommend(user_input, min_wage, job) for job in jobs]
    ranked = [j for j in ranked if j["scores"]["total"] > 0]
    ranked.sort(key=lambda x: x["scores"]["total"], reverse=True)

    for job in ranked[:10]:
        s = job["scores"]
        print(f"\n[PONTSZÁM: {s['total']:.2f}] - {job['title']} - #{job.get('id', '?')}")
        print(f"Helyszín: {job.get('location', '')}{' ✅' if s['location'] > 0 else ''}")
        print(f"Bér: {job.get('hourly_wage', 0)} Ft/óra (Bér pont: {s['wage']:.2f})")
        print(f"Szöveges egyezés: {s['text']:.2f}")

    top_ids = [job.get("id") for job in ranked[:10]]
    return top_ids

@app.post("/OrionAI")
async def recommend_jobs(body: dict = Body(...)):
    try:
        userinput = body.get("userinput")
        wage = body.get("wage")
        if len(userinput) > 0 and wage > 0:
            return await OrionAI(userinput, wage)
        raise HTTPException(status_code=400, detail="Invalid input")
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))