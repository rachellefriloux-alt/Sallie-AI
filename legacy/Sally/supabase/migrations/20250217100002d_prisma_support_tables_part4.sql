-- learning_skills
CREATE TABLE IF NOT EXISTS learning_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_skills_user_id ON learning_skills(user_id);
ALTER TABLE learning_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage skills" ON learning_skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- learning_projects
CREATE TABLE IF NOT EXISTS learning_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learning_projects_user_id ON learning_projects(user_id);
ALTER TABLE learning_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage projects" ON learning_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- extensions
CREATE TABLE IF NOT EXISTS extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  proposed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_extensions_user_id ON extensions(user_id);
ALTER TABLE extensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage extensions" ON extensions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- convergence_sessions
CREATE TABLE IF NOT EXISTS convergence_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_index INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_convergence_sessions_user_id ON convergence_sessions(user_id);
ALTER TABLE convergence_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage convergence" ON convergence_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
