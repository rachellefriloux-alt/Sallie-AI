# Sallie

Sallie is a next-generation Android launcher and personal AI system, designed to be an extension of you. She combines the best features of Alexa, Siri, Gemini, and ChatGPT, with advanced emotional intelligence, memory, and system control. Sallie is modular, extensible, and built for future upgrades.

## Features

- Multi-AI orchestration (Gemini, ChatGPT, Copilot)
- Hierarchical Memory System
  - Episodic memory for personal experiences
  - Semantic memory for factual knowledge
  - Emotional memory for affective associations
- Adaptive Learning Engine
  - Pattern recognition across domains
  - Experiential learning from user interactions
  - Knowledge synthesis and adaptation
- Advanced Personality System
  - Core vs. adaptive personality traits
  - Context-aware personality expression
  - Evolutionary personality development
- Emotional Intelligence
  - 30+ emotional states recognition
  - Empathic response generation
  - Feedback-based emotional calibration
- Communication System
  - Dynamic tone adaptation based on context
  - Natural language understanding and generation
  - Social intelligence and relationship modeling
- Full device control and automation
- Dynamic theming and UI customization
- Voice, chat, and system integrations
- Modular skill/plugin system
  - Research + capability execution pipeline (auto-select feasible actions)
  - Situation analysis & task orchestration
  - Bias interception & dignity protocols
  - Draft management & routine automation
  - Upgrade matrix & impact logging
  - Values reflection & legacy alignment
  - Feature registry with diagnostics

## Tech Stack

- Kotlin
- Jetpack Compose
- Firebase (Firestore & Auth)
- Gradle version catalogs
- Vue 3 + Vite (procedural visual layer)
- TypeScript + Vitest + ESLint + Prettier
- Procedural SVG theming & animation

## Getting Started

### Embedded Web UI (Vue) Fallback

The Android app attempts to load the live Vite dev server at `http://10.0.2.2:5173` inside a WebView. If unreachable, it falls back to a packaged offline bundle located under `app/src/main/assets`.

Steps to package the web layer for offline use:

1. Build the web bundle:

  ```bash
  npm install
  npm run build:web
  ```

1. Copy artifacts automatically via Gradle:

  ```bash
  ./gradlew :app:prepareWebAssets
  ```

  (Release asset merge depends on this if `dist-web` exists.)

1. Assemble release APK/AAB:

  ```bash
  ./gradlew :app:assembleRelease
  ```

Generated files (e.g. `index.html`, `assets/*`) are copied into `app/src/main/assets` and loaded if the dev server errors. For debug builds you can skip the build and just run `npm run dev`.

Verification:

```bash
./gradlew :app:verifyWebAssets
```

Will warn if `index.html` is missing before a release merge.

### Developer Loop (Fast Iteration)

Run both layers side-by-side:

```bash
# Terminal 1 (web UI)
npm run dev
# Terminal 2 (Android)
./gradlew :app:installDebug
adb shell am start -n com.sallie.launcher/.MainActivity
```

Hot reloading (Vite) appears instantly in the embedded WebView when the dev server is active.

1. Clone the repo
2. Open in Android Studio
3. Build and run the app

### Module Tests (Kotlin JVM feature layer)

Run feature module tests:

```bash
./gradlew :feature:test
```

The test suite currently covers task selection logic, draft lifecycle, routine execution, and device permission gating.

### Core & Feature Test Coverage

Continuous Integration runs core + feature tests with ktlint and Jacoco coverage.

Badges (placeholders until first CI + Codecov run):

![CI](https://img.shields.io/github/actions/workflow/status/your-org/sallie/ci.yml?branch=main)
![Coverage](https://img.shields.io/badge/coverage-aggregate--jacoco-%2300aa88)
![Codecov](https://img.shields.io/badge/codecov-report-blue)
![Ktlint](https://img.shields.io/badge/code%20style-ktlint-blue)

Aggregate coverage:

```bash
./gradlew jacocoAggregateReport
```

(override threshold with `COVERAGE_MIN=0.75`).
Add real coverage badge linking to Codecov after uploading first report.

## Folder Structure

- `app/` - Launcher app module
- `ai/` - AI orchestration and skills
- `core/` - Core logic, memory, context
  - `core/CapabilityRegistry.ts` - Declarative capability catalog & matching
  - `core/ResearchAgent.ts` - Research + plan + execute pipeline
- `feature/` - Modular features and integrations
- `feature/FeatureRegistry.kt` - Central access point for feature singletons & summary metrics
- `components/` - UI components
- `ui/visual/` - Web visual/theming utilities

### Visual System (Web Layer)

Procedural runtime visuals (no static image assets):

| Module | Purpose |
|--------|---------|
| `ui/visual/themeGenerator.ts` | Mood → palette + gradient generation |
| `ui/visual/svgGenerator.ts` | Avatar, patterns, waves |
| `ui/visual/visualizationUtils.ts` | Emotion meter, charts |
| `ui/visual/voiceVisualUtils.ts` | Waveform & spectrum SVG |
| `ui/visual/animationUtils.ts` | CSS keyframe generators |
| `ui/visual/sanitize.ts` | SVG sanitization (regex + optional DOMPurify) |
| `ui/components/SafeSvg.vue` | Safe render wrapper replacing direct `v-html` |

### Safe SVG Embedding

All dynamic SVG is passed through `sanitizeSvg`. For production hardening, DOMPurify can be bundled; the sanitizer auto-detects a global `DOMPurify` instance. To integrate, import and attach DOMPurify to `globalThis` before first render or adapt `sanitize.ts` to explicitly import it.

### Testing (Web Layer)

Run TypeScript typecheck, unit tests (including snapshot tests for SVG):

```bash
npm run typecheck
npm test
```

Coverage reports (Vitest + V8) uploaded in CI alongside Kotlin Jacoco reports.
