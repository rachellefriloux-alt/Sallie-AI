-- Add avatar_state to profiles for persisting avatar manifestations
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_state JSONB DEFAULT NULL;
