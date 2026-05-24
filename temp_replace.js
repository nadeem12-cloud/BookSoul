const fs = require('fs');

let html = fs.readFileSync('BookSoul.html', 'utf8');

const newFunc = `    function generateRecs() {
      const empty = document.getElementById('rec-empty');
      const content = document.getElementById('rec-content');
      if (library.length < 2) { empty.style.display = 'block'; content.innerHTML = ''; return }
      empty.style.display = 'none';
      
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

      const nlpRecs = [];
      const authorRecs = [];
      const contentRecs = [];
      
      // 1. Semantic NLP Graph Lookup
      if (Object.keys(NLP_GRAPH).length > 0) {
        // Collect highly rated books by user
        const loved = library.filter(b => b.r >= 4);
        // Map NLP links
        const aggregatedNLP = {};
        loved.forEach(b => {
          const links = NLP_GRAPH[b.t.toLowerCase()] || [];
          links.forEach(link => {
            if (!read.has(link.t.toLowerCase())) {
              aggregatedNLP[link.t] = (aggregatedNLP[link.t] || 0) + link.score;
            }
          });
        });
        
        // Find top aggregated semantic recommendations
        const sortedNLP = Object.entries(aggregatedNLP)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(x => x[0]);

        for (let i = 0; i < CATALOG.length; i++) {
            const b = CATALOG[i];
            if (sortedNLP.includes(b.t) && nlpRecs.length < 6) {
                nlpRecs.push({ book: b, reason: \`Semantically similar plot to books you rated highly\` });
                read.add(b.t.toLowerCase());
            }
        }
      }

      // 2. Traditional lookups
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
        htmlOut += \`<div class="rec-section-title">✨ Powered by NLP Semantic Engine <span>Graph Match</span></div><div class="rec-grid">\`;
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

const regex = /    function generateRecs\(\) \{[\s\S]*? content\.innerHTML = html \|\| \`<div class="empty-state"><span class="empty-icon">🎉<\/span><div class="empty-title">You've conquered the catalog!<\/div><\/div>\`;\n    \}/;

html = html.replace(regex, newFunc);
fs.writeFileSync('BookSoul.html', html, 'utf8');
console.log('Successfully updated BookSoul.html');
