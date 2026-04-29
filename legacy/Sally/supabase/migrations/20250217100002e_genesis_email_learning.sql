-- genesis_hypotheses, genesis_vetoes, email_drafts, learning_skills, learning_projects, extensions, convergence_sessions
CREATE TABLE IF NOT EXISTS genesis_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_genesis_hypotheses_user_id ON genesis_hypotheses(user_id);
ALTER TABLE genesis_hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users hypotheses" ON genesis_hypotheses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS genesis_vetoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  context TEXT,
  action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_genesis_vetoes_user_id ON genesis_vetoes(user_id);
ALTER TABLE genesis_vetoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users vetoes" ON genesis_vetoes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "to" TEXT,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_drafts_user_id ON email_drafts(user_id);
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users drafts" ON email_drafts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
