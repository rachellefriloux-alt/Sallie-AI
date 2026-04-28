-- Sallie Brain — Initial Database Schema (v1)
--
-- Phase 1, plan item 25.
--
-- Curated and ported from
--   legacy/Sallie/backend/database/migrations/001_initial_schema.sql (535 lines)
-- which was a kitchen-sink schema for an entire microservices fleet
-- (chat rooms, ai sessions, file uploads, etc.). The brain only needs
-- the identity + auth tables here; per-feature tables (memory, knowledge,
-- agency, etc.) land in their own later migrations to keep concerns
-- separated and migrations small.
--
-- Tables in this migration:
--   users           — owner accounts (Sallie is owner-only, so typically 1 row)
--   devices         — paired devices per ADR 0004 (each gets its own cert)
--   user_sessions   — short-lived JWT-backed sessions (token jti tracked)
--   refresh_tokens  — long-lived rotating refresh tokens
--   audit_log       — append-only signed audit log per ADR 0003
--
-- All ids are UUIDs to make cross-device sync collision-free.
-- All timestamps are TIMESTAMPTZ so we never lose timezone information.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------
-- Ported from legacy users table. Removed columns the brain doesn't use
-- (username, avatar_url, phone) — those belong to the profile/preferences
-- service if it ever lands. Kept email + names + verified + last_login.
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ----------------------------------------------------------------------
-- devices
-- ----------------------------------------------------------------------
-- New (not in legacy migration). Required by ADR 0004 (Connectivity
-- model — per-device certs) and ADR 0002 (Identity model — multiple
-- devices share one canonical DNA blob, each with its own paired key).
CREATE TABLE IF NOT EXISTS devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    -- 'mobile' | 'web' | 'desktop' | 'launcher' | 'companion'
    device_kind     VARCHAR(32)  NOT NULL,
    -- SHA-256 fingerprint of the device's pinned certificate (hex).
    cert_fingerprint CHAR(64) UNIQUE NOT NULL,
    -- mDNS host advertised by this device when it acts as the brain host.
    -- NULL for pure clients. Per ADR 0004 we store the hostname, never
    -- a literal IP, and an enforcement lint backstops this.
    mdns_hostname   VARCHAR(255),
    -- Last channel the device used: 'lan' | 'mesh' | 'tunnel'. Used by
    -- the connectivity preferer to skip slow channels next time.
    last_channel    VARCHAR(16),
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON devices (user_id);

-- Enforce ADR 0004: cert_fingerprint must be 64 lowercase hex chars.
-- (CHAR(64) already enforces length; check enforces alphabet.)
ALTER TABLE devices
    ADD CONSTRAINT devices_cert_fingerprint_hex
    CHECK (cert_fingerprint ~ '^[0-9a-f]{64}$');

ALTER TABLE devices
    ADD CONSTRAINT devices_kind_enum
    CHECK (device_kind IN ('mobile', 'web', 'desktop', 'launcher', 'companion'));

ALTER TABLE devices
    ADD CONSTRAINT devices_last_channel_enum
    CHECK (last_channel IS NULL OR last_channel IN ('lan', 'mesh', 'tunnel'));

-- ----------------------------------------------------------------------
-- user_sessions
-- ----------------------------------------------------------------------
-- Ported from the legacy user_sessions table; renamed `session_token` to
-- `jti` because we store the JWT id (the token itself stays in the
-- client) and `refresh_token` is split into its own table for rotation.
-- ip_address kept as INET for indexability.
CREATE TABLE IF NOT EXISTS user_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id       UUID REFERENCES devices(id) ON DELETE SET NULL,
    -- Opaque JWT `jti` claim. Lookup is by this column to allow revocation.
    jti             VARCHAR(64) UNIQUE NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON user_sessions (jti);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions (expires_at);

-- ----------------------------------------------------------------------
-- refresh_tokens
-- ----------------------------------------------------------------------
-- New (split out from legacy user_sessions.refresh_token). One refresh
-- token per session, rotated on each use; previous_id chains rotations
-- so a replayed-old-token attempt can revoke the entire chain.
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    -- We store only the SHA-256 of the token, never the token itself.
    token_hash      CHAR(64) UNIQUE NOT NULL,
    previous_id     UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_session ON refresh_tokens (session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens (token_hash);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT refresh_token_hash_hex
    CHECK (token_hash ~ '^[0-9a-f]{64}$');

-- ----------------------------------------------------------------------
-- audit_log
-- ----------------------------------------------------------------------
-- New. Required by ADR 0003 (Trust & safety doctrine). Every privileged
-- or trust-tier-affecting action lands here. Append-only at the
-- application layer; PG-level immutability is enforced by a trigger
-- below. The signature column carries a per-row HMAC computed by the
-- brain so the log is tamper-evident even if the DB is breached.
CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    device_id       UUID REFERENCES devices(id) ON DELETE SET NULL,
    -- e.g. 'auth.login', 'auth.refresh', 'trust.tier_change',
    -- 'memory.delete', 'convergence.complete', 'sandbox.escape_attempt'.
    action          VARCHAR(64) NOT NULL,
    -- 'success' | 'failure' | 'denied'
    outcome         VARCHAR(16) NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Hex-encoded HMAC-SHA256 of (id || user_id || action || outcome ||
    -- metadata || created_at), keyed by the brain's audit-signing key.
    signature       CHAR(64) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log (created_at);

ALTER TABLE audit_log
    ADD CONSTRAINT audit_outcome_enum
    CHECK (outcome IN ('success', 'failure', 'denied'));

ALTER TABLE audit_log
    ADD CONSTRAINT audit_signature_hex
    CHECK (signature ~ '^[0-9a-f]{64}$');

-- Block UPDATE and DELETE on audit_log: it is append-only.
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only (% blocked)', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_update ON audit_log;
CREATE TRIGGER audit_log_no_update
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

-- ----------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS devices_set_updated_at ON devices;
CREATE TRIGGER devices_set_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
