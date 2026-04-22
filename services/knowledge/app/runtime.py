"""Runtime: holds the embedder + store + ingestor, picks impls from settings."""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Optional

from app.config import Settings
from app.embeddings import Embedder, HashEmbedder, OllamaEmbedder
from app.ingest import Ingestor
from app.store import InMemoryStore, QdrantStore, VectorStore

log = logging.getLogger("sallie.knowledge.runtime")


@dataclass
class Runtime:
    settings: Settings
    embedder: Embedder
    store: VectorStore
    ingestor: Ingestor
    embedder_kind: str  # "ollama" | "hash"
    store_kind: str  # "qdrant_server" | "qdrant_embedded" | "memory"

    @classmethod
    def from_settings(
        cls,
        settings: Settings,
        *,
        embedder: Optional[Embedder] = None,
        store: Optional[VectorStore] = None,
    ) -> "Runtime":
        """Construct from settings, falling back gracefully if deps are absent.

        Tests can pass explicit ``embedder`` / ``store`` to bypass detection.
        """
        chosen_embedder, embedder_kind = (
            (embedder, "injected") if embedder else _pick_embedder(settings)
        )
        chosen_store, store_kind = (
            (store, "injected") if store else _pick_store(settings, chosen_embedder.dim)
        )

        if chosen_embedder.dim != chosen_store.dim:
            raise RuntimeError(
                f"Embedder dim ({chosen_embedder.dim}) and store dim "
                f"({chosen_store.dim}) disagree. Recreate the collection or "
                f"set KNOWLEDGE_EMBED_DIM correctly."
            )

        ingestor = Ingestor(
            embedder=chosen_embedder,
            store=chosen_store,
            chunk_tokens=settings.chunk_tokens,
            chunk_overlap_tokens=settings.chunk_overlap_tokens,
        )
        log.info(
            "knowledge runtime: embedder=%s store=%s dim=%d",
            embedder_kind, store_kind, chosen_embedder.dim,
        )
        return cls(
            settings=settings,
            embedder=chosen_embedder,
            store=chosen_store,
            ingestor=ingestor,
            embedder_kind=embedder_kind,
            store_kind=store_kind,
        )

    async def start(self) -> None:
        await self.store.ensure_collection()


def _pick_embedder(settings: Settings) -> tuple[Embedder, str]:
    """Use Ollama unless KNOWLEDGE_EMBEDDER=hash forces the fallback."""
    forced = os.getenv("KNOWLEDGE_EMBEDDER", "").lower()
    if forced == "hash":
        return HashEmbedder(dim=settings.embed_dim), "hash"
    return (
        OllamaEmbedder(
            base_url=settings.ollama_base_url,
            model=settings.embed_model,
            dim=settings.embed_dim,
        ),
        "ollama",
    )


def _pick_store(settings: Settings, dim: int) -> tuple[VectorStore, str]:
    """Use Qdrant unless KNOWLEDGE_STORE=memory forces the fallback."""
    forced = os.getenv("KNOWLEDGE_STORE", "").lower()
    if forced == "memory":
        return InMemoryStore(dim=dim), "memory"
    if settings.qdrant_url:
        return (
            QdrantStore(
                collection=settings.collection,
                dim=dim,
                url=settings.qdrant_url,
            ),
            "qdrant_server",
        )
    return (
        QdrantStore(
            collection=settings.collection,
            dim=dim,
            path=settings.qdrant_path,
        ),
        "qdrant_embedded",
    )
