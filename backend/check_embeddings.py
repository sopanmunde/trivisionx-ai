import asyncio
import sys
import os

# Add the backend root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from src.rag.embeddings.google_embeddings import get_embeddings

async def main():
    try:
        embeddings = get_embeddings()
        text = "Hello world"
        vector = embeddings.embed_query(text)
        print(f"Success! Embedded text: '{text}'")
        print(f"Embedding dimension length: {len(vector)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
