-- Postgres best practices (Supabase skill): RLS performance + indexes
-- 1) Use (select auth.uid()) so Postgres caches the result once per statement (security-rls-performance)
-- 2) Ensure indexes exist on FK/WHERE columns (query-missing-indexes, schema-foreign-key-indexes)

-- ========== RLS: Optimize auth.uid() (run once per statement, not per row) ==========

-- conversations
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
CREATE POLICY "Users can read own conversations" ON conversations FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- messages (EXISTS subquery: use (select auth.uid()) inside)
DROP POLICY IF EXISTS "Users can read messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can delete messages in own conversations" ON messages;
CREATE POLICY "Users can read messages in own conversations" ON messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY "Users can update messages in own conversations" ON messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = (SELECT auth.uid())));
CREATE POLICY "Users can delete messages in own conversations" ON messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.user_id = (SELECT auth.uid())));

-- heritage_dna
DROP POLICY IF EXISTS "Users can read own heritage_dna" ON heritage_dna;
DROP POLICY IF EXISTS "Users can insert own heritage_dna" ON heritage_dna;
DROP POLICY IF EXISTS "Users can update own heritage_dna" ON heritage_dna;
CREATE POLICY "Users can read own heritage_dna" ON heritage_dna FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own heritage_dna" ON heritage_dna FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own heritage_dna" ON heritage_dna FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- profiles (policy uses id, not user_id)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

-- streak_history
DROP POLICY IF EXISTS "Users can read own streak_history" ON streak_history;
DROP POLICY IF EXISTS "Users can insert own streak_history" ON streak_history;
DROP POLICY IF EXISTS "Users can update own streak_history" ON streak_history;
CREATE POLICY "Users can read own streak_history" ON streak_history FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own streak_history" ON streak_history FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own streak_history" ON streak_history FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- notification_preferences
DROP POLICY IF EXISTS "Users own notification_preferences" ON notification_preferences;
CREATE POLICY "Users own notification_preferences" ON notification_preferences FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- app_notifications
DROP POLICY IF EXISTS "Users own app_notifications" ON app_notifications;
CREATE POLICY "Users own app_notifications" ON app_notifications FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);

-- ========== Indexes: FK and common filters (if not already present) ==========
-- conversations: idx_conversations_user_id already in 20240212000002
-- messages: idx_messages_conversation_id already in 20240212000002
-- streak_history: UNIQUE(user_id, date) indexes user_id
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON streak_history(user_id, date DESC);
