# Quick Start Guide

## Prerequisites
- Python 3.8+
- Groq API Key (get from https://console.groq.com)

## Installation

1. **Install dependencies:**
   ```bash
   cd rag
   pip install -r requirements.txt
   ```

2. **Set Groq API Key:**

   **Windows (PowerShell):**
   ```powershell
   $env:GROQ_API_KEY="your-groq-api-key-here"
   ```

   **Windows (Command Prompt):**
   ```cmd
   set GROQ_API_KEY=your-groq-api-key-here
   ```

   **Linux/Mac:**
   ```bash
   export GROQ_API_KEY="your-groq-api-key-here"
   ```

   **Or create `.env` file:**
   ```
   GROQ_API_KEY=your-groq-api-key-here
   ```

## Running the API

1. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

2. **In a new terminal, ingest PDFs:**
   ```bash
   curl -X POST http://localhost:8000/ingest \
     -H "Content-Type: application/json" \
     -d '{"path": "D:/Smart-classroom/rag/ainotes.pdf"}'
   ```

3. **Query with LLM:**
   ```bash
   curl -X POST http://localhost:8000/rag \
     -H "Content-Type: application/json" \
     -d '{"query": "What is attention mechanism?", "top_k": 5}'
   ```

## Interactive Testing

Visit http://localhost:8000/docs for Swagger UI to test endpoints interactively.

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/ingest` | Ingest PDF files |
| POST | `/query` | Retrieve documents (no LLM) |
| POST | `/rag` | Retrieve + Generate (with Groq LLM) |
| GET | `/status` | Vector store status |

## Testing with Python

```python
from test_api import RAGClient

client = RAGClient()
result = client.rag("What is attention mechanism?", top_k=5)
print(result['answer'])
```

Or run the full test:
```bash
python test_api.py
```

## Troubleshooting

**"GROQ_API_KEY not set"**
- Check that your API key is set correctly
- Restart the terminal/server after setting the variable

**"ModuleNotFoundError"**
- Run `pip install -r requirements.txt`
- Make sure you're in the correct directory

**Connection refused**
- Make sure the server is running with `uvicorn main:app --reload`
- Check that port 8000 is not in use

## Features

- ✅ PDF ingestion with chunking
- ✅ Semantic search with embeddings
- ✅ LLM-powered answer generation (Groq)
- ✅ Citation sources
- ✅ FastAPI Swagger UI documentation
- ✅ Production-ready vectorstore (ChromaDB)
