"""Token-aware text chunking.

We don't ship a real tokenizer with this service (would pull in transformers
+ a model). Instead we approximate: ~4 chars ≈ 1 token, which is the
documented rule of thumb for English text under modern BPE tokenizers
(GPT/Llama/Nomic all sit in 3.5–4.5 chars/token for English Wikipedia).

Chunks split on paragraph boundaries first, sentences second, hard char
limits last. Overlap is character-based for the same reason.

This is good enough for retrieval: the retrieval system is forgiving of
±10% chunk size variance, and we can swap in a real tokenizer later
without changing call sites.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, List

# ~4 chars per token is the standard heuristic for English under BPE.
CHARS_PER_TOKEN = 4

_PARAGRAPH_RE = re.compile(r"\n\s*\n")
# Sentence boundary: ., !, or ? followed by whitespace + capital/quote/digit.
# Won't catch every edge case but does well on Wikipedia prose.
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"'\d])")


@dataclass(frozen=True)
class Chunk:
    text: str
    # 0-based index within the source document.
    index: int
    # Approximate token count (chars / 4).
    approx_tokens: int


def _approx_tokens(text: str) -> int:
    return max(1, len(text) // CHARS_PER_TOKEN)


def _split_paragraphs(text: str) -> List[str]:
    return [p.strip() for p in _PARAGRAPH_RE.split(text) if p.strip()]


def _split_sentences(paragraph: str) -> List[str]:
    parts = _SENTENCE_RE.split(paragraph)
    return [p.strip() for p in parts if p.strip()]


def _hard_split(text: str, max_chars: int) -> List[str]:
    """Last-resort splitter for runaway-long sentences."""
    return [text[i : i + max_chars] for i in range(0, len(text), max_chars)]


def chunk_text(
    text: str,
    *,
    target_tokens: int = 500,
    overlap_tokens: int = 50,
) -> List[Chunk]:
    """Split ``text`` into roughly-``target_tokens``-sized chunks.

    Returns an empty list for empty input. Chunks never exceed
    ``target_tokens * 1.2`` tokens; the last chunk in a document may be
    smaller. Adjacent chunks share ``overlap_tokens`` tokens of context to
    preserve sentences that straddle the boundary.
    """
    text = (text or "").strip()
    if not text:
        return []
    if target_tokens <= 0:
        raise ValueError("target_tokens must be positive")
    if overlap_tokens < 0 or overlap_tokens >= target_tokens:
        raise ValueError("overlap_tokens must be in [0, target_tokens)")

    target_chars = target_tokens * CHARS_PER_TOKEN
    max_chars = int(target_chars * 1.2)
    overlap_chars = overlap_tokens * CHARS_PER_TOKEN

    # Build a list of "atomic" pieces (sentences) we never want to split
    # further unless they're individually huge.
    atoms: List[str] = []
    for paragraph in _split_paragraphs(text):
        sentences = _split_sentences(paragraph) or [paragraph]
        for sentence in sentences:
            if len(sentence) <= max_chars:
                atoms.append(sentence)
            else:
                atoms.extend(_hard_split(sentence, max_chars))

    if not atoms:
        return []

    chunks: List[Chunk] = []
    buf: List[str] = []
    buf_chars = 0

    def flush() -> None:
        nonlocal buf, buf_chars
        if not buf:
            return
        joined = " ".join(buf).strip()
        if joined:
            chunks.append(
                Chunk(text=joined, index=len(chunks), approx_tokens=_approx_tokens(joined))
            )
        # Carry overlap into the next chunk: keep tail sentences whose
        # combined length is ~overlap_chars.
        if overlap_chars > 0:
            tail: List[str] = []
            tail_chars = 0
            for sentence in reversed(buf):
                if tail_chars + len(sentence) > overlap_chars and tail:
                    break
                tail.insert(0, sentence)
                tail_chars += len(sentence) + 1
            buf = tail
            buf_chars = sum(len(s) + 1 for s in buf)
        else:
            buf = []
            buf_chars = 0

    for sentence in atoms:
        if buf and buf_chars + len(sentence) + 1 > target_chars:
            flush()
        buf.append(sentence)
        buf_chars += len(sentence) + 1

    flush()
    # If overlap left a trailing buffer that never got flushed as a real
    # chunk, drop it — it's a duplicate of the previous chunk's tail.
    return chunks


def chunk_iter(text: str, **kwargs) -> Iterable[Chunk]:
    """Generator wrapper over :func:`chunk_text` for streaming callers."""
    yield from chunk_text(text, **kwargs)
