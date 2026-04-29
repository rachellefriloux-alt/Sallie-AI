# API Reference

## Overview

Sallie Studio provides 159 Next.js API routes for managing conversations, AI chat, user profiles, growth tracking, life management, and more. All routes are serverless functions running within the Next.js App Router.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: Your deployed URL + `/api`

## Authentication

Supabase Auth via cookies (SSR). Browser requests are authenticated automatically. Mobile/external clients include the Supabase access token.

## Core Endpoints

### Health
- `GET /api/health` — Health check

### Auth
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `POST /api/auth/register` — Register
- `POST /api/auth/refresh` — Refresh session
- `GET/POST /api/auth/validate` — Validate session
- `GET /api/auth/profile` — Auth profile
- `POST /api/auth/change-password` — Change password
- `POST /api/auth/enable-2fa` — Enable 2FA
- `POST /api/auth/verify-2fa` — Verify 2FA

### Chat
- `POST /api/chat` — AI chat (streaming)
- `GET /api/chat/history` — Chat history
- `GET/POST /api/chat/messages` — Messages
- `GET/PUT/DELETE /api/chat/messages/[messageId]` — Message CRUD
- `GET /api/chat/search` — Search messages
- `GET/POST /api/chat/threads` — Threads

### User
- `GET/PUT /api/user/profile` — Profile
- `GET/POST /api/user/avatar` — Avatar
- `GET /api/user/export` — Export data
- `DELETE /api/user/delete` — Delete account
- `GET /api/user/stats` — Stats
- `GET/PUT /api/settings` — Settings

### Convergence
- `GET/POST /api/convergence` — Convergence data
- `GET /api/convergence/status` — Progress
- `POST /api/convergence/start` — Start session
- `GET /api/convergence/question` — Current question
- `POST /api/convergence/answer` — Submit answer
- `POST /api/convergence/complete` — Complete

### Limbic
- `GET /api/limbic/state` — Emotional state
- `GET /api/limbic/trust` — Trust level
- `GET /api/limbic/history` — History

### Growth & Life
- `GET/POST /api/growth/goals` — Goals
- `GET/POST /api/growth/focus-tasks` — Focus tasks
- `GET/POST /api/growth/energy` — Energy
- `GET/POST /api/growth/journal` — Journal
- `GET/POST /api/life/contexts` — Contexts
- `GET/POST /api/life/daily-items` — Daily items
- `GET/POST /api/life/tasks` — Tasks
- `GET/POST /api/life/recall` — Recall

### Tools
- `POST /api/tools/calculator` — Calculator
- `POST /api/tools/vision` — Image understanding
- `POST /api/tools/image-gen` — Image generation
- `POST /api/tools/diagram` — Diagram generation
- `POST /api/tools/presentation` — Presentations
- `POST /api/tools/knowledge-graph` — Knowledge graph
- `POST /api/tools/memory` — Semantic memory
- `POST /api/tools/learning` — Learning/skills
- `POST /api/tools/scheduling` — Scheduling
- `POST /api/tools/workflow` — Workflows
- `GET /api/search/web` — Web search

### Device Actions
- `GET /api/actions/available` — Available actions
- `POST /api/actions/execute` — Execute action

### Integrations
- `GET/POST /api/integrations` — Service integrations

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the complete list of all 159 routes with descriptions.

## Data Models

### User Profile
```json
{
  "id": "string (UUID)",
  "email": "string",
  "name": "string",
  "avatarUrl": "string | null",
  "convergenceComplete": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Conversation
```json
{
  "id": "string (UUID)",
  "userId": "string",
  "title": "string",
  "mode": "chat | communication",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Message
```json
{
  "id": "string (UUID)",
  "conversationId": "string",
  "role": "user | assistant | system",
  "content": "string",
  "createdAt": "datetime"
}
```

### Heritage DNA
```json
{
  "id": "string (UUID)",
  "userId": "string",
  "questionNumber": "number",
  "answer": "string",
  "category": "string",
  "createdAt": "datetime"
}
```

### Limbic State
```json
{
  "trust": "number (0-1)",
  "warmth": "number (0-1)",
  "arousal": "number (0-1)",
  "valence": "number (0-1)",
  "posture": "string"
}
```

## Error Format

```json
{
  "error": "Human-readable error message"
}
```

## Testing

```bash
curl http://localhost:3000/api/health
```

For authenticated endpoints, use a browser (cookies) or include Supabase auth headers.
