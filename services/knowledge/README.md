# services/knowledge

Wikipedia ingestion + local RAG. **Phase 3 — implemented.**

The knowledge service is the second of Sallie's local backend processes
(after `services/brain/`). It owns:

1. Streaming a Wikipedia dump → clean plain text → chunks
2. Embedding chunks (Ollama by default; deterministic hash fallback for
   tests / demos without a model server)
3. Storing vectors in Qdrant (server or embedded mode)
4. Exposing `/query` for the brain's RAG path

## API

| Method | Path     | Body / Query                       | Returns |
|--------|----------|------------------------------------|---------|
| GET    | /health  | —                                  | `{status:"ok"}` |
| GET    | /ready   | —                                  | embedder/store kind + dim |
| GET    | /stats   | —                                  | corpus size + config |
| POST   | /ingest  | `{documents:[{id,title,text,is_wikitext?,metadata?}]}` | counts |
| POST   | /query   | `{query, limit?}`                  | top-N hits with score + metadata |

## Pipeline (current)

1. Get a dump (any size — the streaming parser is constant-memory):

   ```bash
   python scripts/download_wikipedia.py --dest data/dumps/enwiki.xml.bz2
   ```

   ~22 GB for the full English dump. Never committed; `data/` is
   gitignored.

2. Ingest it:

   ```bash
   python scripts/ingest_dump.py data/dumps/enwiki.xml.bz2 --limit 1000
   ```

   `--limit` is handy for first runs. Each article goes through the
   wikitext stripper, the chunker, the embedder, and into Qdrant.

3. Query it:

   ```bash
   curl -X POST localhost:8100/query \
     -H 'content-type: application/json' \
     -d '{"query":"who painted the Mona Lisa","limit":3}'
   ```

## Running

### Just this service, against an in-memory store (no deps)

```bash
KNOWLEDGE_EMBEDDER=hash KNOWLEDGE_STORE=memory \
  uvicorn app.main:app --host 0.0.0.0 --port 8100
```

The hash embedder is deterministic but low-quality — it's there so the
pipeline is exercisable without Ollama or Qdrant.

### Full stack (Docker)

The `services/brain/docker-compose.yml` boots brain + knowledge + Qdrant
together:

```bash
cd services && docker-compose -f brain/docker-compose.yml up --build
```

Ollama stays on the host (faster, GPU-aware); the knowledge container
reaches it at `host.docker.internal:11434`.

## Configuration

All settings come from env vars (see `app/config.py`):

| Var | Default | Purpose |
|---|---|---|
| `KNOWLEDGE_PORT` | `8100` | listen port |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | embedder upstream |
| `KNOWLEDGE_EMBED_MODEL` | `nomic-embed-text` | Ollama model name |
| `KNOWLEDGE_EMBED_DIM` | `768` | must match the model |
| `QDRANT_URL` | _(unset)_ | use a server when set |
| `QDRANT_PATH` | `./data/qdrant` | embedded mode otherwise |
| `KNOWLEDGE_COLLECTION` | `wikipedia` | Qdrant collection name |
| `KNOWLEDGE_CHUNK_TOKENS` | `500` | target chunk size |
| `KNOWLEDGE_CHUNK_OVERLAP` | `50` | overlap between chunks |
| `KNOWLEDGE_EMBEDDER` | _(unset)_ | set to `hash` to force fallback |
| `KNOWLEDGE_STORE` | _(unset)_ | set to `memory` to force fallback |

## Brain integration

The brain proxies queries via `/knowledge/health` and `/knowledge/query`
(see `services/brain/app/routes/knowledge.py` + `app/clients/knowledge.py`).
The mobile app talks to the brain, not directly to this service — see
`/lib/knowledge.ts`.

## Tests

41 tests covering the chunker, wikitext stripper, embedder, in-memory
store, ingestor, and HTTP routes. Run from this directory:

```bash
KNOWLEDGE_EMBEDDER=hash KNOWLEDGE_STORE=memory python -m pytest
```

(The env vars steer the runtime to the dependency-light path used by
tests.)
