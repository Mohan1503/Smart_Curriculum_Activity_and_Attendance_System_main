import os
import tempfile
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env
load_dotenv()

from data_ingestion import ingest_path, load_pdf
from embeddings import EmbeddingManager
from llm import GroqLLM
from retreival import RAGRetriever
from vector_db import VectorStore

app = FastAPI(title="RAG API", version="1.0.0")

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialise shared components ────────────────────────────────────────────
embedding_manager = EmbeddingManager()
vector_store = VectorStore()
retriever = RAGRetriever(vector_store, embedding_manager)

# ── Standard LLM (for RAG pipeline) ────────────────────────────────────────
try:
    llm = GroqLLM()
    print("✓ Groq LLM initialized successfully!")
except ValueError as e:
    print(f"✗ Warning: {e}")
    llm = None
except Exception as e:
    print(f"✗ Error initializing LLM: {e}")
    llm = None

# ── Curriculum Insights LLM (compound-beta, higher token budget) ────────────
try:
    curriculum_llm = GroqLLM(
        model_name="compound-beta",
        temperature=0.3,
        max_tokens=4096,
    )
    print("✓ Curriculum insight LLM (compound-beta) initialized!")
except Exception as e:
    print(f"✗ Curriculum insight LLM failed to initialise: {e}")
    curriculum_llm = None


# ═══════════════════════════════════════════════════════════════════════════
#  Pydantic models
# ═══════════════════════════════════════════════════════════════════════════
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


class CurriculumInsight(BaseModel):
    topics_covered: List[str]
    missing_industry_skills: List[str]
    alignment_score: int
    strengths: List[str]
    recommendations: List[str]
    industry_trends: List[str]
    summary: str


# ═══════════════════════════════════════════════════════════════════════════
#  Endpoints
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
def read_root():
    return {"status": "RAG API is running", "version": "1.0.0"}


@app.post("/ingest", response_model=IngestResponse)
def ingest_documents(request: IngestRequest):
    """
    Ingest PDF files from a path (file or directory).

    Args:
        path: Path to PDF file or directory containing PDFs
        chunk_size: Size of text chunks (default: 1000)
        chunk_overlap: Overlap between chunks (default: 200)

    Returns:
        IngestResponse with status and total chunks ingested
    """
    try:
        total_chunks = ingest_path(
            request.path,
            vector_store,
            embedding_manager,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap,
        )
        return IngestResponse(
            status="success",
            total_chunks=total_chunks,
            message=f"Successfully ingested {total_chunks} chunks from {request.path}",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Path not found: {request.path}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during ingestion: {str(e)}",
        )


@app.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest):
    """
    Query the vector store for relevant documents.

    Args:
        query: Search query
        top_k: Number of top results (default: 5)
        score_threshold: Minimum similarity score (default: 0.0)

    Returns:
        QueryResponse with retrieved documents
    """
    try:
        results = retriever.retrieve(
            request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
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

        return QueryResponse(
            query=request.query,
            results=retrieved_docs,
            count=len(retrieved_docs),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during query: {str(e)}",
        )


@app.post("/rag", response_model=RAGResponse)
def rag_pipeline(request: RAGRequest):
    """
    Full RAG pipeline: retrieve relevant documents and generate answer using Groq LLM.

    Args:
        query: Search query
        top_k: Number of top results (default: 5)
        score_threshold: Minimum similarity score (default: 0.0)

    Returns:
        RAGResponse with generated answer and sources
    """
    if not llm:
        raise HTTPException(
            status_code=503,
            detail="llm not initialized. Set GROQ_API_KEY environment variable.",
        )

    try:
        # Retrieve relevant documents
        results = retriever.retrieve(
            request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )

        if not results:
            return RAGResponse(
                query=request.query,
                answer="No relevant documents found to answer the question.",
                sources=[],
                source_count=0,
            )

        # Prepare context from retrieved documents
        context = "\n\n".join([doc["content"] for doc in results])

        # Generate answer using LLM
        answer = llm.generate(request.query, context)

        # Prepare sources
        sources = [
            {
                "source": doc["metadata"].get("source_file", "unknown"),
                "page": doc["metadata"].get("page", "N/A"),
                "similarity_score": doc["similarity_score"],
            }
            for doc in results
        ]

        return RAGResponse(
            query=request.query,
            answer=answer,
            sources=sources,
            source_count=len(sources),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during RAG pipeline: {str(e)}",
        )


# ─── Curriculum Insights endpoint ───────────────────────────────────────────
@app.post("/curriculum/analyze")
async def analyze_curriculum(file: UploadFile = File(...)):
    """
    Accept a curriculum PDF, extract its text, and use Groq compound-beta
    to produce industry-aligned insights.
    """
    if not curriculum_llm:
        raise HTTPException(
            status_code=503,
            detail="Curriculum analysis LLM is not initialised. Check GROQ_API_KEY.",
        )

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Save uploaded file to a temp location so PyMuPDF can read it
    tmp_path = None
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        # Extract text via the existing loader
        from pathlib import Path
        documents = load_pdf(Path(tmp_path))
        full_text = "\n".join([doc.page_content for doc in documents])

        if not full_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract any text from the uploaded PDF.",
            )

        # Truncate to ~12 000 chars to stay within token limits
        truncated = full_text[:12000]

        analysis_prompt = f"""You are an expert education and industry analyst. Analyse the following curriculum document content and provide a detailed JSON response.

CURRICULUM CONTENT:
\"\"\"
{truncated}
\"\"\"

Provide your analysis as VALID JSON with exactly this structure (no markdown, no code fences, just raw JSON):
{{
  "topics_covered": ["list of main topics/subjects covered in the curriculum"],
  "missing_industry_skills": ["list of modern industry skills NOT covered but important, e.g. Cloud Computing, DevOps, AI/ML, Cybersecurity, Data Engineering, etc."],
  "alignment_score": <integer 0-100 representing how well curriculum aligns with current industry demands>,
  "strengths": ["list of strong points of this curriculum"],
  "recommendations": ["specific actionable recommendations to improve the curriculum"],
  "industry_trends": ["current industry trends relevant to this curriculum's domain"],
  "summary": "A 2-3 sentence executive summary of the curriculum's quality and industry readiness"
}}

Be specific, insightful, and actionable. Focus on practical industry relevance."""

        from langchain_core.messages import HumanMessage

        messages = [HumanMessage(content=analysis_prompt)]
        response = curriculum_llm.llm.invoke(messages)
        raw_answer = response.content

        # Try to parse as JSON; if it fails return the raw text in a wrapper
        import json
        try:
            # Strip potential markdown fences
            cleaned = raw_answer.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
            return parsed
        except json.JSONDecodeError:
            # Return a best-effort wrapper so the frontend still has something
            return {
                "topics_covered": [],
                "missing_industry_skills": [],
                "alignment_score": 0,
                "strengths": [],
                "recommendations": [],
                "industry_trends": [],
                "summary": raw_answer,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analysing curriculum: {str(e)}",
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/status")
def get_status():
    """Get vector store status."""
    try:
        doc_count = vector_store.collection.count()
        return {
            "status": "okay",
            "documents_in_store": doc_count,
            "collection_name": vector_store.collection_name,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting status: {str(e)}",
        )


# ─── Industry Trends & Curriculum Suggestions ──────────────────────────────
class IndustryInsightsRequest(BaseModel):
    department: str
    current_subjects: Optional[List[str]] = None


@app.post("/curriculum/industry-insights")
async def industry_insights(request: IndustryInsightsRequest):
    """
    Use Groq compound-beta (with built-in web search) to fetch
    real-time industry trends and suggest subjects/labs for a department.
    """
    if not curriculum_llm:
        raise HTTPException(
            status_code=503,
            detail="Curriculum LLM is not initialised. Check GROQ_API_KEY.",
        )

    dept = request.department.strip()
    existing = ""
    if request.current_subjects:
        existing = "\n".join(f"- {s}" for s in request.current_subjects)
        existing = f"\n\nThe department currently teaches these subjects:\n{existing}"

    prompt = f"""You are an expert education consultant and industry analyst.
Search the web for the LATEST industry trends, hiring demands, and technology shifts relevant to a **{dept}** department in 2025-2026.{existing}

Based on your research, provide a JSON response with EXACTLY this structure (no markdown fences, just raw JSON):
{{
  "trending_technologies": [
    {{
      "name": "Technology/Framework name",
      "description": "One-line description of why it is trending",
      "demand_level": "High | Medium | Rising"
    }}
  ],
  "suggested_subjects": [
    {{
      "name": "Subject name",
      "type": "Theory | Lab | Elective",
      "semester_fit": "Suggested semester (e.g. 5th or 6th)",
      "reason": "Why this subject will help students"
    }}
  ],
  "suggested_labs": [
    {{
      "name": "Lab / Workshop name",
      "tools": ["Tool1", "Tool2"],
      "description": "What students will learn"
    }}
  ],
  "industry_certifications": [
    {{
      "name": "Certification name",
      "provider": "Provider (e.g. AWS, Google, Microsoft)",
      "relevance": "Brief relevance note"
    }}
  ],
  "summary": "A 3-4 sentence executive summary of the current industry landscape for this department and key recommendations."
}}

Be specific, practical, and base your answer on real current industry data. Include at least 6 trending technologies, 5 suggested subjects, 4 suggested labs, and 4 certifications."""

    try:
        from langchain_core.messages import HumanMessage
        import json

        messages = [HumanMessage(content=prompt)]
        response = curriculum_llm.llm.invoke(messages)
        raw = response.content

        # Parse JSON
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            return parsed
        except json.JSONDecodeError:
            return {
                "trending_technologies": [],
                "suggested_subjects": [],
                "suggested_labs": [],
                "industry_certifications": [],
                "summary": raw,
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating industry insights: {str(e)}",
        )
