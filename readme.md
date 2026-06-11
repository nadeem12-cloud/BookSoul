# 📚 BookSoul - AI-Powered Reading Personality Platform

> Decode your literary identity through machine learning and psychological profiling.

[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Machine Learning](https://img.shields.io/badge/ML-scikit--learn-orange.svg)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 What It Does

BookSoul analyzes your reading history to:

- **📊 Infer your personality** using Big Five psychology + ML theme extraction
- **🎯 Generate personalized recommendations** via TF-IDF content filtering + semantic NLP graph
- **📈 Track reading evolution** over time with personality snapshots
- **🦉 Identify reading archetypes** (The Philosopher, The Dreamer, The Scholar, etc.)
- **🎨 Visualize your literary DNA** with interactive charts and insights

---

## ✨ Features

### ✅ Implemented (V1)

- [x] **100k+ book catalog** with cover images from Goodreads dataset
- [x] **3-shelf system** (Read, Currently Reading, Want to Read)
- [x] **Big Five personality inference** based on reading patterns
- [x] **9 reading archetypes** personality classification
- [x] **Multi-strategy recommendation engine:**
  - Author affinity scoring
  - Content-based filtering (TF-IDF)
  - Personality-aligned suggestions
  - Diversity injection (genre exploration)
- [x] **Personality evolution tracking** over time
- [x] **Genre distribution analytics** with interactive charts
- [x] **Advanced search, filter, and sort**
- [x] **Responsive newspaper-style design**
- [x] **TF-IDF ML model** for semantic similarity
- [x] **Custom NLP knowledge graph** for recommendations

### 🔮 Roadmap (V2)

- [ ] Sentence Transformers embeddings (deep semantic search)
- [ ] PostgreSQL + pgvector (production database)
- [ ] User authentication (OAuth 2.0)
- [ ] Social features (friend comparisons)
- [ ] Docker containerization
- [ ] Reading goals & challenges
- [ ] Book notes & highlights
- [ ] Export personality report (PDF)

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │────────>│  FastAPI         │────────>│ ML Engine       │
│  (Vanilla JS)   │<────────│  Backend         │<────────│ (scikit-learn)  │
└─────────────────┘   JSON  └──────────────────┘  Models └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
  index.html              TF-IDF Matrix
  merged.json (0.84 MB)   (100k books)
```

### Tech Stack

**Frontend:**
- **Vanilla JavaScript** (no frameworks - pure performance)
- **Chart.js** for personality visualization
- **Responsive design** (mobile-first, newspaper aesthetic)
- **Local storage** for user data persistence

**Backend:**
- **FastAPI** (Python 3.9+)
- **scikit-learn** (TF-IDF content filtering)
- **pandas** (data processing)
- **Custom NLP semantic graph**

**Data Science:**
- **Big Five personality mapping** (16 genre taxonomy)
- **Multi-strategy recommendation engine**
- **3-tier genre classification** system

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Git

### Clone & Run Locally

```bash
# Clone the repo
git clone https://github.com/nadeem12-cloud/BookSoul.git
cd BookSoul

# Frontend only (static)
cd frontend
python -m http.server 8080
# Navigate to: http://localhost:8080
```

### Full Stack (with ML Backend)

```bash
# 1. Backend setup
cd backend
pip install -r requirements.txt

# 2. Run FastAPI server
uvicorn main:app --reload
# API available at: http://localhost:8000

# 3. Frontend (in new terminal)
cd ../frontend
python -m http.server 8080
# App available at: http://localhost:8080
```

---

## 📊 Dataset

**Frontend:** Top 5,000 rated books (optimized for performance)  
**Backend API:** Full 100,000+ book catalog with ML recommendations

The frontend uses a curated subset for optimal load times and responsiveness. The complete dataset is available through the backend API for advanced ML-powered recommendations.

### Data Sources
- **Primary:** Goodreads Books Dataset (Kaggle)
- **Covers:** Open Library Cover API
- **Metadata:** ISBN, ratings, publication year, genres

---

## 🧠 How Personality Inference Works

### 1. Genre → Trait Mapping

Each book genre maps to Big Five personality traits:

```python
THEME_MAP = {
    'Philosophy': {Openness: 0.9, Neuroticism: 0.4, ...},
    'Self-Help': {Conscientiousness: 0.9, ...},
    'Horror': {Neuroticism: 0.8, ...},
    # ... 16 genres total
}
```

### 2. Weighted Aggregation

```
personality_score = Σ (genre_weight × user_rating × recency_weight)
```

### 3. Diversity Bonus

```
Openness += (unique_genres / 16) × 0.15
```

### 4. Archetype Detection

9 archetypes based on dominant trait combinations:
- 🦉 **The Philosopher** (Openness > 0.65)
- 🏆 **The Achiever** (Conscientiousness > 0.7)
- 💫 **The Empath** (Agreeableness > 0.7)
- And 6 more...

---

## 🎯 Recommendation Engine

### Strategy 1: Author Affinity (30%)
Identifies favorite authors and recommends related works

### Strategy 2: Content-Based (40%)
TF-IDF similarity on book descriptions and metadata

### Strategy 3: Personality-Aligned (20%)
Matches user's dominant personality trait to genre affinities

### Strategy 4: Diversity Injection (10%)
Recommends from unexplored genres to expand horizons

---

## 📂 Project Structure

```
BookSoul/
├── frontend/
│   ├── index.html              # Main app (single-file)
│   └── data/
│       └── merged.json         # Optimized 5k catalog (0.84MB)
│
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   ├── cache/
│   │   ├── tfidf_model.pkl     # Pre-trained TF-IDF
│   │   └── tfidf_matrix.pkl    # 100k book matrix
│   └── data/
│       ├── merged.csv          # Master dataset
│       └── nlp_recommendations.json
│
├── scripts/
│   └── optimize_catalog.py     # Data optimization
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🎨 UI/UX Highlights

- **Newspaper aesthetic:** Inspired by literary journals (Playfair Display, Source Serif)
- **Loading states:** Smooth transitions and skeleton screens
- **Responsive design:** Mobile, tablet, and desktop optimized
- **No external dependencies:** Vanilla JS for speed
- **Interactive visualizations:** Chart.js radar charts and line graphs

---

## 🧪 Testing

### Manual Test Cases

```
1. Add 5 books from different genres
   → Personality should show balanced traits

2. Add 10 philosophy books
   → Openness score should be > 0.7

3. Generate recommendations
   → Should see 4 recommendation categories

4. Track evolution
   → Charts should visualize change over time
```

### API Testing

```bash
# Test recommendation endpoint
curl -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"books": ["Sapiens", "Dune", "Meditations"], "top_n": 10}'
```

---

## 📚 Technical Highlights

### 1. 3-Tier Genre Classification
Handles messy/inconsistent genre data through:
- Tier 1: Exact title overrides (150+ books)
- Tier 2: Author → Genre mapping (150+ authors)
- Tier 3: Keyword extraction from categories

### 2. Personality Validation
Mappings grounded in:
- Big Five psychology literature
- Genre reading preference studies
- Comprehensive test cases

### 3. Performance Optimizations
- Lazy loading for large datasets
- Debounced search (300ms)
- LocalStorage caching
- Optimized JSON (19.7MB → 0.84MB)

---

## 🐳 Future: Docker Deployment

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY frontend/ /app/frontend
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

Then: `docker build -t book-soul . && docker run -p 8000:8000 book-soul`

---

## 🎓 Academic Context

Built as a **portfolio project** demonstrating:

- **Full-stack development** (frontend + backend + ML)
- **Data science pipeline** (ETL, feature engineering, model training)
- **System design** (modular architecture, scalability)
- **Applied ML** (TF-IDF, semantic NLP, personality modeling)
- **Performance optimization** (data reduction, caching)

---

## 🙏 Acknowledgments

- **Goodreads Dataset** (Kaggle)
- **Open Library** (Cover images)
- **Big Five Psychology** (Personality framework)
- **FastAPI** (Web framework)
- **Chart.js** (Visualizations)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**Nadeem Memon**

- GitHub: [@nadeem12-cloud](https://github.com/nadeem12-cloud)
- LinkedIn: [Nadeem Memon](https://www.linkedin.com/in/nadeemmemon10/)
- Portfolio: [Nadeem Memon](https://portfolio-ruby-three-m2keql87xs.vercel.app/)

---

## 🌟 Show Your Support

Give a ⭐️ if you find this project interesting!

---

**Built with ❤️ | 2024**
