# services/knowledge

Wikipedia ingestion + local RAG. Phase 3.

## Pipeline (planned)

1. Download latest Wikipedia dump (`enwiki-latest-pages-articles.xml.bz2`,
   ~22 GB) on the user's machine. **Never committed to git.**
2. Stream-parse, strip wikitext, chunk to ~512-token windows.
3. Embed each chunk via Ollama (`nomic-embed-text`).
4. Store vectors in a local Qdrant collection (`wikipedia`).
5. Expose a `/query` endpoint the brain calls for RAG.

All data goes under `services/knowledge/data/` which is gitignored.

Currently empty — Phase 3 implementation lands here.
