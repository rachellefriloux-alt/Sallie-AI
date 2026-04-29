# Configuration

This document explains every environment variable consumed by the Sallie
codebase. Copy [`.env.example`](../.env.example) to `.env` (or `.env.local`)
and fill in the values you need.

> Per [ADR 0005 — Quality bar](./architecture/0005-quality-bar.md) and
> [ADR 0007 — Convergence storage](./architecture/0007-convergence-storage.md):
> **never commit a real `.env`**. Production deployments read secrets from
> a secret manager, not from `.env` files (Phase 8, build plan item 92).

## Layout

- **Root `.env.example`** — defaults shared by every workspace member.
- **Per-app `.env.example`** — added under `apps/*/.env.example` and
  `services/*/.env.example` as those workspaces land. Each one inherits
  the root values and only documents app-specific overrides.

## Variables

### App
| Name | Required? | Description |
|------|-----------|-------------|
| `NODE_ENV` | dev | `development` \| `test` \| `production`. |
| `EXPO_PUBLIC_API_URL` | dev | URL of the brain the mobile/web client should talk to. Default `http://localhost:3000`. |

### Brain — connectivity (per ADR 0004)
| Name | Required? | Description |
|------|-----------|-------------|
| `BRAIN_HOST` | yes | Bind address for the brain HTTP server. `0.0.0.0` for container, `127.0.0.1` for laptop-only. |
| `BRAIN_PORT` | yes | Bind port. Default `8000`. |
| `SALLIE_LAN_HOST` | client | mDNS / hostname clients try first. Default `sallie.local`. **Do not use IP literals — see ADR 0004.** |
| `SALLIE_LAN_PORT` | client | Companion of the above. Default `8742`. |
| `SALLIE_TUNNEL_URL` | optional | Public-tunnel fallback (Cloudflare or equivalent). Used only if LAN + mesh are unreachable. |

### Brain — auth & storage (Phase 1)
| Name | Required? | Description |
|------|-----------|-------------|
| `BRAIN_JWT_SECRET` | yes (prod) | HS256 signing key for issued JWTs. Min 32 bytes. Read from secret manager in prod. |
| `BRAIN_JWT_REFRESH_SECRET` | yes (prod) | Separate signing key for refresh tokens. |
| `DATABASE_URL` | yes | Postgres connection string for the brain. Example `postgres://sallie:sallie@localhost:5432/sallie`. |
| `REDIS_URL` | yes | Redis connection string for session cache, rate limit, pub/sub, and Working memory tier (per ADR 0001). |

### Brain — AI providers (Phase 1 + Phase 6)
| Name | Required? | Description |
|------|-----------|-------------|
| `OLLAMA_BASE_URL` | local | Ollama endpoint for local models. Default `http://localhost:11434`. |
| `OLLAMA_MODEL` | local | Default chat model, e.g. `llama3.1:8b`. |
| `OLLAMA_EMBED_MODEL` | local | Default embedding model, e.g. `nomic-embed-text`. |
| `OPENAI_API_KEY` | optional | Cloud fallback. Empty by default — Sallie is local-first per VISION §1. |
| `ANTHROPIC_API_KEY` | optional | Cloud fallback. |
| `GOOGLE_API_KEY` | optional | Cloud fallback. |
| `PERPLEXITY_API_KEY` | optional | Cloud fallback. |

### Knowledge / RAG (Phase 3)
| Name | Required? | Description |
|------|-----------|-------------|
| `QDRANT_URL` | yes | Qdrant endpoint. Default `http://localhost:6333`. |
| `QDRANT_API_KEY` | optional | Required if Qdrant is configured with auth. |
| `QDRANT_COLLECTION` | yes | Collection name for the Wikipedia index. Default `wikipedia`. |
| `WIKIPEDIA_DUMP_URL` | install | URL of the Wikipedia dump for the install-time downloader. |

### Object storage (Phase 0.6 + Phase 1)
| Name | Required? | Description |
|------|-----------|-------------|
| `S3_ENDPOINT` | yes | MinIO / S3 endpoint. Default `http://localhost:9000`. |
| `S3_ACCESS_KEY` | yes | MinIO root user / S3 access key. |
| `S3_SECRET_KEY` | yes | MinIO root password / S3 secret key. |
| `S3_BUCKET_AVATARS` | yes | Bucket for avatar assets. Default `sallie-avatars`. |
| `S3_BUCKET_AUDIO` | yes | Bucket for audio assets (TTS, recordings). Default `sallie-audio`. |

### Observability (Phase 9)
| Name | Required? | Description |
|------|-----------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | optional | OTel collector endpoint. Disabled by default. |
| `LOG_LEVEL` | optional | `trace` \| `debug` \| `info` \| `warn` \| `error`. Default `info`. |
| `SENTRY_DSN` | optional | Sentry DSN for client crash reporting. |

### Firebase (legacy host repo — optional cloud sync)
| Name | Required? | Description |
|------|-----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | optional | Set only if using Firebase as the cloud backup target. |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | optional | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | optional | |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | optional | |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | optional | |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | optional | |

### Android signing (release builds only)
| Name | Required? | Description |
|------|-----------|-------------|
| `KEYSTORE_FILE` | release | Path to the upload keystore. |
| `KEYSTORE_PASSWORD` | release | Keystore password. |
| `KEY_ALIAS` | release | Key alias. |
| `KEY_PASSWORD` | release | Key password. |

## Local stack via Docker

The brain dev stack (Postgres, Redis, Qdrant, MinIO, plus the existing
`brain` and `knowledge` FastAPI services) is brought up via the existing
`services/brain/docker-compose.yml`:

```bash
docker compose -f services/brain/docker-compose.yml up -d
```

Ollama is intentionally **not** containerised (it's faster to install
natively so it can use the host's GPU). Install Ollama on the host and
the knowledge service will reach it at `http://host.docker.internal:11434`.

The root `docker-compose.yml` (the legacy app-only stack) is unchanged
and independent.

## Production

Per ADR 0005 / Phase 8: production reads from a secret manager
(1Password Connect, Doppler, AWS Secrets Manager, GCP Secret Manager).
The `.env` flow is **development only**.
