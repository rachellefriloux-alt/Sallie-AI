"""Vector store protocol + implementations.

Two implementations:

* ``QdrantStore`` — production. Uses qdrant-client; works in embedded mode
  (a ``path=`` argument, no server) or against a real server (``url=``).
* ``InMemoryStore`` — tests. Keeps points in a dict, brute-force cosine
  search. Lets us exercise routes without spinning up Qdrant.
"""
from __future__ import annotations

import math
import uuid
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Protocol, Sequence


@dataclass(frozen=True)
class StoredChunk:
    """A chunk after it has been embedded and persisted."""

    id: str
    text: str
    metadata: Dict[str, Any]


@dataclass(frozen=True)
class SearchHit:
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]


class VectorStore(Protocol):
    @property
    def dim(self) -> int: ...

    async def ensure_collection(self) -> None: ...

    async def upsert(
        self, chunks: Sequence[StoredChunk], vectors: Sequence[Sequence[float]]
    ) -> None: ...

    async def search(
        self, vector: Sequence[float], *, limit: int = 5
    ) -> List[SearchHit]: ...

    async def count(self) -> int: ...


# ---- In-memory store ------------------------------------------------------


def _cosine(a: Sequence[float], b: Sequence[float]) -> float:
    dot = 0.0
    na = 0.0
    nb = 0.0
    for x, y in zip(a, b):
        dot += x * y
        na += x * x
        nb += y * y
    if na == 0 or nb == 0:
        return 0.0
    return dot / (math.sqrt(na) * math.sqrt(nb))


class InMemoryStore:
    """Brute-force in-memory vector store. Tests / fallback only."""

    def __init__(self, dim: int) -> None:
        self._dim = dim
        self._points: Dict[str, tuple[List[float], StoredChunk]] = {}

    @property
    def dim(self) -> int:
        return self._dim

    async def ensure_collection(self) -> None:  # no-op
        return None

    async def upsert(
        self, chunks: Sequence[StoredChunk], vectors: Sequence[Sequence[float]]
    ) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must be the same length")
        for chunk, vec in zip(chunks, vectors):
            if len(vec) != self._dim:
                raise ValueError(
                    f"vector dim {len(vec)} != store dim {self._dim}"
                )
            self._points[chunk.id] = (list(vec), chunk)

    async def search(
        self, vector: Sequence[float], *, limit: int = 5
    ) -> List[SearchHit]:
        if len(vector) != self._dim:
            raise ValueError(f"query dim {len(vector)} != store dim {self._dim}")
        scored = [
            SearchHit(
                id=chunk.id,
                score=_cosine(vector, vec),
                text=chunk.text,
                metadata=chunk.metadata,
            )
            for vec, chunk in self._points.values()
        ]
        scored.sort(key=lambda h: h.score, reverse=True)
        return scored[:limit]

    async def count(self) -> int:
        return len(self._points)


# ---- Qdrant store ---------------------------------------------------------


class QdrantStore:
    """Qdrant-backed vector store.

    Pass exactly one of ``url`` (server mode) or ``path`` (embedded mode).
    The collection is created lazily on :meth:`ensure_collection`.
    """

    def __init__(
        self,
        *,
        collection: str,
        dim: int,
        url: Optional[str] = None,
        path: Optional[str] = None,
    ) -> None:
        if (url is None) == (path is None):
            raise ValueError("Pass exactly one of `url` or `path`")
        # Imported lazily so tests don't pay for it.
        from qdrant_client import AsyncQdrantClient

        self._client = (
            AsyncQdrantClient(url=url) if url else AsyncQdrantClient(path=path)
        )
        self._collection = collection
        self._dim = dim

    @property
    def dim(self) -> int:
        return self._dim

    async def ensure_collection(self) -> None:
        from qdrant_client.models import Distance, VectorParams

        existing = await self._client.get_collections()
        names = {c.name for c in existing.collections}
        if self._collection not in names:
            await self._client.create_collection(
                collection_name=self._collection,
                vectors_config=VectorParams(size=self._dim, distance=Distance.COSINE),
            )

    async def upsert(
        self, chunks: Sequence[StoredChunk], vectors: Sequence[Sequence[float]]
    ) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must be the same length")
        from qdrant_client.models import PointStruct

        points = [
            PointStruct(
                id=_uuid_from_string(chunk.id),
                vector=list(vec),
                payload={"text": chunk.text, **chunk.metadata, "_id": chunk.id},
            )
            for chunk, vec in zip(chunks, vectors)
        ]
        await self._client.upsert(collection_name=self._collection, points=points)

    async def search(
        self, vector: Sequence[float], *, limit: int = 5
    ) -> List[SearchHit]:
        results = await self._client.search(
            collection_name=self._collection,
            query_vector=list(vector),
            limit=limit,
        )
        hits: List[SearchHit] = []
        for r in results:
            payload = dict(r.payload or {})
            text = payload.pop("text", "")
            chunk_id = payload.pop("_id", str(r.id))
            hits.append(
                SearchHit(id=chunk_id, score=float(r.score), text=text, metadata=payload)
            )
        return hits

    async def count(self) -> int:
        info = await self._client.count(collection_name=self._collection, exact=True)
        return int(info.count)


def _uuid_from_string(s: str) -> str:
    """Qdrant point IDs must be int or UUID; map our string IDs to a UUIDv5."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, s))
