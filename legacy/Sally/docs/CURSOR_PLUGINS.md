# Cursor plugins and MCP (this repo)

Quick reference for plugins used with Sallie and how to enable them.

## MCP authentication

Some MCP servers need a one-time sign-in before their tools work:

- **Supabase** — In Cursor: **Settings → MCP** (or Integrations). Find the Supabase server and sign in / connect your project. Once linked, the agent can use `list_tables`, `execute_sql`, `search_docs`, etc.
- **Figma** — Same place: connect your Figma account so the agent can read design context and Code Connect.
- **Prisma Remote** — Connect if you use Prisma Cloud or remote schema sync.

You do **not** need to call `mcp_auth` from chat; use the Cursor UI to authenticate each server. If a server shows "needs authentication" in STATUS, complete sign-in in Settings.

## Plugins used to improve this app

- **Supabase (Postgres best practices)** — Used for RLS optimization and indexes (see `supabase/migrations/20250217100000_postgres_best_practices_rls_indexes.sql`).
- **Context7** — Used for up-to-date Next.js and Supabase docs when implementing caching and data fetching.
- **Browser (cursor-ide-browser)** — Available for front-end testing and debugging in the browser.
- **Figma** — Connected. To have the agent use design context: share a Figma file URL (e.g. `https://figma.com/design/ABC123/MyFile?node-id=1-2`). The agent can then call `get_design_context` with the file key and node id to align UI code with your designs.
- **Prisma** — Connected. This repo uses **Supabase** for Postgres (not Prisma Cloud), so Prisma Remote’s “list databases” is empty. The Prisma schema is the source of truth for the ORM; `@@index` hints were added for common query patterns (see `prisma/schema.prisma`). Run `npx prisma generate` after schema changes.

## Skills

- **supabase-postgres-best-practices** — Applied when writing or reviewing SQL, migrations, and RLS policies.
