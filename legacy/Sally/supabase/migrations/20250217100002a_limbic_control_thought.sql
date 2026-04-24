-- limbic_history, control_logs, thought_logs
CREATE TABLE IF NOT EXISTS limbic_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_limbic_history_user_id ON limbic_history(user_id);
CREATE INDEX IF NOT EXISTS idx_limbic_history_created_at ON limbic_history(created_at DESC);
ALTER TABLE limbic_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users limbic history" ON limbic_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS control_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_control_logs_user_id ON control_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_control_logs_created_at ON control_logs(created_at DESC);
ALTER TABLE control_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control logs" ON control_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS thought_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_thought_logs_user_id ON thought_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_thought_logs_created_at ON thought_logs(created_at DESC);
ALTER TABLE thought_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users thought logs" ON thought_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
