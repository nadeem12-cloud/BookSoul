const fs = require('fs');

let html = fs.readFileSync('BookSoul.html', 'utf8');

// 1. Remove NLP_GRAPH loading logic from loadCatalog
const loadCatalogRegex = /    let NLP_GRAPH = \{\};\n    async function loadCatalog\(\) \{[\s\S]*?if \(!mergedRes\.ok\) throw new Error\('Failed to load merged catalog: ' \+ mergedRes\.status\);\n        const rows = await mergedRes\.json\(\);\n        \n        if \(nlpRes && nlpRes\.ok\) \{\n          NLP_GRAPH = await nlpRes\.json\(\);\n          console\.log\(`✅ Loaded NLP Knowledge Graph with \$\{Object\.keys\(NLP_GRAPH\)\.length\} semantic nodes\.`\);\n        \}/;

const newLoadCatalog = `    async function loadCatalog() {
      try {
        const mergedRes = await fetch('data/merged.json');
        if (!mergedRes.ok) throw new Error('Failed to load merged catalog: ' + mergedRes.status);
        const rows = await mergedRes.json();`;

html = html.replace(loadCatalogRegex, newLoadCatalog);

// 2. Rewrite generateRecs to be async and call the Python backend
const generateRecsRegex = /    function generateRecs\(\) \{[\s\S]*? content\.innerHTML = htmlOut \|\| \`<div class="empty-state"><span class="empty-icon">🎉<\/span><div class="empty-title">You've conquered the catalog!<\/div><\/div>\`;\n    \}/;

const newGenerateRecs = `    async function generateRecs() {
      const empty = document.getElementById('rec-empty');
      const content = document.getElementById('rec-content');
      if (library.length < 2) { empty.style.display = 'block'; content.innerHTML = ''; return }
      empty.style.display = 'none';
      content.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink4);font-family:var(--sans)">Generating Semantic Machine Learning Recommendations...</div>';
      
      const s = inferPersonality();
      const read = new Set(library.map(b => b.t.toLowerCase()));
      
      // Determine user tastes
      const gScore = {}; const aScore = {};
      library.forEach(b => {
        const w = b.r / 5;
        gScore[b.g] = (gScore[b.g] || 0) + w;
        aScore[b.a] = (aScore[b.a] || 0) + w;
      });

      if (!CATALOG._sorted) {
        CATALOG.sort((a, b) => b.r - a.r);
        CATALOG._sorted = true;
      }

      const topGenres = Object.entries(gScore).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]);
      const topAuthors = Object.entries(aScore).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]);

      let nlpRecs = [];
      const authorRecs = [];
      const contentRecs = [];
      
      // 1. Python ML Backend Lookup (FastAPI Scikit-Learn Engine)
      const lovedTitles = library.filter(b => b.r >= 4).map(b => b.t);
      if (lovedTitles.length > 0) {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ liked_titles: lovedTitles })
          });
          if (res.ok) {
            const data = await res.json();
            nlpRecs = data.recommendations.map(r => ({
              book: { t: r.title, a: r.author, g: r.genre, r: r.rating, i: r.thumbnail },
              reason: \`Semantic Match (\${r.score}% TF-IDF correlation)\`
            }));
            nlpRecs.forEach(r => read.add(r.book.t.toLowerCase()));
          }
        } catch(e) {
          console.warn("Python backend not reachable:", e);
        }
      }

      // 2. Traditional fallback lookups
      for (let i = 0; i < CATALOG.length; i++) {
        const b = CATALOG[i];
        const tLower = b.t.toLowerCase();
        if (read.has(tLower)) continue;

        if (authorRecs.length < 4 && topAuthors.includes(b.a)) {
          authorRecs.push({ book: b, reason: \`Based on your high ratings for \${b.a}\` }); 
          read.add(tLower);
        }
        else if (contentRecs.length < 6 && topGenres.includes(b.g)) {
          contentRecs.push({ book: b, reason: \`You've highly rated books in \${b.g} — this is a natural next step\` }); 
          read.add(tLower);
        }

        if (authorRecs.length >= 4 && contentRecs.length >= 6) break;
      }

      function rcHTML(bObj) {
        const b = bObj.book;
        const c = SPINES[b.g] || '#888';
        const coverHtml = b.i
          ? \`<img src="\${b.i}" alt="\${b.t}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="rec-card-cover-placeholder" style="background:\${c};display:none">
           <div class="ph-title">\${b.t}</div>
         </div>\`
          : \`<div class="rec-card-cover-placeholder" style="background:\${c}">
           <span style="font-size:24px">📖</span>
           <div class="ph-title">\${b.t}</div>
         </div>\`;
        return \`<div class="rec-card">
      <div class="rec-card-cover" style="background:\${c}">\${coverHtml}</div>
      <div class="rec-card-body">
        <div class="rec-card-title">\${b.t}</div>
        <div class="rec-card-author">\${b.a}</div>
        <div class="rec-card-reason">\${bObj.reason}</div>
        <div class="rec-card-footer">
          <span class="genre-pill" style="background:\${hexA(GENRE_COLORS[b.g] || '#888', .1)};color:\${GENRE_COLORS[b.g] || '#888'};font-size:11px;padding:3px 8px;border-radius:2px">\${b.g}</span>
          <span style="font-size:12px;color:var(--gold)">★ \${b.r}</span>
        </div>
      </div>
    </div>\`;
      }

      let htmlOut = '';
      if (nlpRecs.length) {
        htmlOut += \`<div class="rec-section-title">✨ Powered by Python ML Semantic Engine <span>TF-IDF Vector Space Match</span></div><div class="rec-grid">\`;
        htmlOut += nlpRecs.map(rcHTML).join('');
        htmlOut += \`</div>\`;
      }
      if (authorRecs.length) {
        htmlOut += \`<div class="rec-section-title">Because you loved these authors <span>Author Match</span></div><div class="rec-grid">\`;
        htmlOut += authorRecs.map(rcHTML).join('');
        htmlOut += \`</div>\`;
      }
      if (contentRecs.length) {
        htmlOut += \`<div class="rec-section-title">Based on your taste <span>Content Match</span></div><div class="rec-grid">\`;
        htmlOut += contentRecs.map(rcHTML).join('');
        htmlOut += \`</div>\`;
      }

      content.innerHTML = htmlOut || \`<div class="empty-state"><span class="empty-icon">🎉</span><div class="empty-title">You've conquered the catalog!</div></div>\`;
    }`;

html = html.replace(generateRecsRegex, newGenerateRecs);

// ensure the showPage handler accounts for async generateRecs
const showPageRegex = /if \(id === 'recommendations'\) generateRecs\(\);/;
const newShowPage = `if (id === 'recommendations') generateRecs();`;
html = html.replace(showPageRegex, newShowPage); // already works fine without await since it updates innerHTML inside

fs.writeFileSync('BookSoul.html', html, 'utf8');
console.log('BookSoul.html updated for Python integration!');
