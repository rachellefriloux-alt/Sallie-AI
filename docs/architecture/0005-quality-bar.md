# 0005 — Quality bar

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §3 (Repository Layout),
  `legacy/sallie-project/COMPLETE-REQUIREMENTS.md`, build plan
  Phase 0.7.

## Context

The host repo and the seven legacy snapshots vary widely in code
quality. `legacy/sallie-project/` documents a complete requirements
bar (TS strict, zero `any`, ≥90% coverage, sub-100ms p95, full JSDoc).
Other source repos have looser standards, partial test coverage, or
outright `// TODO` markers in shipping code.

Without a canonical bar, code promoted from `legacy/` into `services/`
or `packages/` would carry its origin's quality forward, and the new
unified codebase would inherit the lowest common denominator.

## Decision

We will adopt the **`sallie-project/COMPLETE-REQUIREMENTS.md` quality
bar** as the canonical promotion gate. Code may live in `legacy/` at
any quality level (it is a read-only snapshot), but to be promoted
into `services/`, `packages/`, or `apps/` it must meet:

### Code quality
1. **TypeScript strict mode.** `tsconfig.base.json` sets
   `"strict": true`, `"noUncheckedIndexedAccess": true`,
   `"noImplicitOverride": true`, `"exactOptionalPropertyTypes": true`.
2. **Zero `any`.** ESLint rule `@typescript-eslint/no-explicit-any`
   set to `error`. Use `unknown` and narrow.
3. **Zero TODOs in shipping code.** ESLint rule against `TODO` /
   `FIXME` / `XXX` comments in promoted code. Open an issue instead.
4. **Full JSDoc on every exported symbol** in `packages/*` (the
   public surface). Apps and services document non-trivial functions.
5. **Conventional Commits** (enforced by `commitlint` in CI).
6. **No console.log** in promoted code (use the structured logger).

### Testing
7. **≥90% line and branch coverage** on `packages/*` and
   `services/brain/`. **≥70%** on `apps/*` (UI). Coverage gate fails
   the build below threshold.
8. **Unit + integration + contract tests.** Brain endpoints have
   contract tests against the OpenAPI spec consumed by `packages/sdk`.
9. **Snapshot tests for persona-rendered output** (Phase 4):
   given DNA + mood + intent, output must match a golden file.

### Performance
10. **Brain p95 ≤ 100 ms** for memory and persona endpoints
    (sallie-project bar); **p95 ≤ 200 ms** for conversation endpoints
    (build plan item 46). Tracked via OpenTelemetry; CI runs a
    benchmark suite on every PR and fails on regression > 10 %.
11. **Web LCP ≤ 2.5 s, mobile cold start ≤ 2 s, desktop cold start
    ≤ 1.5 s** (build plan item 88). Tracked in CI via Lighthouse / a
    cold-start harness.

### Security
12. **No secrets in source.** Pre-commit hook + secret scan in CI.
13. **CodeQL, Dependabot, `pnpm audit` / `pip-audit` / `gradle
    dependency-check`** are required CI checks (build plan item 93).
14. **Crypto via vetted libraries.** No hand-rolled crypto. AES-256-GCM
    for at-rest encryption (per ADR 0007).

### Documentation
15. Every package / service has a `README.md` that explains: what it
    is, how to run it, how to test it, and what it depends on.
16. Every architectural decision goes through this ADR process.

## Promotion checklist

When a file moves from `legacy/<repo>/` into `services/`, `packages/`,
or `apps/`, the PR must:

- [ ] Pass all CI checks listed above.
- [ ] Have an entry in the destination's `README.md` documenting the
      origin path.
- [ ] Update `MERGE_NOTES.md` to mark the source as "Promoted".
- [ ] Be reviewed by a human + Copilot review.

## Alternatives considered

- **No formal bar; rely on code review.** Rejected: doesn't scale,
  inconsistent across PRs, allows the lowest-common-denominator drift.
- **Adopt the host repo's existing (looser) standards.** Rejected:
  defeats the consolidation; the codebase we want is the
  sallie-project quality level.
- **Stricter (e.g. 100 % coverage, p95 ≤ 50 ms).** Rejected as
  unrealistic for a small team and would gate genuine progress.

## Consequences

- **Positive:**
  - Promoted code is consistent, testable, observable, and secure.
  - `legacy/` stays untouched as the historical snapshot, so nothing
    is lost while quality is enforced going forward.
  - The bar is mechanically checkable, so review can focus on design.
- **Negative:**
  - Promotions are slower than copy-pasting. The plan budgets for this
    by allowing per-module promotion PRs rather than wholesale moves.
  - Some legacy modules will need substantial rework before they can
    be promoted. That is intentional.
- **Follow-ups:**
  - Land `tsconfig.base.json`, root ESLint config, root Prettier
    config, Husky + lint-staged, commitlint, and Changesets in the
    Phase 0.6 PR (build plan items 9–11).
  - Wire all the CI gates listed above in the Phase 0.7 PR (build plan
    items 16–18).
  - Add the promotion checklist to `.github/PULL_REQUEST_TEMPLATE.md`.

## References

- `legacy/sallie-project/COMPLETE-REQUIREMENTS.md`.
- `VISION.md` §3.
- Build plan items 8–19, 88, 93.
