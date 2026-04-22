"""Chunker behavioral tests."""
from __future__ import annotations

import pytest

from app.chunking import CHARS_PER_TOKEN, chunk_text


def test_empty_input_returns_empty_list():
    assert chunk_text("") == []
    assert chunk_text("   \n  ") == []


def test_short_text_is_a_single_chunk():
    text = "Sallie is a loyal strategist. She speaks plainly."
    chunks = chunk_text(text, target_tokens=500)
    assert len(chunks) == 1
    assert chunks[0].index == 0
    assert "Sallie" in chunks[0].text


def test_long_text_splits_into_multiple_chunks_under_max():
    sentence = "The quick brown fox jumps over the lazy dog. "
    text = sentence * 200  # ~9000 chars
    chunks = chunk_text(text, target_tokens=100, overlap_tokens=10)
    assert len(chunks) > 1
    max_chars = int(100 * CHARS_PER_TOKEN * 1.2)
    for c in chunks:
        assert len(c.text) <= max_chars + 10  # +slack for join spaces


def test_chunk_indices_are_contiguous():
    text = ("Alpha. " * 100) + "\n\n" + ("Beta. " * 100)
    chunks = chunk_text(text, target_tokens=50, overlap_tokens=5)
    assert [c.index for c in chunks] == list(range(len(chunks)))


def test_overlap_carries_context_between_chunks():
    sentences = [f"Sentence number {i} appears here." for i in range(60)]
    text = " ".join(sentences)
    chunks = chunk_text(text, target_tokens=40, overlap_tokens=15)
    assert len(chunks) >= 2
    # At least one trailing sentence from chunk[i] should reappear at the
    # start of chunk[i+1].
    for a, b in zip(chunks, chunks[1:]):
        a_tail = a.text.split(". ")[-2:]  # last two sentences-ish
        assert any(piece and piece in b.text for piece in a_tail), (
            f"no overlap detected between chunks {a.index} and {b.index}"
        )


def test_invalid_overlap_raises():
    with pytest.raises(ValueError):
        chunk_text("hi", target_tokens=10, overlap_tokens=10)
    with pytest.raises(ValueError):
        chunk_text("hi", target_tokens=10, overlap_tokens=-1)


def test_invalid_target_raises():
    with pytest.raises(ValueError):
        chunk_text("hi", target_tokens=0)


def test_runaway_sentence_is_hard_split():
    huge = "a" * 10000  # one "sentence", no boundaries
    chunks = chunk_text(huge, target_tokens=100, overlap_tokens=0)
    assert len(chunks) > 1
    assert sum(len(c.text) for c in chunks) >= len(huge) - len(chunks)
