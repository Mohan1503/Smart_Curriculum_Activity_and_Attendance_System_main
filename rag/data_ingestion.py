import sys
from pathlib import Path
from typing import Iterable, List

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from embeddings import EmbeddingManager
from vector_db import VectorStore


def collect_pdf_files(path: str) -> List[Path]:
    target = Path(path)
    if target.is_file():
        return [target]
    if target.is_dir():
        return list(target.glob("**/*.pdf"))
    return []


def load_pdf(file_path: Path):
    loader = PyMuPDFLoader(str(file_path))
    documents = loader.load()
    for doc in documents:
        doc.metadata["source_file"] = file_path.name
        doc.metadata["file_path"] = str(file_path)
        doc.metadata["file_type"] = "pdf"
    return documents


def split_documents(documents: Iterable, chunk_size: int = 600, chunk_overlap: int = 150):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )
    return text_splitter.split_documents(list(documents))


def ingest_path(
    path: str,
    vector_store: VectorStore,
    embedding_manager: EmbeddingManager,
    chunk_size: int = 600,
    chunk_overlap: int = 150,
) -> int:
    pdf_files = collect_pdf_files(path)
    if not pdf_files:
        print(f"No PDF files found for path: {path}")
        return 0

    total_chunks = 0
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file}")
        documents = load_pdf(pdf_file)
        chunks = split_documents(documents, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        if not chunks:
            print("  No chunks produced")
            continue

        texts = [doc.page_content for doc in chunks]
        embeddings = embedding_manager.generate_embeddings(texts)
        vector_store.add_documents(chunks, embeddings)
        total_chunks += len(chunks)
        print(f"  Stored {len(chunks)} chunks")

    print(f"Total chunks stored: {total_chunks}")
    return total_chunks


def main(argv: List[str]) -> int:
    if len(argv) < 2:
        print("Usage: py data_ingestion.py <pdf_file_or_directory>")
        return 1

    input_path = argv[1]
    embedding_manager = EmbeddingManager()
    vector_store = VectorStore()
    ingest_path(input_path, vector_store, embedding_manager)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))