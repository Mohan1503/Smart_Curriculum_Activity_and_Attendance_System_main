# RAG API Usage Guide

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Groq API Key
Get your API key from [console.groq.com](https://console.groq.com)

**On Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="your-api-key-here"
```

**On Windows (Command Prompt):**
```cmd
set GROQ_API_KEY=your-api-key-here
```

**On Linux/Mac:**
```bash
export GROQ_API_KEY="your-api-key-here"
```

Or create a `.env` file in the rag directory:
```
GROQ_API_KEY=your-api-key-here
```

## Starting the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Health Check
```
GET /
```
Returns API status and version.

**Response:**
```json
{
  "status": "RAG API is running",
  "version": "1.0.0"
}
```

---

### 2. Ingest Documents
```
POST /ingest
```
Ingest PDF files from a file path or directory.

**Request Body:**
```json
{
  "path": "D:/Smart-classroom/rag/ainotes.pdf",
  "chunk_size": 1000,
  "chunk_overlap": 200
}
```

**Parameters:**
- `path` (required): Path to PDF file or directory containing PDFs
- `chunk_size` (optional): Size of text chunks (default: 1000)
- `chunk_overlap` (optional): Overlap between chunks (default: 200)

**Response:**
```json
{
  "status": "success",
  "total_chunks": 45,
  "message": "Successfully ingested 45 chunks from D:/Smart-classroom/rag/ainotes.pdf"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"path": "D:/Smart-classroom/rag/ainotes.pdf"}'
```

---

### 3. Query Documents
```
POST /query
```
Query the vector store for relevant documents.

**Request Body:**
```json
{
  "query": "What is attention mechanism?",
  "top_k": 5,
  "score_threshold": 0.0
}
```

**Parameters:**
- `query` (required): Search query
- `top_k` (optional): Number of top results (default: 5)
- `score_threshold` (optional): Minimum similarity score (default: 0.0)

**Response:**
```json
{
  "query": "What is attention mechanism?",
  "count": 3,
  "results": [
    {
      "id": "doc_a1b2c3d4_0",
      "content": "Attention mechanism is a neural network technique...",
      "metadata": {
        "source_file": "ainotes.pdf",
        "page": 5,
        "content_length": 542
      },
      "similarity_score": 0.87,
      "rank": 1
    }
  ]
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is attention mechanism?", "top_k": 3}'
```

---

### 4. RAG Pipeline (Retrieve + Generate with LLM)
```
POST /rag
```
Query documents and generate an answer using Groq LLM.

**Request Body:**
```json
{
  "query": "What is attention mechanism?",
  "top_k": 5,
  "score_threshold": 0.0
}
```

**Parameters:**
- `query` (required): Search query
- `top_k` (optional): Number of top documents to retrieve (default: 5)
- `score_threshold` (optional): Minimum similarity score (default: 0.0)

**Response:**
```json
{
  "query": "What is attention mechanism?",
  "answer": "Attention mechanism is a neural network technique that allows models to focus on specific parts of the input when processing information. It was introduced in the 'Attention Is All You Need' paper...",
  "sources": [
    {
      "source": "ainotes.pdf",
      "page": "N/A",
      "similarity_score": 0.87
    }
  ],
  "source_count": 1
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:8000/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "What is attention mechanism?", "top_k": 5}'
```

**Requirements:**
- Set `GROQ_API_KEY` environment variable with your Groq API key

---

### 5. Get Status
```
GET /status
```
Get current vector store status.

**Response:**
```json
{
  "status": "okay",
  "documents_in_store": 45,
  "collection_name": "pdf_documents"
}
```

**Example with curl:**
```bash
curl http://localhost:8000/status
```

---

## Workflow Example

1. **Set API key:**
   ```bash
   set GROQ_API_KEY=your-api-key-here
   ```

2. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

3. **Ingest PDFs:**
   ```bash
   curl -X POST http://localhost:8000/ingest \
     -H "Content-Type: application/json" \
     -d '{"path": "D:/Smart-classroom/rag/data"}'
   ```

4. **Check status:**
   ```bash
   curl http://localhost:8000/status
   ```

5. **Query with LLM (recommended):**
   ```bash
   curl -X POST http://localhost:8000/rag \
     -H "Content-Type: application/json" \
     -d '{"query": "What is attention mechanism?", "top_k": 5}'
   ```

6. **Or just retrieve without LLM:**
   ```bash
   curl -X POST http://localhost:8000/query \
     -H "Content-Type: application/json" \
     -d '{"query": "machine learning", "top_k": 5}'
   ```

---

## Interactive Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.
