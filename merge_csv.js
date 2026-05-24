/**
 * merge_csv.js
 * Merges data/data.csv (primary, has categories+ratings) with
 * data/books.csv (secondary, title/author only) into data/merged.csv
 * Deduplicates by normalized (title + author) key.
 */

const fs   = require('fs');
const path = require('path');

// ── Normalize a string for dedup comparison ─────────────────────────────────
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// ── Simple line-by-line CSV parser (handles quoted fields) ──────────────────
function parseCSVLine(line, delimiter = ',') {
  const fields = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === delimiter && !inQ) {
      fields.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields.map(f => f.trim());
}

// ── Read a whole CSV file into [{colName: value}] rows ──────────────────────
function readCSV(filePath, delimiter = ',') {
  console.log(`Reading ${filePath} ...`);
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const header = parseCSVLine(lines[0], delimiter).map(h => h.toLowerCase().replace(/"/g,'').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = parseCSVLine(line, delimiter);
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (vals[idx] || '').replace(/^"|"$/g, '').trim(); });
    rows.push(obj);
  }
  console.log(`  → ${rows.length} rows`);
  return rows;
}

// ── Main ────────────────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');

// 1. Load primary CSV (data.csv) — has title, authors, categories, average_rating
const primary = readCSV(path.join(dataDir, 'data.csv'));
const seen = new Set();
const merged = [];

for (const row of primary) {
  const title  = row['title']  || '';
  const author = (row['authors'] || 'Unknown').split(';')[0].trim();
  const key    = norm(title) + '|' + norm(author);
  if (!title || seen.has(key)) continue;
  seen.add(key);
  merged.push({
    title,
    author,
    category  : row['categories']     || '',
    rating    : row['average_rating'] || '3',
    year      : row['published_year'] || '',
    thumbnail : row['thumbnail']      || '',
    source    : 'primary'
  });
}

console.log(`Primary unique books: ${merged.length}`);

// 2. Load secondary CSV (books.csv) — semicolon-delimited, no genre/rating
const secondary = readCSV(path.join(dataDir, 'books.csv'), ';');

let added = 0;
for (const row of secondary) {
  const title  = row['book-title']  || '';
  const author = row['book-author'] || 'Unknown';
  const key    = norm(title) + '|' + norm(author);
  if (!title || seen.has(key)) continue;
  seen.add(key);
  merged.push({
    title,
    author,
    category  : '',
    rating    : '3',
    year      : row['year-of-publication'] || '',
    thumbnail : '',
    source    : 'secondary'
  });
  added++;
}

console.log(`Added from books.csv: ${added}`);
console.log(`Total merged: ${merged.length}`);

// 3. Write output merged.json for faster loading
const jsonRows = merged.map(r => [
  r.title, r.author, r.category, parseFloat(r.rating) || 3, r.year, r.thumbnail
]);

const outPath = path.join(dataDir, 'merged.json');
fs.writeFileSync(outPath, JSON.stringify(jsonRows), 'utf8');
console.log(`✅ Written to ${outPath}`);
