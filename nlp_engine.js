const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Common stopwords to filter out from processing
const sw = new Set(["the", "and", "a", "of", "to", "in", "is", "that", "it", "with", "as", "for", "was", "on", "are", "by", "an", "this", "but", "from", "at", "who", "he", "she", "his", "her", "their", "they", "will", "be", "has", "have", "not", "about", "which", "or", "one", "all", "you", "we", "can", "out", "up", "if", "more", "when", "some", "into", "what", "its", "so", "them", "my", "me", "there", "no", "only", "other", "very", "were", "been", "had", "would", "could", "should", "your", "do", "does", "did", "how", "then", "itself", "our", "those", "these", "than", "any", "because", "while", "where", "after", "such", "through", "over", "just", "now", "also", "most"]);

function tokenize(text) {
  const words = text.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
  return words.map(w => {
    if (w.endsWith('ing')) return w.slice(0, -3);
    if (w.endsWith('ly')) return w.slice(0, -2);
    if (w.endsWith('es')) return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  }).filter(w => !sw.has(w) && w.length >= 3);
}

const books = [];
console.log('Reading data.csv...');

fs.createReadStream(path.join(__dirname, 'data', 'data.csv'))
  .pipe(csv())
  .on('data', (row) => {
    let title = (row.title || '').trim();
    let desc = (row.description || '').trim();
    // Only process books with a substantial plot description
    if (title && desc && desc.length > 30) {
      books.push({ title, desc });
    }
  })
  .on('end', () => {
    console.log(`Loaded ${books.length} books with descriptions. Extracting semantic features...`);
    buildTFIDF();
  });

function buildTFIDF() {
  // Step 1: Tokenize and apply our regex stemmer
  const docs = books.map(b => tokenize(b.desc));

  console.log('Calculating aggregate document frequencies (DF)...');
  const df = {};
  docs.forEach(tokens => {
    const unique = new Set(tokens);
    for (const t of unique) {
      df[t] = (df[t] || 0) + 1;
    }
  });

  const N = docs.length;

  // Step 2: Vocabulary filtering
  // Ignore terms that appear in < 2 books, or in > 50% of the books (meaningless frequent terms)
  const vocab = Object.keys(df).filter(t => df[t] >= 2 && df[t] < N * 0.5);
  const vIndex = new Map(vocab.map((t, i) => [t, i]));
  const V = vocab.length;
  console.log(`Knowledge Graph Vocabulary size: ${V} unique word stems`);

  // Calculate Inverse Document Frequency (IDF)
  const idf = new Float32Array(V);
  for (let i = 0; i < V; i++) {
    idf[i] = Math.log(N / (1 + df[vocab[i]]));
  }

  console.log('Building L2 normalized TF-IDF semantic vectors...');
  const vectors = [];
  const invertedIndex = Array.from({ length: V }, () => []);

  for (let docId = 0; docId < N; docId++) {
    const tokens = docs[docId];
    const tf = {};
    for (const t of tokens) {
      const idx = vIndex.get(t);
      if (idx !== undefined) {
        tf[idx] = (tf[idx] || 0) + 1;
      }
    }

    let norm = 0;
    const vecList = [];
    for (const idxStr in tf) {
      const idx = parseInt(idxStr);
      const val = tf[idx] * idf[idx];
      vecList.push({ idx, val });
      norm += val * val; // Sum of squares for L2 norm
    }
    
    // Normalize vector
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (const v of vecList) v.val /= norm;
    }
    vectors.push(vecList);

    // Build Inverted Index to hyper-optimize Cosine Similarity matrix calculation
    for (const v of vecList) {
      invertedIndex[v.idx].push({ docId, val: v.val });
    }
  }

  console.log('Generating Cosine Similarity Matrix (O(N^2) optimized lookup)...');
  const recommendations = {};

  let computed = 0;
  for (let i = 0; i < N; i++) {
    const scores = new Float32Array(N);
    const v1 = vectors[i];
    
    // Fast dot product using inverted index
    for (const term of v1) {
      const postings = invertedIndex[term.idx];
      for (const p of postings) {
        if (p.docId !== i) {
          scores[p.docId] += term.val * p.val;
        }
      }
    }

    // Keep top 12 matches
    const top = [];
    for (let j = 0; j < N; j++) {
      if (scores[j] > 0.05) { // Only keep if score is tangibly correlated
        top.push({ docId: j, score: scores[j] });
      }
    }
    top.sort((a, b) => b.score - a.score);
    
    // Add to recommendation graph mapped by lowercased title
    recommendations[books[i].title.toLowerCase()] = top.slice(0, 12).map(x => ({
      t: books[x.docId].title,
      score: Math.round(x.score * 100) // Keep as percentage probability correlation 0-100
    }));

    computed++;
    if (computed % 1000 === 0) console.log(`Processed ${computed}/${N} book links...`);
  }

  // Final Output
  const outPath = path.join(__dirname, 'data', 'nlp_recommendations.json');
  fs.writeFileSync(outPath, JSON.stringify(recommendations));
  console.log(`✅ Semantic knowledge graph successfully aggregated & saved to ${outPath}`);
}
