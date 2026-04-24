# Capabilities Map

This document defines Sallie as a *blend* of assistant archetypes.

## Assistant archetypes

### Siri/Alexa-like (Voice Operator)
- Push-to-talk voice capture
- Natural, short responses
- Device control and household routines
- Reminders, timers, quick actions

### Gemini-like (Research Assistant)
- Strong retrieval + synthesis
- Citations and “what I used” transparency
- Optional web search when enabled

### Copilot-like (Work/Coding Companion)
- Understands repos and docs
- Creates plans, drafts changes, runs safe tooling
- Produces structured outputs (PR descriptions, release notes, scripts)

### Venice/Meli-like (Chat Experience)
- Smooth chat UX (streaming, personas/tones)
- Model routing (local vs cloud) with clear privacy labeling
- User-configurable system behavior

## Core capability pillars
- **Conversation**: chat + voice
- **Memory**: short-term (session), long-term (curated)
- **Retrieval**: multi-source, citation-first
- **Tools**: integrations with permission gates
- **Autonomy**: only within explicit user-defined policies
- **Labs**: experiments behind toggles

## Definition of done (for any new capability)
- Has a clear permission model
- Produces an audit log entry
- Shows sources/tool outputs when applicable
- Has a failure mode that is safe and understandable
