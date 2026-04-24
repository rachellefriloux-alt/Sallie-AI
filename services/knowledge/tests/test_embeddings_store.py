"""Embedder + in-memory store tests."""
from __future__ import annotations

import pytest

from app.embeddings import HashEmbedder
from app.store import InMemoryStore, StoredChunk


@pytest.mark.asyncio
async def test_hash_embedder_dim_matches():
    e = HashEmbedder(dim=128)
    [vec] = await e.embed(["hello world"])
    assert len(vec) == 128


@pytest.mark.asyncio
async def test_hash_embedder_is_deterministic():
    e = HashEmbedder(dim=64)
    [a] = await e.embed(["sallie is loyal"])
    [b] = await e.embed(["sallie is loyal"])
    assert a == b


@pytest.mark.asyncio
async def test_hash_embedder_distinguishes_distinct_inputs():
    e = HashEmbedder(dim=256)
    a, b = await e.embed(["cats are mammals", "qdrant indexes vectors"])
    assert a != b


@pytest.mark.asyncio
async def test_hash_embedder_normalises_to_unit_length():
    e = HashEmbedder(dim=128)
    [v] = await e.embed(["the quick brown fox jumps over the lazy dog"])
    norm_sq = sum(x * x for x in v)
    assert abs(norm_sq - 1.0) < 1e-6


@pytest.mark.asyncio
async def test_hash_embedder_empty_text_is_safe():
    e = HashEmbedder(dim=32)
    [v] = await e.embed([""])
    assert len(v) == 32
    assert all(x == 0.0 for x in v)


@pytest.mark.asyncio
async def test_in_memory_store_roundtrip():
    s = InMemoryStore(dim=4)
    await s.ensure_collection()
    chunks = [
        StoredChunk(id="a", text="alpha", metadata={"k": 1}),
        StoredChunk(id="b", text="beta", metadata={"k": 2}),
    ]
    vectors = [[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]]
    await s.upsert(chunks, vectors)
    assert await s.count() == 2

    hits = await s.search([1.0, 0.0, 0.0, 0.0], limit=2)
    assert hits[0].id == "a"
    assert hits[0].score > hits[1].score


@pytest.mark.asyncio
async def test_in_memory_store_dim_check():
    s = InMemoryStore(dim=4)
    chunk = StoredChunk(id="x", text="x", metadata={})
    with pytest.raises(ValueError):
        await s.upsert([chunk], [[1.0, 0.0]])
    with pytest.raises(ValueError):
        await s.search([1.0, 0.0])


@pytest.mark.asyncio
async def test_in_memory_store_upsert_overwrites_same_id():
    s = InMemoryStore(dim=2)
    await s.upsert([StoredChunk(id="x", text="v1", metadata={})], [[1.0, 0.0]])
    await s.upsert([StoredChunk(id="x", text="v2", metadata={})], [[0.0, 1.0]])
    assert await s.count() == 1
    [hit] = await s.search([0.0, 1.0], limit=1)
    assert hit.text == "v2"
