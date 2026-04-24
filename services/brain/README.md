# services/brain/ — Python AI brain (the nine core systems)

**Canonical home for:** Sallie's mind. Per [`../../VISION.md`](../../VISION.md)
§2, this hosts the nine cooperating subsystems (Limbic, Memory, Monologue,
Synthesis, Agency, Dream Cycle, Degradation, Control, Convergence) plus
the Convergence onboarding flow.

**Current state:** Not yet promoted from legacy. Seed material is ready
in `legacy/Sallie/` and `legacy/app/backend/`.

### Sources to merge here (in priority order)
| Source                                | What to take                                |
|---------------------------------------|---------------------------------------------|
| `legacy/Sallie/sallie_brain.py`       | Top-level brain orchestrator                |
| `legacy/Sallie/sallie/`               | Nine-systems Python package                 |
| `legacy/Sallie/backend/`              | Ollama + Qdrant integration, FastAPI shell  |
| `legacy/app/backend/`                 | Gemini 3 Flash + MongoDB endpoints          |
| Root `ai/`                            | EmotionalArcMemory, PredictiveCompanion, MultiModalPersonaResonance (currently JS — port or wrap) |

### Build (target)
```bash
cd services/brain
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Convergence
The 40-question Convergence flow (Heritage DNA + Visage Protocol) lives
under `services/brain/app/convergence/` per VISION.md §2.
