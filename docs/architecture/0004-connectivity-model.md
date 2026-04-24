# 0004 — Connectivity model

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §1 Principle 1
  (Local-first), Phase 2 in the build plan, [ADR 0003 Trust & safety
  doctrine](./0003-trust-and-safety-doctrine.md).

## Context

Sallie's clients (mobile / web / desktop) talk to a single brain. The
source repos hard-coded one path:

- **`legacy/Sallie/` and the host repo** ship a hard-coded LAN
  endpoint `192.168.1.47:8742` in many files (web `next.config.js`,
  several `shared/services/*.ts` modules, agency-service entry point,
  Vue components, etc.). This works on exactly one network.
- **`legacy/sallie-project/` and `legacy/Sally/`** assume cloud-only
  endpoints. This contradicts `VISION.md` §1 Principle 1 (local-first)
  and exposes private memory traffic to the public internet.

Neither extreme works. A user with a self-hosted brain at home wants
LAN speed when on home Wi-Fi and seamless reachability when out — and
the brain must stay reachable without exposing it to the open internet.

## Decision

We will adopt a **dual-mode connectivity model** with three resolution
strategies tried in order, and configurable per-deployment:

1. **LAN direct.** Clients first try a parameterized endpoint
   `${SALLIE_LAN_HOST}:${SALLIE_LAN_PORT}`. Defaults: `sallie.local`
   (mDNS) on port `8742`. Hard-coded IPs are forbidden.
2. **Mesh tunnel (preferred fallback).** If the LAN endpoint is
   unreachable, clients fall back to the brain's stable mesh address
   (Tailscale by default; WireGuard supported). Mesh traffic is
   end-to-end encrypted by the mesh; no certificate management on the
   user side.
3. **Public tunnel (last-resort fallback).** If mesh is unavailable,
   clients fall back to a Cloudflare Tunnel (or equivalent) endpoint.
   This path requires the brain to enforce mTLS using the device's
   pairing certificate.

Operational rules:

- All endpoints are read from environment variables / signed config.
  **No IP literals in source.** A CI lint check rejects PRs that
  introduce IPv4 / IPv6 literals into application code (test fixtures
  excluded).
- The brain advertises itself on LAN via mDNS so first-run pairing on
  the same network is zero-config.
- Device pairing produces a per-device certificate (Phase 1, item 24
  of the build plan). All three transports verify the certificate; the
  public tunnel additionally requires it.
- Rate limits and audit logging (per ADR 0003) are applied at the
  brain regardless of which transport delivered the request.
- Clients show the active transport in the settings screen so the
  user can tell whether they are on LAN, mesh, or public tunnel.

## Alternatives considered

- **LAN only.** Rejected: breaks every off-network use case.
- **Public cloud only.** Rejected: violates local-first; also adds
  latency and egress cost; exposes private memory traffic.
- **Single tunnel (mesh only).** Rejected: requires every user to set
  up a mesh account before they can use Sallie, which is a hard
  onboarding regression.
- **Hard-coded LAN IP.** Rejected — current state. Doesn't survive a
  router reboot.

## Consequences

- **Positive:**
  - Works on home Wi-Fi, on the road, and in coffee shops.
  - Local-first by default: the LAN path is preferred and faster.
  - No source-level IPs means no per-deployment forks of the code.
- **Negative:**
  - Three transports = three failure modes to test. CI will need a
    matrix.
  - Mesh and public-tunnel setup is documentation work the user
    must do once. We will provide a setup wizard in the Phase 2C
    desktop app.
- **Follow-ups:**
  - Strip the `192.168.1.47:8742` literals from the host repo and any
    files promoted out of `legacy/`. Files currently containing the
    literal are listed in the build plan and will be migrated at
    promotion time.
  - Add the no-IP-literal lint rule (Phase 0.7 CI).
  - Implement the mDNS advertiser in `services/brain/` (Phase 1).
  - Implement device pairing + per-device certs (Phase 1, item 24).
  - Document the three-transport setup in `docs/CONFIGURATION.md`
    (Phase 0.6).

## References

- `VISION.md` §1 Principle 1.
- Existing hard-coded references (to be removed during promotion):
  `legacy/Sallie/web/next.config.js`,
  `legacy/Sallie/backend/services/agency-service/src/index.ts`,
  `legacy/Sallie/shared/services/*.ts`,
  `legacy/Sallie/web/components/*.tsx`.
- Build plan items 24, 33–36, 80.
