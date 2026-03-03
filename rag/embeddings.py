from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer


class EmbeddingManager:
    """Generate embeddings using SentenceTransformer."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self) -> None:
        try:
            print(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print(
                "Model loaded successfully. Embedding dimension: "
                f"{self.model.get_sentence_embedding_dimension()}"
            )
        except Exception as exc:
            print(f"Error loading model {self.model_name}: {exc}")
            raise

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        if not self.model:
            raise ValueError("Model not loaded")

        if not texts:
            return np.array([])

        print(f"Generating embeddings for {len(texts)} texts...")
        embeddings = self.model.encode(texts, show_progress_bar=True)
        print(f"Generated embeddings with shape: {embeddings.shape}")
        return embeddings
