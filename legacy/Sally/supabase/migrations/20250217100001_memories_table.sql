-- Memory table for MemoryServiceImpl persistence
-- Matches Prisma Memory model; used when Supabase Edge function is not configured.

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  content TEXT NOT NULL,
  embedding JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  access_count INT DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  salience DECIMAL(3, 2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memories_actor_id ON memories(actor_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

COMMENT ON TABLE memories IS 'Sallie memory store; used by MemoryServiceImpl when /api/memory fallback is active';
