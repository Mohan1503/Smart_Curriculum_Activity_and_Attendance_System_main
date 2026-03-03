"""
Simple test client for RAG API
"""
import requests
import json
from typing import Dict, Any


class RAGClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    def health_check(self) -> Dict[str, Any]:
        """Check if API is running."""
        response = requests.get(f"{self.base_url}/")
        return response.json()

    def ingest(self, path: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> Dict[str, Any]:
        """Ingest PDFs from path."""
        payload = {
            "path": path,
            "chunk_size": chunk_size,
            "chunk_overlap": chunk_overlap,
        }
        response = requests.post(f"{self.base_url}/ingest", json=payload)
        response.raise_for_status()
        return response.json()

    def query(self, query: str, top_k: int = 5, score_threshold: float = 0.0) -> Dict[str, Any]:
        """Query documents."""
        payload = {
            "query": query,
            "top_k": top_k,
            "score_threshold": score_threshold,
        }
        response = requests.post(f"{self.base_url}/query", json=payload)
        response.raise_for_status()
        return response.json()

    def rag(self, query: str, top_k: int = 5, score_threshold: float = 0.0) -> Dict[str, Any]:
        """Full RAG pipeline: retrieve documents and generate answer."""
        payload = {
            "query": query,
            "top_k": top_k,
            "score_threshold": score_threshold,
        }
        response = requests.post(f"{self.base_url}/rag", json=payload)
        response.raise_for_status()
        return response.json()

    def get_status(self) -> Dict[str, Any]:
        """Get vector store status."""
        response = requests.get(f"{self.base_url}/status")
        return response.json()


def main():
    client = RAGClient()

    print("=" * 60)
    print("RAG API Test Client")
    print("=" * 60)

    # 1. Health check
    print("\n1. Health Check:")
    try:
        status = client.health_check()
        print(json.dumps(status, indent=2))
    except Exception as e:
        print(f"Error: {e}")
        return

    # 2. Get status
    print("\n2. Vector Store Status:")
    try:
        status = client.get_status()
        print(json.dumps(status, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    # 3. Ingest PDFs
    print("\n3. Ingesting PDFs:")
    try:
        result = client.ingest("D:/Smart-classroom/rag/ainotes.pdf")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")

    # 4. Query
    print("\n4. Querying Documents (Retrieve Only):")
    queries = [
        "What is attention mechanism?",
        "machine learning",
        "neural networks",
    ]
    
    for q in queries:
        try:
            print(f"\nQuery: {q}")
            result = client.query(q, top_k=3)
            print(f"Found {result['count']} documents")
            for doc in result['results']:
                print(f"  [{doc['rank']}] Score: {doc['similarity_score']:.2f}")
                print(f"      Source: {doc['metadata'].get('source_file', 'N/A')}")
                print(f"      Preview: {doc['content'][:100]}...")
        except Exception as e:
            print(f"Error: {e}")

    # 5. RAG Pipeline (Retrieve + Generate with LLM)
    print("\n5. RAG Pipeline (Retrieve + Generate with LLM):")
    rag_queries = [
        "What is attention mechanism?",
        "Explain machine learning",
    ]
    
    for q in rag_queries:
        try:
            print(f"\nQuery: {q}")
            result = client.rag(q, top_k=3)
            print(f"Answer: {result['answer'][:200]}...")
            print(f"Sources ({result['source_count']}):")
            for src in result['sources']:
                print(f"  - {src['source']} (Score: {src['similarity_score']:.2f})")
        except Exception as e:
            print(f"Error: {e}")

    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
