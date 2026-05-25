# 📚 BookSoul - AI-Powered Reading Personality Platform

> Decode your literary identity through machine learning and psychological profiling.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://booksoul.vercel.app)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![BookSoul Banner](https://via.placeholder.com/1200x300/1a1209/faf6ef?text=BookSoul+-+Your+Literary+Identity,+Illuminated)

---

## 🎯 What It Does

BookSoul analyzes your reading history to:

- **📊 Infer your personality** using Big Five psychology + ML theme extraction
- **🎯 Generate personalized recommendations** via TF-IDF content filtering + semantic NLP graph
- **📈 Track reading evolution** over time with personality snapshots
- **🦉 Identify reading archetypes** (The Philosopher, The Dreamer, The Scholar, etc.)
- **🎨 Visualize your literary DNA** with interactive charts and insights

**Live Demo:** [booksoul.vercel.app](https://booksoul.vercel.app) *(Update with your actual URL)*

---

## ✨ Features

### ✅ Implemented (V1)

- [x] **100k+ book catalog** with cover images from Goodreads dataset
- [x] **3-shelf system** (Read, Currently Reading, Want to Read)
- [x] **Big Five personality inference** based on reading patterns
- [x] **9 reading archetypes** (The Philosopher, The Achiever, The Empath, etc.)
- [x] **Multi-strategy recommendations:**
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
- [ ] Social features (compare with friends)
- [ ] Reading goals & challenges
- [ ] Book notes & highlights
- [ ] Export personality report (PDF)
- [ ] Mood-based recommendations
- [ ] Reading streak tracking
- [ ] Book club matching

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
  merged.json                TF-IDF Matrix
  (5k books)                 (100k books)
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
- **100,000+ book catalog**

**Data Science:**
- **Big Five personality mapping** (16 genre taxonomy)
- **Multi-strategy recommendation engine**
- **3-tier genre classification:**
  - Tier 1: Exact title matches (150+ books)
  - Tier 2: Author → Genre mapping (150+ authors)
  - Tier 3: Keyword extraction from categories

---

## 🚀 Quick Start

### Frontend Only (Static Demo)

```bash
# Clone the repo
git clone https://github.com/nadeem12-cloud/BookSoul.git
cd BookSoul/frontend

# Open in browser (requires simple HTTP server)
python -m http.server 8080

# Navigate to: http://localhost:8080
```

### Full Stack (with ML Backend)

```bash
# 1. Clone repository
git clone https://github.com/nadeem12-cloud/BookSoul.git
cd BookSoul

# 2. Backend setup
cd backend
pip install -r requirements.txt

# 3. Run FastAPI server
uvicorn main:app --reload

# 4. Frontend (in new terminal)
cd ../frontend
python -m http.server 8080
```

Navigate to: `http://localhost:8080`

---

## 📊 Dataset

**Frontend:** Top 5,000 rated books from Goodreads dataset  
**Backend API:** Full 100,000+ book catalog with ML recommendations

The frontend uses a curated subset for optimal performance and faster load times. The complete dataset is available through the backend API for advanced ML-powered recommendations.

### Data Sources

- **Primary:** Goodreads Books Dataset (Kaggle)
- **Covers:** Open Library Cover API
- **Metadata:** ISBN, ratings, publication year, genres

---

## 🧠 How Personality Inference Works

### 1. Genre → Trait Mapping

Each book genre maps to Big Five personality traits based on psychology research:

```python
THEME_MAP = {
    'Philosophy': {
        Openness: 0.9,
        Neuroticism: 0.4,
        Conscientiousness: 0.3,
        # ...
    },
    'Self-Help': {
        Conscientiousness: 0.9,
        Extraversion: 0.4,
        # ...
    },
    'Horror': {
        Neuroticism: 0.8,
        Openness: 0.4,
        # ...
    }
}
```

### 2. Weighted Aggregation

```python
personality_score = Σ (genre_weight × user_rating × recency_weight)
```

- **Genre weight:** Based on THEME_MAP
- **User rating:** 1-5 stars given by user
- **Recency weight:** Recent books weighted higher

### 3. Diversity Bonus

```python
Openness += (unique_genres_read / 16) × 0.15
```

Reading across multiple genres boosts Openness score.

### 4. Archetype Detection

9 archetypes based on dominant trait combinations:

- 🦉 **The Philosopher** (Openness > 0.65)
- 🏆 **The Achiever** (Conscientiousness > 0.7)
- 💫 **The Empath** (Agreeableness > 0.7)
- 🌍 **The Explorer** (Extraversion > 0.65 && Openness > 0.5)
- 🌙 **The Dreamer** (Openness > 0.6 && Neuroticism > 0.5)
- 🔬 **The Analyst** (Conscientiousness > 0.6 && Openness > 0.5)
- 🔭 **The Visionary** (Openness > 0.7 && Conscientiousness > 0.5)
- 📜 **The Storyteller** (Agreeableness > 0.5 && Openness > 0.5)
- 📚 **The Scholar** (default fallback)

---

## 🎯 Recommendation Engine

### Strategy 1: Author Affinity (30% weight)

Identifies favorite authors by weighted ratings:

```python
author_score = Σ (book_rating / 5) × recency_weight
```

Recommends other works by top authors.

### Strategy 2: Content-Based (40% weight)

Uses **TF-IDF similarity** on book descriptions:

```python
similarity = cosine_similarity(user_books_vector, catalog_vector)
```

Finds books similar to highly-rated titles in your library.

### Strategy 3: Personality-Aligned (20% weight)

Matches user's dominant personality trait to genre affinities:

```python
trait_map = {
    'Openness': ['Philosophy', 'Literary Fiction', 'Poetry'],
    'Conscientiousness': ['Self-Help', 'Business', 'History'],
    # ...
}
```

### Strategy 4: Diversity Injection (10% weight)

Recommends from **unexplored genres** to expand reading horizons.

---

## 📂 Project Structure

```
BookSoul/
├── frontend/
│   ├── BookSoul.html              # Main app (single-file)
│   └── data/
│       └── merged.json            # 5k book catalog (optimized)
│
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── requirements.txt           # Python dependencies
│   ├── cache/
│   │   ├── tfidf_model.pkl        # Pre-trained TF-IDF model
│   │   └── tfidf_matrix.pkl       # 100k × vocab matrix
│   └── data/
│       ├── merged.csv             # Master book list (100k)
│       ├── merged.json            # Full catalog (19.7 MB)
│       └── nlp_recommendations.json  # Semantic knowledge graph
│
├── scripts/
│   └── optimize_catalog.py        # Reduce merged.json for frontend
│
├── .gitignore                     # Ignore large files, cache, etc.
├── README.md                      # This file
└── LICENSE                        # MIT License
```

---

## 🎨 UI/UX Highlights

- **Newspaper aesthetic:** Inspired by literary journals (Playfair Display, Source Serif)
- **Loading states:** Smooth transitions, skeleton screens
- **Drawer interaction:** Book details slide in from right
- **Responsive design:** Mobile, tablet, desktop optimized
- **No external dependencies:** Vanilla JS for maximum speed
- **Personality radar chart:** Interactive D3-style visualization via Chart.js
- **Color-coded genres:** 16 distinct color mappings

---

## 🧪 Testing

### Manual Test Cases

1. **Balanced profile:** Add 5 books from different genres → Personality should show balanced traits
2. **Philosophy spike:** Add 10 philosophy books → Openness should be > 0.7
3. **Recommendations:** Add 3+ books → "Discover" tab should show 4 sections
4. **Evolution tracking:** Add books from different years → Chart should visualize change over time

### API Testing

```bash
# Test recommendation endpoint (if backend is running)
curl -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"books": ["Sapiens", "Dune", "Meditations"], "top_n": 10}'
```

---

## 🚢 Deployment

### Frontend (Vercel) - FREE

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts, you'll get: https://booksoul-xyz.vercel.app
```

### Backend (Railway) - FREE

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up

# Set environment variable
railway variables set PORT=8000

# You'll get: https://booksoul-production.up.railway.app
```

### Update API URL in Frontend

After backend deployment, update `BookSoul.html`:

```javascript
// Change this line (search for API_URL):
const API_URL = 'https://booksoul-production.up.railway.app';
```

Then redeploy frontend:
```bash
vercel --prod
```

---

## 🎓 Academic Context

Built as a **portfolio project** demonstrating:

- **Full-stack development** (frontend + backend + ML pipeline)
- **Data science workflow** (ETL, feature engineering, model training)
- **System design** (modular architecture, scalable components)
- **Applied ML** (TF-IDF, semantic NLP, personality modeling)
- **Product thinking** (UX design, performance optimization)

### Potential Research Extension

- Validate personality inference against actual Big Five test results
- Compare TF-IDF vs Transformer embeddings for recommendation quality
- Study correlation between reading diversity and personality development
- A/B test different recommendation strategies

---

## 📚 Technical Highlights

### 1. **3-Tier Genre Classification**

Most book datasets have messy/inconsistent genres. BookSoul uses a hierarchical approach:

```python
# Tier 1: Exact title overrides (150+ books)
if title == "sapiens": return "History"

# Tier 2: Author mapping (150+ authors)
if author == "yuval noah harari": return "History"

# Tier 3: Keyword extraction
if "history" in category or "historical" in category:
    return "History"
```

### 2. **Personality Validation**

Unlike arbitrary trait assignments, BookSoul's mappings are grounded in:
- Psychology literature (Big Five framework)
- Genre reading preferences (empirical studies)
- Sanity-checked test cases

Example validation:
```python
test_cases = [
    {
        "books": ["Meditations", "Being and Time", "The Republic"],
        "expected_openness": > 0.7  # ✓ Passes
    }
]
```

### 3. **Performance Optimizations**

- **Lazy loading:** Books load in chunks
- **Debounced search:** 300ms delay prevents excessive filtering
- **LocalStorage caching:** User library persists across sessions
- **Optimized JSON:** 5k books instead of 100k (19MB → 3MB)

---

## 🔧 Installation & Setup

### Prerequisites

- Python 3.9+
- Node.js 16+ (for Vercel CLI, optional)
- Git

### Clone & Install

```bash
# Clone repository
git clone https://github.com/nadeem12-cloud/BookSoul.git
cd BookSoul

# Backend dependencies
cd backend
pip install -r requirements.txt

# No frontend dependencies (vanilla JS)
```

### Environment Variables (Optional)

Create `backend/.env`:

```env
# API Configuration
PORT=8000
ALLOWED_ORIGINS=http://localhost:8080,https://booksoul.vercel.app

# Model Paths
CACHE_DIR=cache/
DATA_DIR=data/
```

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Areas for Contribution

- [ ] Add more book datasets (OpenLibrary, LibraryThing)
- [ ] Implement deep learning embeddings (Sentence Transformers)
- [ ] Build social features (friend comparisons)
- [ ] Improve genre classification accuracy
- [ ] Add more personality archetypes
- [ ] Create mobile app (React Native)

---

## 🐛 Known Issues

- **Large dataset:** Backend uses 100k books; may be slow on first load
- **Genre mapping:** Some books may be misclassified (ongoing improvement)
- **No user accounts:** Library stored in browser LocalStorage only
- **Cover images:** Some books missing covers (fallback to placeholder)

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Goodreads Dataset** (Kaggle) - Book metadata
- **Open Library** - Cover images
- **Big Five Psychology** - Personality framework
- **FastAPI** - Modern Python web framework
- **Chart.js** - Data visualization
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

---

## 👤 Author

**Nadeem Memon**

- GitHub: [@nadeem12-cloud](https://github.com/nadeem12-cloud)
- LinkedIn: [Nadeem Memon](https://linkedin.com/in/nadeem-memon) *(Update with your actual profile)*
- Portfolio: [nadeem.dev](https://nadeem.dev) *(Update with your actual portfolio)*
- Email: nadeem@example.com *(Update with your actual email)*

---

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/nadeem12-cloud/BookSoul?style=social)
![GitHub forks](https://img.shields.io/github/forks/nadeem12-cloud/BookSoul?style=social)
![GitHub issues](https://img.shields.io/github/issues/nadeem12-cloud/BookSoul)
![GitHub pull requests](https://img.shields.io/github/issues-pr/nadeem12-cloud/BookSoul)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you or if you find it interesting!

---

## 📸 Screenshots

### Home Page
![Library View](https://via.placeholder.com/800x450/1a1209/faf6ef?text=Library+View)

### Personality Profile
![Personality Analysis](https://via.placeholder.com/800x450/1a1209/faf6ef?text=Personality+Profile)

### Recommendations
![Book Recommendations](https://via.placeholder.com/800x450/1a1209/faf6ef?text=Curated+Recommendations)

### Evolution Tracking
![Reading Evolution](https://via.placeholder.com/800x450/1a1209/faf6ef?text=Literary+Evolution)

---

## 🔗 Links

- **Live Demo:** [booksoul.vercel.app](https://booksoul.vercel.app)
- **API Docs:** [api.booksoul.app/docs](https://api.booksoul.app/docs) *(if backend deployed)*
- **GitHub:** [github.com/nadeem12-cloud/BookSoul](https://github.com/nadeem12-cloud/BookSoul)
- **Issues:** [github.com/nadeem12-cloud/BookSoul/issues](https://github.com/nadeem12-cloud/BookSoul/issues)

---

**Built with ❤️ by Nadeem | 2024**