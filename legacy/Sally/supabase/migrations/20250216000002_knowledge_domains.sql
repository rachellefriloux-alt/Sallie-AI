CREATE TABLE IF NOT EXISTS knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  description TEXT,
  expertise INTEGER DEFAULT 80,
  topics JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON knowledge_domains(tier_id);
