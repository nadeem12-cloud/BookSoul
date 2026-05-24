import os
import numpy as np
import pandas as pd
import pickle
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = FastAPI(title="BookSoul Python ML API (100k Edition)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'goodreads_100k.csv')
CACHE_DIR = os.path.join(BASE_DIR, 'backend', 'cache')
MODELS_PATH = os.path.join(CACHE_DIR, 'tfidf_model.pkl')
MATRIX_PATH = os.path.join(CACHE_DIR, 'tfidf_matrix.pkl')

os.makedirs(CACHE_DIR, exist_ok=True)

print("Starting BookSoul Machine Learning Engine (100k)...")

# Load core dataset into memory
if not os.path.exists(DATA_PATH):
    print(f"ERROR: Dataset not found at {DATA_PATH}. Please run the download script first.")
    df = pd.DataFrame(columns=['title', 'authors', 'description', 'categories', 'average_rating', 'thumbnail'])
else:
    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    # Basic cleaning
    df['description'] = df['description'].fillna('')
    df['title'] = df['title'].fillna('')
    df['authors'] = df['authors'].fillna('Unknown')
    df['categories'] = df['categories'].fillna('Fiction')
    df['average_rating'] = df['average_rating'].fillna(3.5)
    # Thumbnail might not be in the HF dataset, handle gracefully
    if 'thumbnail' not in df.columns:
        df['thumbnail'] = ""

# Preprocessing: ensure plot/description has content for ML
# We filter a bit more strictly for the 100k dataset to keep the matrix high-quality
active_df = df[df['description'].str.len() > 50].reset_index(drop=True)

print(f"Dataset active: {len(active_df)} document records.")

# TF-IDF Setup with Caching
if os.path.exists(MODELS_PATH) and os.path.exists(MATRIX_PATH):
    print("Loading NLP models from cache...")
    with open(MODELS_PATH, 'rb') as f:
        tfidf = pickle.load(f)
    with open(MATRIX_PATH, 'rb') as f:
        tfidf_matrix = pickle.load(f)
else:
    print("Computing TF-IDF Matrix (this may take a few seconds for 100k records)...")
    tfidf = TfidfVectorizer(analyzer='word', ngram_range=(1, 2), min_df=2, stop_words='english')
    tfidf_matrix = tfidf.fit_transform(active_df['description'])
    
    print("Saving NLP models to cache...")
    with open(MODELS_PATH, 'wb') as f:
        pickle.dump(tfidf, f)
    with open(MATRIX_PATH, 'wb') as f:
        pickle.dump(tfidf_matrix, f)

# Create a rapid lookup dictionary mapping 'title' to Dataframe Index
title_to_idx = {str(title).strip().lower(): idx for idx, title in enumerate(active_df['title'])}

# Pre-build sorted title list for fuzzy search (prefix-first ordering)
_all_titles_sorted = sorted(title_to_idx.keys())

def fuzzy_find_idx(query: str):
    """Three-tier title lookup: exact → starts-with → contains."""
    q = query.strip().lower()
    # Tier 1: exact
    if q in title_to_idx:
        return title_to_idx[q]
    # Tier 2: starts-with
    for t in _all_titles_sorted:
        if t.startswith(q):
            return title_to_idx[t]
    # Tier 3: contains
    for t in _all_titles_sorted:
        if q in t or t in q:
            return title_to_idx[t]
    return None

print("[SUCCESS] TF-IDF Matrix Ready. API Live.")


class RecommendRequest(BaseModel):
    liked_titles: list[str]

@app.get("/api/search")
def search_books(q: str = Query(..., min_length=2)):
    """Relevance-sorted fuzzy search across the 100k catalog."""
    q_lower = q.strip().lower()

    # Pull all candidates that match in title OR author
    mask = (
        df['title'].str.contains(q_lower, case=False, na=False) |
        df['authors'].str.contains(q_lower, case=False, na=False)
    )
    candidates = df[mask].head(60)   # over-fetch, then score & trim

    def relevance(row):
        t = str(row['title']).strip().lower()
        a = str(row['authors']).lower()
        if t == q_lower:            return 0   # exact title
        if t.startswith(q_lower):   return 1   # title prefix
        if q_lower in t:            return 2   # title contains
        if q_lower in a:            return 3   # author match
        return 4

    scored = []
    for _, row in candidates.iterrows():
        title = str(row['title']).strip()
        if not title or title == 'nan':
            continue
        scored.append({
            "score_key": relevance(row),
            "t": title,
            "a": str(row['authors']).split(';')[0].strip(),
            "g": str(row['categories']).strip(),
            "r": round(float(row['average_rating']), 1),
            "i": str(row.get('thumbnail', '')).strip()
        })

    scored.sort(key=lambda x: x["score_key"])

    # Strip helper key and return top 15
    results = [{k: v for k, v in b.items() if k != 'score_key'} for b in scored[:15]]
    return {"results": results}

@app.post("/api/recommend")
def get_recommendations(req: RecommendRequest):
    """Semantic plot-based recommendations"""
    active_indices = []
    matched_titles = []
    for t in req.liked_titles:
        idx = fuzzy_find_idx(t)
        if idx is not None and idx not in active_indices:
            active_indices.append(idx)
            matched_titles.append(t)

    print(f"[RECOMMEND] Seeded with {len(active_indices)}/{len(req.liked_titles)} titles: {matched_titles}")

    if not active_indices:
        return {"recommendations": []}

    # Personality profile vector (convert to ndarray — np.matrix not accepted by linear_kernel)
    profile_vector = np.asarray(tfidf_matrix[active_indices].mean(axis=0))

    # Cosine similarity
    cosine_similarities = linear_kernel(profile_vector, tfidf_matrix).flatten()

    # Get Top 50 matches
    related_docs_indices = cosine_similarities.argsort()[:-51:-1]
    
    read_set = set(active_indices)
    
    recommendations = []
    for idx in related_docs_indices:
        if idx in read_set: 
            continue
            
        score = cosine_similarities[idx]
        if score < 0.01: # Lowered threshold for larger dataset
            continue 
            
        row = active_df.iloc[idx]
        recommendations.append({
            "title": str(row['title']).strip(),
            "author": str(row['authors']).split(';')[0].strip(),
            "genre": str(row['categories']).strip(),
            "rating": round(float(row['average_rating'])),
            "thumbnail": str(row.get('thumbnail', '')).strip(),
            "score": round(float(score) * 100)
        })
        
        if len(recommendations) >= 12:
            break

    return {"recommendations": recommendations}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
