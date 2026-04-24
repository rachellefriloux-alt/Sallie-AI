"""Embedder protocol + implementations.

Two implementations ship:

* ``OllamaEmbedder`` — calls a local Ollama server (`/api/embeddings`).
  The default model is ``nomic-embed-text`` (768-dim).
* ``HashEmbedder`` — deterministic, dependency-free. Hashes tokens into a
  fixed-dim float vector. Quality is bad but it lets the rest of the
  pipeline (chunking, store, routes, tests) work without any model server.

Anything embedding-shaped just needs to implement :class:`Embedder`.
"""
from __future__ import annotations

import hashlib
import logging
import math
import re
from typing import List, Protocol, Sequence

import httpx

log = logging.getLogger("sallie.knowledge.embeddings")


class Embedder(Protocol):
    """Embed one or more texts into fixed-dimension float vectors."""

    @property
    def dim(self) -> int: ...

    async def embed(self, texts: Sequence[str]) -> List[List[float]]: ...


# ---- Hash embedder (deterministic, no deps) -------------------------------

_TOKEN_RE = re.compile(r"\w+")


class HashEmbedder:
    """Deterministic feature-hashing embedder.

    Tokenises with a simple ``\\w+`` regex, hashes each token to a bucket,
    and accumulates TF counts. The result is L2-normalised so cosine
    similarity is well-defined.

    *Not* a substitute for real embeddings — but it's enough to verify
    that the pipeline indexes things and that queries return *something*
    in the right ballpark, which is what tests need.
    """

    def __init__(self, dim: int = 256) -> None:
        if dim <= 0:
            raise ValueError("dim must be positive")
        self._dim = dim

    @property
    def dim(self) -> int:
        return self._dim

    async def embed(self, texts: Sequence[str]) -> List[List[float]]:
        return [self._embed_one(t) for t in texts]

    def _embed_one(self, text: str) -> List[float]:
        vec = [0.0] * self._dim
        for token in _TOKEN_RE.findall(text.lower()):
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest()
            bucket = int.from_bytes(digest[:4], "big") % self._dim
            # Sign bit from a separate byte to avoid all-positive vectors.
            sign = 1.0 if (digest[4] & 1) == 0 else -1.0
            vec[bucket] += sign
        norm = math.sqrt(sum(v * v for v in vec))
        if norm == 0:
            return vec
        return [v / norm for v in vec]


# ---- Ollama embedder ------------------------------------------------------


class OllamaEmbedder:
    """Embeds via a local Ollama instance.

    Requires a model that supports embeddings (``nomic-embed-text``,
    ``mxbai-embed-large``, etc.). Each text is one HTTP call; Ollama's
    embedding endpoint doesn't currently batch.
    """

    def __init__(
        self,
        *,
        base_url: str,
        model: str,
        dim: int,
        timeout_s: float = 30.0,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._dim = dim
        self._timeout = timeout_s

    @property
    def dim(self) -> int:
        return self._dim

    async def embed(self, texts: Sequence[str]) -> List[List[float]]:
        out: List[List[float]] = []
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            for text in texts:
                resp = await client.post(
                    f"{self._base_url}/api/embeddings",
                    json={"model": self._model, "prompt": text},
                )
                resp.raise_for_status()
                payload = resp.json()
                vec = payload.get("embedding")
                if not isinstance(vec, list):
                    raise RuntimeError(
                        f"Ollama returned no embedding for model={self._model!r}: {payload!r}"
                    )
                if len(vec) != self._dim:
                    raise RuntimeError(
                        f"Embedding dim mismatch: expected {self._dim}, got {len(vec)}. "
                        f"Set KNOWLEDGE_EMBED_DIM to match {self._model!r}."
                    )
                out.append([float(x) for x in vec])
        return out
