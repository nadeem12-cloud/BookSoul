import json
import os

print("📚 Optimizing BookSoul catalog for Vercel deployment...")

# Load the massive 19MB file
with open('data/merged.json', 'r', encoding='utf-8') as f:
    all_books = json.load(f)

print(f"✓ Loaded {len(all_books)} books")

# Sort by rating (assuming rating is at index 3)
# Format: [title, author, category, rating, description, image_url]
all_books_sorted = sorted(all_books, key=lambda x: float(x[3] or 0), reverse=True)

# Take top 5000 books
top_books = all_books_sorted[:5000]

# Save optimized version
output_path = 'frontend/data/merged.json'
os.makedirs('frontend/data', exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(top_books, f, ensure_ascii=False)

# Check new size
new_size = os.path.getsize(output_path) / 1024 / 1024

print(f"✅ Optimized catalog created!")
print(f"   Books: {len(top_books):,}")
print(f"   Size: {new_size:.2f} MB")
print(f"   Location: {output_path}")

if new_size < 4.5:
    print(f"✓ Perfect! Under Vercel's 4.5MB limit")
else:
    print(f"⚠️  Still large. Reducing to 3000 books...")
    top_books = all_books_sorted[:3000]
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(top_books, f, ensure_ascii=False)
    new_size = os.path.getsize(output_path) / 1024 / 1024
    print(f"✓ New size: {new_size:.2f} MB with {len(top_books)} books")