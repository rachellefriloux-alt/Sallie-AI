"""Wikitext → plain text.

Wikipedia article bodies are wikitext: a markup language with templates,
tables, references, links, and a long tail of edge cases. We don't try to
render it perfectly; we just need *clean enough* prose to embed.

Strategy:

1. Use ``mwparserfromhell`` to strip templates, comments, refs.
2. Remove leftover HTML tags, table syntax, and file/category links that
   the parser leaves behind.
3. Collapse whitespace.

The output is intended for embedding, **not** for display. We deliberately
drop section headings (they hurt embedding quality more than they help —
"== History ==" embeds the same in every article).
"""
from __future__ import annotations

import re

import mwparserfromhell

# File:, Image:, Category:, etc. are localized in real wikis, but the
# canonical English prefixes cover ~all of enwiki.
_LINK_NAMESPACE_RE = re.compile(
    r"\[\[(?:File|Image|Category):[^\]]*\]\]", re.IGNORECASE
)
_HTML_TAG_RE = re.compile(r"<[^>]+>")
_REF_RE = re.compile(r"<ref[^>]*?>.*?</ref>|<ref[^>]*?/>", re.DOTALL | re.IGNORECASE)
_TABLE_RE = re.compile(r"\{\|.*?\|\}", re.DOTALL)
_HEADING_RE = re.compile(r"^=+\s*.*?\s*=+\s*$", re.MULTILINE)
_WHITESPACE_RE = re.compile(r"[ \t\f\v]+")
_BLANK_LINES_RE = re.compile(r"\n{3,}")


def strip_wikitext(raw: str) -> str:
    """Convert raw wikitext to clean plain text suitable for embedding.

    Empty input returns an empty string. Never raises on malformed wikitext —
    Wikipedia has plenty of broken markup and we'd rather index a slightly
    dirty article than skip it.
    """
    if not raw:
        return ""

    text = raw

    # Drop ref tags before the parser sees them — mwparserfromhell preserves
    # their text content otherwise.
    text = _REF_RE.sub("", text)
    # Tables are wildly inconsistent; the structured content rarely makes
    # useful prose, so just drop them whole.
    text = _TABLE_RE.sub("", text)
    # File/Image/Category links don't yield prose either.
    text = _LINK_NAMESPACE_RE.sub("", text)
    # Strip section headings BEFORE the parser sees them — mwparserfromhell's
    # strip_code() removes the `==` markers but keeps the heading text, which
    # would leak orphan keywords into our chunks.
    text = _HEADING_RE.sub("", text)

    try:
        wikicode = mwparserfromhell.parse(text)
        # strip_code() walks the tree and emits readable text (resolves
        # links to their display text, drops templates by default).
        text = wikicode.strip_code(normalize=True, collapse=True)
    except Exception:  # noqa: BLE001 — defensive; wikitext is messy
        # Fall back to the regex-cleaned version. Better partial than nothing.
        pass

    # Any HTML the parser missed.
    text = _HTML_TAG_RE.sub("", text)

    # Whitespace cleanup.
    text = _WHITESPACE_RE.sub(" ", text)
    text = _BLANK_LINES_RE.sub("\n\n", text)
    return text.strip()
