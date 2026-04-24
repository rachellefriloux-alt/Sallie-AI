# Sallie API Documentation

Complete API reference for Sallie's Next.js API routes. All endpoints are Next.js App Router API routes under `src/app/api/`. There is no separate backend server — everything runs through Next.js.

---

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: Your deployed URL + `/api` (e.g., `https://your-app.vercel.app/api`)

---

## Authentication

Most API endpoints require Supabase authentication. The user must be signed in via Supabase Auth (magic link, email/password, etc.). Server-side routes read the session from cookies automatically.

No JWT token header is needed for browser requests — Supabase SSR handles auth via cookies. For external clients (mobile, desktop), include the Supabase session token.

---

## API Route Groups (159 routes)

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check — returns `{ status: "ok" }` |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/refresh` | Refresh session |
| GET/POST | `/api/auth/validate` | Validate current session |
| GET | `/api/auth/profile` | Get auth profile |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/auth/last-login` | Get last login time |
| POST | `/api/auth/enable-2fa` | Enable two-factor auth |
| POST | `/api/auth/verify-2fa` | Verify 2FA code |

### Chat & Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message, get AI response (streaming) |
| GET | `/api/chat/history` | Get chat history |
| GET/POST | `/api/chat/messages` | List or create messages |
| GET/PUT/DELETE | `/api/chat/messages/[messageId]` | Get, update, or delete a message |
| POST | `/api/chat/messages/[messageId]/bookmark` | Bookmark a message |
| GET/POST | `/api/chat/messages/[messageId]/reactions` | Message reactions |
| DELETE | `/api/chat/messages/[messageId]/reactions/[reactionId]` | Remove reaction |
| GET | `/api/chat/search` | Search messages |
| GET/POST | `/api/chat/threads` | List or create threads |

### Convergence (Genesis Onboarding)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/convergence` | Get or save convergence data |
| GET | `/api/convergence/status` | Get convergence progress |
| POST | `/api/convergence/start` | Start convergence session |
| GET | `/api/convergence/question` | Get current question |
| GET | `/api/convergence/questions` | Get all questions |
| POST | `/api/convergence/answer` | Submit answer |
| POST | `/api/convergence/complete` | Complete convergence |
| POST | `/api/convergence/mirror-test` | Run mirror test |
| POST | `/api/convergence/elastic-mode/enable` | Enable elastic mode |
| POST | `/api/convergence/elastic-mode/disable` | Disable elastic mode |
| GET | `/api/convergence/elastic-mode/status` | Elastic mode status |

### Heritage DNA

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/heritage/dna` | Get heritage DNA profile |
| PUT | `/api/heritage/[section]` | Update heritage section |

### Limbic Engine (Emotional State)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/limbic` | Get limbic data |
| GET | `/api/limbic/state` | Get current emotional state |
| GET | `/api/limbic/trust` | Get trust level |
| GET | `/api/limbic/history` | Get limbic history |
| GET | `/api/state` | Get state (alias) |
| GET | `/api/history` | Get history (alias) |
| POST | `/api/interact` | Record interaction |
| POST | `/api/reset` | Reset limbic state |

### Ghost System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ghost/suggestions` | Get context-aware suggestions |
| GET | `/api/ghost/veto_pending` | Get pending veto items |
| POST | `/api/ghost/veto_pending` | Submit veto decision |

### Genesis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/genesis/dream-cycle/start` | Start dream cycle |
| GET | `/api/genesis/dream-cycle/status` | Dream cycle status |
| POST | `/api/genesis/dream-cycle/stop` | Stop dream cycle |
| GET/POST | `/api/genesis/hypotheses` | List or create hypotheses |
| GET | `/api/genesis/promotion/candidates` | Get promotion candidates |
| POST | `/api/genesis/promotion/promote` | Promote a hypothesis |
| GET | `/api/genesis/veto/active` | Get active veto items |
| POST | `/api/genesis/veto/trigger` | Trigger veto |

### User & Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/user/profile` | Get or update user profile |
| GET/POST | `/api/user/avatar` | Get or upload avatar image |
| GET | `/api/user/export` | Export user data (JSON or TXT) |
| DELETE | `/api/user/delete` | Delete user account and data |
| GET | `/api/user/stats` | Get user statistics |
| GET/PUT | `/api/settings` | Get or update settings |

### Growth & Life Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/growth/goals` | Goals CRUD |
| GET/POST | `/api/growth/focus-tasks` | Focus tasks |
| GET/POST | `/api/growth/energy` | Energy tracking |
| GET/POST | `/api/growth/journal` | Journal entries |
| GET/POST | `/api/life/contexts` | Life contexts |
| GET/POST | `/api/life/daily-items` | Daily items |
| GET/POST | `/api/life/tasks` | Tasks |
| GET/POST | `/api/life/recall` | Quick recall |
| GET | `/api/lifeos/state` | LifeOS state |
| POST | `/api/lifeos/sync` | LifeOS sync |

### Avatar & Sallieverse

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/avatar/state` | Get avatar state |
| POST | `/api/avatar/change-form` | Change avatar form |
| POST | `/api/avatar/customize` | Customize avatar |
| GET | `/api/avatar/render` | Render avatar image |
| GET | `/api/sallieverse/state` | Get sallieverse state |
| POST | `/api/sallieverse/change-room` | Change room |
| POST | `/api/sallieverse/interact` | Interact in sallieverse |

### Communication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/communication/email/draft` | Email drafts |
| GET/POST | `/api/communication/email/outbox` | Email outbox |
| GET/POST | `/api/communication/text/chat` | Text chat |
| GET | `/api/communication/text/history` | Text history |

### Tools & Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tools/calculator` | Calculator |
| POST | `/api/tools/timer` | Timer management |
| GET/POST | `/api/tools/notes` | Notes CRUD |
| GET/POST | `/api/tools/reminders` | Reminders CRUD |
| POST | `/api/tools/unit-convert` | Unit conversion |
| POST | `/api/tools/vision` | GPT-4o vision / image understanding |
| POST | `/api/tools/image-gen` | DALL-E 3 image generation |
| POST | `/api/tools/audio-analysis` | Audio transcription + analysis |
| POST | `/api/tools/diagram` | AI diagram generation (Mermaid) |
| POST | `/api/tools/visualization` | AI data visualization (Chart.js) |
| POST | `/api/tools/presentation` | AI presentation generation |
| POST | `/api/tools/knowledge-graph` | Knowledge graph operations |
| POST | `/api/tools/memory` | Semantic memory store/recall |
| POST | `/api/tools/learning` | Skill tracking / study plans |
| POST | `/api/tools/scheduling` | Calendar / scheduling |
| POST | `/api/tools/workflow` | Workflow engine |
| POST | `/api/tools/search` | Search tool |

### Device Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/actions/available` | List available device actions |
| POST | `/api/actions/execute` | Execute a device action |

### Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/integrations` | List or manage integrations |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/memory` | Memory operations |
| GET/DELETE | `/api/memory/[id]` | Get or delete memory by ID |
| GET/POST | `/api/memory/memories` | List or create memories |
| GET/PUT/DELETE | `/api/memory/memories/[id]` | Memory CRUD by ID |
| GET | `/api/memory/memories/search` | Search memories |
| GET | `/api/memory/metadata` | Memory metadata |
| GET | `/api/memory/stats` | Memory statistics |

### Omnis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/omnis/query` | Query Omnis |
| GET | `/api/omnis/history` | Query history |
| GET/POST | `/api/omnis/knowledge-base` | Knowledge base CRUD |
| GET/PUT/DELETE | `/api/omnis/knowledge-base/[id]` | Knowledge base item |
| POST | `/api/omnis/modes/[id]/activate` | Activate Omnis mode |
| GET | `/api/omnis/sources` | Data sources |
| GET | `/api/omnis/statistics` | Usage statistics |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/capabilities` | List all capabilities |
| GET | `/api/capabilities/discover` | Discover capabilities |
| GET | `/api/features` | List features |
| POST | `/api/features/[id]/toggle` | Toggle a feature |
| GET | `/api/agency/status` | Agency status |
| POST | `/api/analytics/feature-used` | Track feature usage |
| POST | `/api/analytics/events` | Track events |
| POST | `/api/analytics/ai-insights` | AI analytics insights |
| GET | `/api/cognitive` | Cognitive data |
| GET | `/api/consciousness` | Consciousness state |
| GET/POST | `/api/control/status` | Control status |
| GET | `/api/control/history` | Control history |
| POST | `/api/control/[action]` | Execute control action |
| GET | `/api/core/identity` | Core identity data |
| GET | `/api/discover` | Discovery data |
| POST | `/api/dream-cycle` | Dream cycle |
| GET | `/api/duality/state` | Duality state |
| POST | `/api/duality/switch-mode` | Switch duality mode |
| POST | `/api/enhance` | AI text enhancement |
| GET/POST | `/api/extensions` | Extensions list/manage |
| POST | `/api/extensions/propose` | Propose extension |
| GET | `/api/kinship` | Kinship data |
| GET/POST | `/api/learning/skills` | Learning skills |
| GET/POST | `/api/messenger/contacts` | Messenger contacts |
| POST | `/api/messenger/send` | Send message |
| GET | `/api/monologue/thoughts` | Thought log |
| GET | `/api/resonance/patterns` | Resonance patterns |
| GET | `/api/search/web` | Web search (DuckDuckGo) |
| GET | `/api/sensors/activity` | Sensor activity |
| POST | `/api/speech-to-text` | Speech to text |
| POST | `/api/text-to-speech` | Text to speech |
| GET/POST | `/api/storage/files` | File storage |
| POST | `/api/sync/toggle` | Toggle sync |
| GET/POST | `/api/thought-action-log` | Thought/action log |
| GET | `/api/transparency/log` | Transparency log |
| POST | `/api/voice/stt` | Voice STT |
| POST | `/api/voice/tts` | Voice TTS |
| POST | `/api/voice/toggle` | Toggle voice |
| POST | `/api/v1/agency/sync` | Agency sync (v1) |

---

## Error Responses

All errors return JSON:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `401` — Not authenticated
- `403` — Forbidden
- `404` — Not found
- `405` — Method not allowed
- `422` — Validation error
- `429` — Rate limited
- `500` — Internal server error

---

## Rate Limiting

In-memory rate limit on `/api/chat`: 60 requests per minute per IP. See `src/lib/rate-limit.ts`.

---

## Notes

- All routes are Next.js App Router routes — no separate server process needed.
- AI chat uses a fallback chain: Ollama (local) → Azure OpenAI → OpenAI.
- Voice (STT/TTS) requires Azure Speech Services keys.
- Image generation requires an OpenAI or Azure OpenAI API key.
- The app works without any AI keys — chat and AI features will show appropriate messages when keys are missing.
