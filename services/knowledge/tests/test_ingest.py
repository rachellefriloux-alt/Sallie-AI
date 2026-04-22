"""Ingestor end-to-end tests using HashEmbedder + InMemoryStore."""
from __future__ import annotations

import pytest

from app.embeddings import HashEmbedder
from app.ingest import Document, Ingestor
from app.store import InMemoryStore


def _build(dim: int = 256) -> tuple[Ingestor, InMemoryStore]:
    embedder = HashEmbedder(dim=dim)
    store = InMemoryStore(dim=dim)
    ingestor = Ingestor(
        embedder=embedder,
        store=store,
        chunk_tokens=80,
        chunk_overlap_tokens=10,
        batch_size=4,
        min_chunk_chars=20,
    )
    return ingestor, store


@pytest.mark.asyncio
async def test_dim_mismatch_rejected_at_construction():
    with pytest.raises(ValueError):
        Ingestor(embedder=HashEmbedder(dim=64), store=InMemoryStore(dim=128))


@pytest.mark.asyncio
async def test_ingest_plain_text_documents():
    ingestor, store = _build()
    docs = [
        Document(
            id="d1",
            title="Loyalty",
            text=("Sallie is loyal to one person. " * 30),
        ),
        Document(
            id="d2",
            title="Direction",
            text=("She speaks plainly and directly. " * 30),
        ),
    ]
    stats = await ingestor.ingest(docs)
    assert stats.documents == 2
    assert stats.skipped_documents == 0
    assert stats.chunks > 0
    assert await store.count() == stats.chunks


@pytest.mark.asyncio
async def test_ingest_skips_empty_documents():
    ingestor, store = _build()
    stats = await ingestor.ingest([
        Document(id="empty", title="x", text="   "),
        Document(id="real", title="y", text="A real sentence with content. " * 20),
    ])
    assert stats.documents == 2
    assert stats.skipped_documents == 1
    assert stats.chunks > 0


@pytest.mark.asyncio
async def test_ingest_runs_wikitext_stripper():
    ingestor, store = _build()
    wiki = (
        "[[File:Cat.jpg|thumb|A cat]]\n"
        "Cats are small carnivorous mammals.<ref>citation</ref> "
        "They are often kept as pets. " * 20
    )
    stats = await ingestor.ingest([
        Document(id="wiki:1", title="Cat", text=wiki, is_wikitext=True),
    ])
    assert stats.chunks > 0

    # Search should find this content under a related query.
    [vector] = await ingestor._embedder.embed(["cats mammals pets"])  # type: ignore[attr-defined]
    hits = await store.search(vector, limit=1)
    assert hits
    # Stripper should have removed the File: link and the ref.
    assert "File:" not in hits[0].text
    assert "citation" not in hits[0].text


@pytest.mark.asyncio
async def test_ingest_metadata_propagates_to_chunks():
    ingestor, store = _build()
    await ingestor.ingest([
        Document(
            id="d1",
            title="My Title",
            text="Sentence one. " * 50,
            metadata={"source": "test", "lang": "en"},
        ),
    ])
    [vec] = await ingestor._embedder.embed(["sentence one"])  # type: ignore[attr-defined]
    [hit] = await store.search(vec, limit=1)
    assert hit.metadata["doc_id"] == "d1"
    assert hit.metadata["title"] == "My Title"
    assert hit.metadata["source"] == "test"
    assert hit.metadata["lang"] == "en"
    assert "chunk_index" in hit.metadata


@pytest.mark.asyncio
async def test_ingest_batches_correctly():
    """Ensure batch boundary handling doesn't lose chunks."""
    ingestor, store = _build()
    # Force many small chunks so we cross the batch_size=4 boundary multiple times.
    docs = [
        Document(id=f"d{i}", title=f"T{i}", text=f"Body number {i}. " * 50)
        for i in range(10)
    ]
    stats = await ingestor.ingest(docs)
    assert stats.chunks == await store.count()
    assert stats.chunks >= 10  # at least one chunk per doc
