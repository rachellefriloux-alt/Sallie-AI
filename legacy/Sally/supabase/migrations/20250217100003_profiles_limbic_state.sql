-- Add limbic_state JSONB to profiles for limbic-state Edge Function.
-- Stores full limbic state snapshot; individual columns (limbic_trust, etc.) remain for compatibility.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS limbic_state JSONB DEFAULT NULL;
