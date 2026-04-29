"""
Export the brain's OpenAPI spec to packages/sdk/openapi.json.

Phase 1, plan item 28. FastAPI generates a fresh OpenAPI document from
the running app's route table; this script imports the app, asks for
the schema, and writes it to disk so that:

* The TypeScript SDK in packages/sdk can be regenerated from a stable
  source-of-truth file (rather than needing a live brain to hit).
* CI can diff the committed spec against the live one and fail the
  build when a route changes without the SDK being re-exported.

Usage
-----
From the repo root:

    python services/brain/scripts/export_openapi.py \
        --output packages/sdk/openapi.json

If --output is omitted, the spec is printed to stdout.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Make the brain importable regardless of where the script is invoked from.
_BRAIN_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_BRAIN_ROOT))


def _load_app():
    """Import and return the FastAPI app.

    The brain's startup secrets (BRAIN_JWT_SECRET, etc.) are not required
    just to *describe* the route table, so we provide harmless dev defaults
    if they are not already set in the environment.
    """
    os.environ.setdefault("BRAIN_JWT_SECRET", "openapi-export-only-not-a-real-secret!!")
    os.environ.setdefault(
        "BRAIN_JWT_REFRESH_SECRET", "openapi-export-only-not-a-real-refresh-secret!"
    )
    from app.main import app  # noqa: WPS433  (imported here to defer side effects)
    return app


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Path to write the spec to. If omitted, spec is printed to stdout.",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="Indentation for the JSON output (default: 2).",
    )
    args = parser.parse_args(argv)

    app = _load_app()
    spec = app.openapi()
    serialised = json.dumps(spec, indent=args.indent, sort_keys=True) + "\n"

    if args.output is None:
        sys.stdout.write(serialised)
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(serialised, encoding="utf-8")
    print(f"wrote {len(serialised):,} bytes to {args.output}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
