# 0007 — Convergence storage

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [ADR 0001 Memory tier model](./0001-memory-tier-model.md),
  [ADR 0002 Identity model](./0002-identity-model.md),
  [ADR 0006 Convergence canon](./0006-convergence-canon.md),
  `legacy/sallie-project/` (AES-256-GCM at-rest precedent),
  [`VISION.md`](../../VISION.md) §1 Principle 5 (No secrets in git).

## Context

Convergence answers (Q1–Q40 per ADR 0006) and the resulting DNA blob
(per ADR 0002) are the most personal data Sallie holds. The source
repos handled them inconsistently:

- **`legacy/sallie-project/`** encrypts memory at rest with AES-256-GCM
  and treats persona data as part of memory.
- **`legacy/Sallie/`** keeps Heritage answers in plain JSON inside the
  brain's data directory.
- **The host repo** persists `sallie_identity.json` in plain text in
  the working directory.
- **`legacy/sallieos/`** uses an opaque blob store with no clear
  encryption story.

We need to fix three things:

1. Where the answers and DNA blob live.
2. How they are encrypted at rest.
3. Whether (and how) they sync between the user's devices.

## Decision

### Where

- **Answers (Q1–Q40 per protocol)** live in the brain's persistence
  layer under `convergence/answers/<protocol>.json`, one file per
  protocol so a single re-run touches exactly one file (per ADR 0006).
- **DNA blob** lives at `convergence/dna/current.json` plus a
  versioned history under `convergence/dna/history/<version>.json`.
- **Both are part of the user record**, not the memory tiers from
  ADR 0001. They are read by `packages/persona` at runtime and seeded
  into Episodic memory on creation, but they are not themselves
  memory records.
- **The host repo's `sallie_identity.json` is deprecated** by ADR 0002
  and migrated into Visage answers + the DNA blob on first run after
  the Phase 4 Convergence engine ships.

### Encryption at rest

- **AES-256-GCM** for both answers and DNA blob (matches
  sallie-project precedent, FIPS-approved, authenticated).
- **Key material:**
  - On desktop, the data-encryption key (DEK) is wrapped by a
    key-encryption key (KEK) stored in the OS keychain (macOS
    Keychain, Windows Credential Manager, Linux libsecret) — see
    build plan item 83.
  - On the brain (server), the KEK is stored in the configured
    secret manager (build plan item 92). Plain `.env` is allowed in
    development only.
  - On mobile, the KEK is stored in Android Keystore.
- **Per-record nonces** (96-bit random) and authenticated additional
  data including the record path and version. Nonce reuse with the
  same key is forbidden.
- **No hand-rolled crypto.** Use the platform's vetted AES-GCM
  implementation (libsodium / WebCrypto / Android Keystore /
  `cryptography` Python package). Per ADR 0005 quality bar item 14.
- **Key rotation** is supported: rotating the KEK re-wraps the DEK;
  rotating the DEK re-encrypts all Convergence files in a background
  job. Rotation events are logged in the audit log (per ADR 0003).

### Sync between devices

- **Default: no sync.** The DNA blob lives on the brain. Clients fetch
  it over the connectivity model (ADR 0004) when they need it and
  cache it locally encrypted with the same AES-256-GCM scheme.
- **Optional cloud backup** (per ADR 0001): if the user opts in, the
  encrypted blob and answers are uploaded to user-chosen object
  storage (S3-compatible). The cloud sees only ciphertext; the KEK
  never leaves the user's devices / brain.
- **Multi-device first install:** the second device pairs with the
  brain (per ADR 0004 device pairing) and pulls the encrypted blob
  via the brain. The brain re-wraps the DEK for the new device's
  keychain entry during pairing.
- **Conflict resolution:** Convergence answers are
  protocol-versioned (ADR 0006). On conflict, the higher version
  wins; on tie, the brain prompts the user to choose. Conflicts on
  the DNA blob itself should be impossible because only the brain
  signs new versions, but if detected, the brain version wins and a
  warning is logged.

## Alternatives considered

- **Plain JSON on disk** (current state in some repos). Rejected:
  Convergence answers are deeply personal; plaintext at rest is
  unacceptable for v1.
- **OS-keychain-only storage (no encrypted file).** Rejected: hits
  per-platform size limits and complicates backup/export.
- **End-to-end encrypted multi-device sync via a hosted service.**
  Out of scope for this ADR; revisit if a hosted tier ships.
- **Different cipher (e.g. ChaCha20-Poly1305).** Acceptable cipher,
  but standardizing on AES-256-GCM matches the existing
  sallie-project implementation and avoids cipher proliferation.

## Consequences

- **Positive:**
  - Convergence data is encrypted at rest on every surface.
  - One canonical layout under `convergence/` makes backup, export,
    and the Phase 8 GDPR/CCPA "delete me" flow straightforward.
  - Per-protocol files make ADR 0006's "re-run one protocol" cheap
    (rewrite one file, mint one new DNA version).
- **Negative:**
  - Key management is now a real subsystem with a real failure mode
    (lose the KEK, lose the data). The Phase 8 backup story
    (build plan item 100) must explicitly cover key escrow / recovery
    phrases.
  - Multi-device pairing is a few seconds slower because of the
    re-wrap step.
- **Follow-ups:**
  - Define the on-disk schema in `packages/core/convergence.ts`
    (Phase 0.6 / Phase 4).
  - Implement the encryption layer in `services/brain/storage/`
    (Phase 1).
  - Implement keychain wrappers per platform in
    `packages/sdk/keystore/` (Phase 2A–C).
  - Document the recovery-phrase flow before any data is encrypted
    for a real user (Phase 8).
  - Open a follow-up ADR for hosted-tier sync if/when that ships.

## References

- ADR 0001, 0002, 0003, 0004, 0005, 0006.
- `legacy/sallie-project/services/memory/` — AES-256-GCM precedent.
- `VISION.md` §1 Principle 5.
- Build plan items 30, 83, 92, 94, 100.
