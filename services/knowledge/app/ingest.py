"""Ingestion orchestration: documents → chunks → vectors → store."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Sequence

from app.chunking import Chunk, chunk_text
from app.embeddings import Embedder
from app.store import StoredChunk, VectorStore
from app.wikitext import strip_wikitext

log = logging.getLogger("sallie.knowledge.ingest")


@dataclass(frozen=True)
class Document:
    """One thing to ingest. ``id`` should be globally unique within a corpus."""

    id: str
    title: str
    text: str
    is_wikitext: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class IngestStats:
    documents: int
    chunks: int
    skipped_documents: int


class Ingestor:
    """Drive a stream of documents through chunk → embed → upsert.

    Embedding and upsert happen in batches of ``batch_size`` so we don't
    hold the entire corpus in memory and so we keep the embedder pipelined.
    """

    def __init__(
        self,
        *,
        embedder: Embedder,
        store: VectorStore,
        chunk_tokens: int = 500,
        chunk_overlap_tokens: int = 50,
        batch_size: int = 32,
        min_chunk_chars: int = 80,
    ) -> None:
        if embedder.dim != store.dim:
            raise ValueError(
                f"embedder dim {embedder.dim} != store dim {store.dim}"
            )
        self._embedder = embedder
        self._store = store
        self._chunk_tokens = chunk_tokens
        self._chunk_overlap = chunk_overlap_tokens
        self._batch_size = batch_size
        self._min_chunk_chars = min_chunk_chars

    async def ingest(self, documents: Iterable[Document]) -> IngestStats:
        await self._store.ensure_collection()

        n_docs = 0
        n_skipped = 0
        n_chunks = 0
        batch_chunks: List[StoredChunk] = []
        batch_texts: List[str] = []

        for doc in documents:
            n_docs += 1
            chunks = self._chunks_for(doc)
            if not chunks:
                n_skipped += 1
                continue
            for chunk in chunks:
                batch_chunks.append(chunk)
                batch_texts.append(chunk.text)
                if len(batch_chunks) >= self._batch_size:
                    n_chunks += await self._flush(batch_chunks, batch_texts)
                    batch_chunks = []
                    batch_texts = []

        if batch_chunks:
            n_chunks += await self._flush(batch_chunks, batch_texts)

        log.info(
            "ingest: docs=%d chunks=%d skipped=%d",
            n_docs, n_chunks, n_skipped,
        )
        return IngestStats(documents=n_docs, chunks=n_chunks, skipped_documents=n_skipped)

    def _chunks_for(self, doc: Document) -> List[StoredChunk]:
        text = strip_wikitext(doc.text) if doc.is_wikitext else (doc.text or "")
        text = text.strip()
        if not text:
            return []
        raw_chunks: List[Chunk] = chunk_text(
            text,
            target_tokens=self._chunk_tokens,
            overlap_tokens=self._chunk_overlap,
        )
        out: List[StoredChunk] = []
        for ch in raw_chunks:
            if len(ch.text) < self._min_chunk_chars:
                continue
            out.append(
                StoredChunk(
                    id=f"{doc.id}#{ch.index}",
                    text=ch.text,
                    metadata={
                        "doc_id": doc.id,
                        "title": doc.title,
                        "chunk_index": ch.index,
                        "approx_tokens": ch.approx_tokens,
                        **doc.metadata,
                    },
                )
            )
        return out

    async def _flush(
        self, chunks: Sequence[StoredChunk], texts: Sequence[str]
    ) -> int:
        vectors = await self._embedder.embed(texts)
        await self._store.upsert(chunks, vectors)
        return len(chunks)
