"""Stream a Wikipedia ``pages-articles`` dump and ingest it.

Usage::

    python scripts/ingest_dump.py data/dumps/enwiki-latest-pages-articles-multistream.xml.bz2 \\
        --limit 1000

Streams the bz2 dump with ``xml.etree.ElementTree.iterparse`` so memory
stays flat regardless of dump size, filters out redirects and non-article
namespaces, and feeds Documents to the runtime's :class:`Ingestor`.
"""
from __future__ import annotations

import argparse
import asyncio
import bz2
import logging
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterator

# Allow ``python scripts/ingest_dump.py …`` from the service root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings  # noqa: E402
from app.ingest import Document  # noqa: E402
from app.runtime import Runtime  # noqa: E402

# enwiki uses the MediaWiki export schema.
_NS = "{http://www.mediawiki.org/xml/export-0.11/}"

log = logging.getLogger("sallie.knowledge.ingest_dump")


def iter_pages(path: Path) -> Iterator[Document]:
    """Yield articles (ns=0, non-redirect) from a pages-articles dump."""
    opener = bz2.open if path.suffix == ".bz2" else open
    with opener(path, "rb") as fh:
        ctx = ET.iterparse(fh, events=("end",))
        for _, elem in ctx:
            if elem.tag != f"{_NS}page":
                continue
            try:
                ns_elem = elem.find(f"{_NS}ns")
                if ns_elem is None or ns_elem.text != "0":
                    continue  # not main article namespace
                title_elem = elem.find(f"{_NS}title")
                id_elem = elem.find(f"{_NS}id")
                rev = elem.find(f"{_NS}revision")
                if title_elem is None or id_elem is None or rev is None:
                    continue
                if rev.find(f"{_NS}redirect") is not None:
                    continue
                text_elem = rev.find(f"{_NS}text")
                if text_elem is None or not (text_elem.text or "").strip():
                    continue
                yield Document(
                    id=f"wiki:{id_elem.text}",
                    title=title_elem.text or "",
                    text=text_elem.text or "",
                    is_wikitext=True,
                    metadata={"source": "wikipedia"},
                )
            finally:
                # Critical for iterparse memory hygiene on multi-GB files.
                elem.clear()


async def run(path: Path, limit: int | None) -> None:
    runtime = Runtime.from_settings(settings)
    await runtime.start()

    def limited() -> Iterator[Document]:
        n = 0
        for doc in iter_pages(path):
            if limit is not None and n >= limit:
                break
            n += 1
            yield doc

    stats = await runtime.ingestor.ingest(limited())
    print(
        f"ingested: documents={stats.documents} chunks={stats.chunks} "
        f"skipped_documents={stats.skipped_documents}"
    )


def main() -> int:
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dump", type=Path, help="path to pages-articles[.bz2]")
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="ingest at most N articles (default: no limit)",
    )
    args = parser.parse_args()
    if not args.dump.exists():
        print(f"dump not found: {args.dump}", file=sys.stderr)
        return 1
    asyncio.run(run(args.dump, args.limit))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
