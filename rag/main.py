import os
import tempfile
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()

from vector_db import VectorStore
from embeddings import EmbeddingManager
from llm import GroqLLM
from retreival import RAGRetriever
from data_ingestion import ingest_path, load_pdf

app = FastAPI(title="RAG API", version="1.0.0")

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialize components ──
embedding_manager = EmbeddingManager()
vector_store = VectorStore()
retriever = RAGRetriever(vector_store, embedding_manager)

try:
    llm = GroqLLM()
except Exception:
    llm = None

try:
    curriculum_llm = GroqLLM(model_name="compound-beta", temperature=0.3, max_tokens=4096)
except Exception:
    curriculum_llm = None

# ── Pydantic models ──
class IngestRequest(BaseModel):
    path: str
    chunk_size: int = 1000
    chunk_overlap: int = 200

class IngestResponse(BaseModel):
    status: str
    total_chunks: int
    message: str

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.0

class RetrievedDocument(BaseModel):
    id: str
    content: str
    metadata: dict
    similarity_score: float
    rank: int

class QueryResponse(BaseModel):
    query: str
    results: List[RetrievedDocument]
    count: int

class RAGRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.0

class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[dict]
    source_count: int

# ── Endpoints ──
@app.get("/")
def read_root():
    return {"status": "RAG API is running", "version": "1.0.0"}

@app.post("/ingest", response_model=IngestResponse)
def ingest_documents(request: IngestRequest):
    try:
        total_chunks = ingest_path(
            request.path, vector_store, embedding_manager,
            chunk_size=request.chunk_size, chunk_overlap=request.chunk_overlap
        )
        return IngestResponse(
            status="success",
            total_chunks=total_chunks,
            message=f"Ingested {total_chunks} chunks from {request.path}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest):
    results = retriever.retrieve(
        request.query, top_k=request.top_k, score_threshold=request.score_threshold
    )
    retrieved_docs = [
        RetrievedDocument(
            id=doc["id"],
            content=doc["content"],
            metadata=doc["metadata"],
            similarity_score=doc["similarity_score"],
            rank=doc["rank"],
        )
        for doc in results
    ]
    return QueryResponse(query=request.query, results=retrieved_docs, count=len(retrieved_docs))

@app.post("/rag", response_model=RAGResponse)
def rag_pipeline(request: RAGRequest):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM not initialized")
    results = retriever.retrieve(
        request.query, top_k=request.top_k, score_threshold=request.score_threshold
    )
    if not results:
        return RAGResponse(query=request.query, answer="No relevant documents found.", sources=[], source_count=0)
    context = "\n\n".join([doc["content"] for doc in results])
    answer = llm.generate(request.query, context)
    sources = [{"source": doc["metadata"].get("source_file", "unknown"), "page": doc["metadata"].get("page", "N/A"), "similarity_score": doc["similarity_score"]} for doc in results]
    return RAGResponse(query=request.query, answer=answer, sources=sources, source_count=len(sources))

@app.get("/status")
def get_status():
    try:
        doc_count = vector_store.collection.count()
        return {"status": "okay", "documents_in_store": doc_count, "collection_name": vector_store.collection_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))