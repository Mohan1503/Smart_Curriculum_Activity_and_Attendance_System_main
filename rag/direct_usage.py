"""
Direct RAG pipeline usage (without API server)
Useful for programmatic access without starting a FastAPI server
"""
import os
from data_ingestion import ingest_path
from embeddings import EmbeddingManager
from retreival import RAGRetriever
from llm import GroqLLM
from vector_db import VectorStore


def main():
    print("=" * 60)
    print("RAG Pipeline - Direct Usage")
    print("=" * 60)
    
    # 1. Initialize components
    print("\n1. Initializing components...")
    embedding_manager = EmbeddingManager()
    vector_store = VectorStore()
    retriever = RAGRetriever(vector_store, embedding_manager)
    
    try:
        llm = GroqLLM()
    except ValueError as e:
        print(f"Warning: {e}")
        print("Set GROQ_API_KEY environment variable to use LLM")
        llm = None
    
    # 2. Ingest PDFs
    print("\n2. Ingesting PDFs...")
    pdf_path = "D:/Smart-classroom/rag/ainotes.pdf"
    chunks_added = ingest_path(
        pdf_path,
        vector_store,
        embedding_manager,
        chunk_size=1000,
        chunk_overlap=200,
    )
    print(f"✓ Added {chunks_added} chunks")
    
    # 3. Query retrieval only
    print("\n3. Retrieval-only query...")
    query = "What is attention mechanism?"
    results = retriever.retrieve(query, top_k=3)
    print(f"✓ Found {len(results)} documents")
    for i, doc in enumerate(results, 1):
        print(f"\n  [{i}] Score: {doc['similarity_score']:.2f}")
        print(f"      Source: {doc['metadata'].get('source_file', 'N/A')}")
        print(f"      Preview: {doc['content'][:150]}...")
    
    # 4. Full RAG pipeline with LLM
    if llm:
        print("\n4. Full RAG pipeline (Retrieve + Generate)...")
        context = "\n\n".join([doc["content"] for doc in results])
        answer = llm.generate(query, context)
        print(f"\nQuery: {query}")
        print(f"\nAnswer:\n{answer}")
        print(f"\nSources:")
        for doc in results:
            print(f"  - {doc['metadata'].get('source_file', 'N/A')} (Score: {doc['similarity_score']:.2f})")
    else:
        print("\n4. Skipping LLM generation (API key not set)")
    
    print("\n" + "=" * 60)
    print("Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
