"""Configuration loaded from environment variables.

The service is meant to run in three modes:

1. **Production** — Ollama for embeddings + a real Qdrant.
2. **Local dev (no models)** — Ollama unreachable: we fall back to the
   deterministic hash embedder so the rest of the pipeline is exercisable.
3. **Tests** — embedder/store wired explicitly via dependency injection;
   env doesn't matter.

Env vars are read once at import; tests construct their own ``Settings``.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import List


def _split_csv(env_value: str | None, default: List[str]) -> List[str]:
    if not env_value:
        return default
    return [item.strip() for item in env_value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    host: str = os.getenv("KNOWLEDGE_HOST", "0.0.0.0")
    port: int = int(os.getenv("KNOWLEDGE_PORT", "8100"))

    # Ollama embedding endpoint
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    embed_model: str = os.getenv("KNOWLEDGE_EMBED_MODEL", "nomic-embed-text")
    # nomic-embed-text returns 768 dims; keep this aligned with embed_model.
    embed_dim: int = int(os.getenv("KNOWLEDGE_EMBED_DIM", "768"))

    # Qdrant — set ``QDRANT_URL`` (e.g. http://localhost:6333) for a server,
    # otherwise we use embedded mode against ``QDRANT_PATH``.
    qdrant_url: str | None = os.getenv("QDRANT_URL")
    qdrant_path: str = os.getenv("QDRANT_PATH", "./data/qdrant")
    collection: str = os.getenv("KNOWLEDGE_COLLECTION", "wikipedia")

    # Chunking
    chunk_tokens: int = int(os.getenv("KNOWLEDGE_CHUNK_TOKENS", "500"))
    chunk_overlap_tokens: int = int(os.getenv("KNOWLEDGE_CHUNK_OVERLAP", "50"))

    cors_origins: List[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ORIGINS"),
            [
                "http://localhost:3000",
                "http://localhost:8000",
                "http://localhost:8081",
                "http://localhost:19006",
            ],
        )
    )


settings = Settings()
