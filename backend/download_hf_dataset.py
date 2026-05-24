import pandas as pd
from datasets import load_dataset
import traceback

try:
    print("Downloading Hugging Face Dataset euclaise/goodreads_100k ...")
    dataset = load_dataset('euclaise/goodreads_100k', split='train')
    print("Download complete. Converting to DataFrame...")
    df = dataset.to_pandas()
    # Rename columns to match what our NLP engine expects
    df = df.rename(columns={'desc': 'description', 'totalratings': 'ratings_count', 'rating': 'average_rating', 'author': 'authors', 'genre': 'categories'})
    
    # Fill NAs
    df['description'] = df['description'].fillna('')
    df['title'] = df['title'].fillna('')
    df['authors'] = df['authors'].fillna('')
    df['categories'] = df['categories'].fillna('')
    
    output_path = '../data/goodreads_100k.csv'
    df.to_csv(output_path, index=False)
    print(f"Success! Saved {len(df)} books with descriptions to {output_path}")
except Exception as e:
    print("Failed to download dataset.")
    traceback.print_exc()
