"""Download the latest English Wikipedia dump.

Usage::

    python scripts/download_wikipedia.py [--dest data/dumps]

This is intentionally a tiny script: ~22 GB of pages-articles-multistream.xml.bz2
is the standard dump. It's never committed to git (see ``.gitignore``); each
machine downloads its own.
"""
from __future__ import annotations

import argparse
import sys
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_URL = (
    "https://dumps.wikimedia.org/enwiki/latest/"
    "enwiki-latest-pages-articles-multistream.xml.bz2"
)


def download(url: str, dest: Path) -> None:
    # Only http/https — refuses file://, ftp://, etc., which urlopen
    # would otherwise happily honour from a CLI flag.
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"refusing non-http(s) URL scheme: {parsed.scheme!r}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"downloading {url}\n          -> {dest}", file=sys.stderr)
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as response, dest.open("wb") as out:  # noqa: S310 — scheme guarded above
        total = response.length or 0
        downloaded = 0
        chunk = 1024 * 1024
        while True:
            buf = response.read(chunk)
            if not buf:
                break
            out.write(buf)
            downloaded += len(buf)
            if total:
                pct = (downloaded / total) * 100
                print(f"\r  {downloaded / 1e9:.2f} / {total / 1e9:.2f} GB ({pct:5.1f}%)",
                      end="", file=sys.stderr)
    print("\ndone.", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument(
        "--dest",
        type=Path,
        default=Path("data/dumps/enwiki-latest-pages-articles-multistream.xml.bz2"),
    )
    args = parser.parse_args()
    download(args.url, args.dest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
