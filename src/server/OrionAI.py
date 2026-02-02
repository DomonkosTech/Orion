import json
import re
import regex
from nltk.stem.snowball import SnowballStemmer
from sentence_transformers import SentenceTransformer, util

stemmer = SnowballStemmer("hungarian")
def stem_hunspell(word: str) -> str:
    return stemmer.stem(word.lower())

def load_jobs_from_ts(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            return json.loads(match.group(0))
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

def explain_match(user_text: str, job_text: str, job_location: str) -> dict:
    user_loc_tokens = set(normalize_location(user_text))
    job_loc_tokens = set(normalize_location(job_location))

    def remove_locations(text, loc_tokens):
        words = text.lower().split()
        out = []
        for w in words:
            locs = normalize_location(w)
            if locs and locs[0] in loc_tokens:
                continue
            out.append(w)
        return " ".join(out)

    clean_user_text = remove_locations(user_text, job_loc_tokens)
    clean_job_text = job_text

    def clean_text(text):
        words = text.lower().split()
        return [w for w in words if len(w) > 2 and w not in STOP_WORDS]

    user_words = clean_text(clean_user_text)
    job_words = clean_text(clean_job_text)

    exact_matches = []
    user_tokens = set(normalize(clean_user_text))
    job_tokens = set(normalize(clean_job_text))
    for word in user_words:
        toks = normalize(word)
        if toks and toks[0] in job_tokens:
            exact_matches.append(word)

    semantic_matches = []
    if user_words and job_words:
        embeddings_user = model.encode(user_words, convert_to_tensor=True)
        embeddings_job = model.encode(job_words, convert_to_tensor=True)
        similarities = util.cos_sim(embeddings_user, embeddings_job)
        for i, user_word in enumerate(user_words):
            if user_word in exact_matches or user_word in STOP_WORDS:
                continue
            best_idx = int(similarities[i].argmax())
            similarity_score = float(similarities[i][best_idx])
            if similarity_score > 0.7:
                job_word = job_words[best_idx]
                if job_word not in STOP_WORDS:
                    semantic_matches.append({
                        "user_word": user_word,
                        "similar_job_word": job_word,
                        "similarity": similarity_score
                    })

    return {
        "exact_matches": exact_matches,
        "semantic_matches": semantic_matches
    }

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

    job_with_scores["reasons"] = explain_match(prof_text, full_job_text, job_location)
    return job_with_scores


def OrionAI(userinput, wage):
    jobs = load_jobs_from_ts("jobs.json")
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
        reasons = job["reasons"]
        if reasons["exact_matches"]:
            print(f"Pontos egyezések: {', '.join(reasons['exact_matches'])}")
        if reasons["semantic_matches"]:
            print("Hasonló kifejezések:")
            for match in reasons["semantic_matches"]:
                print(f"  - {match['user_word']} ≈ {match['similar_job_word']} ({match['similarity']:.2f})")


if __name__ == "__main__":
    while True:
        user_input = str(input("milyen munkát keresel: "))
        wage = int(input("milyen órabér környékén: "))
        OrionAI(user_input, wage)