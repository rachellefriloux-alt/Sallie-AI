# Data Sources & “Limitless” Strategy

## What users want
- “Use everything I have access to”
- “Always cite what you used”
- “Don’t leak private data to cloud models”

## What we can actually build
Sallie supports *unbounded* source types by using connectors.

### Source categories
- **Local**: files, folders, PDFs, notes
- **Accounts**: email, calendar, Drive, GitHub, Notion
- **Devices**: smart home hubs, sensors
- **Optional web**: search APIs, specific websites (user-enabled)

## Retrieval principles
- Citation-first packaging (snippets + URLs/paths)
- Per-source permissions (on/off, scopes)
- Caching and incremental indexing
- Separate “private” and “shareable” memory spaces

## Reality check
“Limitless” is bounded by:
- time and compute
- rate limits (APIs)
- user-granted access

So the product promise becomes: **limitless extensibility + maximum transparency**.
