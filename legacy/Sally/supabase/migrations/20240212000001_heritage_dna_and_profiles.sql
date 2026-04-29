-- Heritage DNA: stores Great Convergence questionnaire answers
-- One row per user, with JSONB for flexible question/answer storage
CREATE TABLE IF NOT EXISTS heritage_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}',
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Profiles: extends auth.users with Sallie-specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  convergence_completed BOOLEAN NOT NULL DEFAULT false,
  limbic_trust DECIMAL(3,2) DEFAULT 0.5 CHECK (limbic_trust >= 0 AND limbic_trust <= 1),
  limbic_warmth DECIMAL(3,2) DEFAULT 0.5 CHECK (limbic_warmth >= 0 AND limbic_warmth <= 1),
  limbic_arousal DECIMAL(3,2) DEFAULT 0.5 CHECK (limbic_arousal >= 0 AND limbic_arousal <= 1),
  limbic_valence DECIMAL(3,2) DEFAULT 0.5 CHECK (limbic_valence >= 0 AND limbic_valence <= 1),
  posture TEXT DEFAULT 'Friend' CHECK (posture IN ('Strategist', 'Lioness', 'Partner', 'Friend')),
  emotional_state TEXT,
  memory_vector_count INTEGER DEFAULT 0,
  memory_working_count INTEGER DEFAULT 0,
  dream_cycle_last_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Streak history for profile stats
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  streak_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS policies
ALTER TABLE heritage_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own heritage_dna" ON heritage_dna FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own heritage_dna" ON heritage_dna FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own heritage_dna" ON heritage_dna FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own streak_history" ON streak_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak_history" ON streak_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak_history" ON streak_history FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER heritage_dna_updated_at BEFORE UPDATE ON heritage_dna FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created ON auth.users
  AFTER INSERT FOR EACH ROW EXECUTE FUNCTION handle_new_user();
