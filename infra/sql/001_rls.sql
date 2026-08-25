-- ============================================================
-- Vita — Row-Level Security Migration (001_rls.sql)
-- Apply with: psql -U vita -d vita -f infra/sql/001_rls.sql
-- ============================================================

-- ── 1. users ─────────────────────────────────────────────────────────────────
-- Users can only read/modify their own row.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_self ON users;
CREATE POLICY users_self ON users
    USING (id = current_setting('app.current_user_id', true))
    WITH CHECK (id = current_setting('app.current_user_id', true));

-- ── 2. focus_tasks ───────────────────────────────────────────────────────────
ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_tasks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_tasks_owner ON focus_tasks;
CREATE POLICY focus_tasks_owner ON focus_tasks
    USING (user_id = current_setting('app.current_user_id', true))
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- ── 3. focus_sessions ────────────────────────────────────────────────────────
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_sessions_owner ON focus_sessions;
CREATE POLICY focus_sessions_owner ON focus_sessions
    USING (user_id = current_setting('app.current_user_id', true))
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- ── 4. classified_apps ───────────────────────────────────────────────────────
-- Shared cache — any authenticated user can read; only app role can write.
ALTER TABLE classified_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE classified_apps FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classified_apps_read ON classified_apps;
CREATE POLICY classified_apps_read ON classified_apps
    FOR SELECT
    USING (true);  -- all authenticated users can read the cache

DROP POLICY IF EXISTS classified_apps_write ON classified_apps;
CREATE POLICY classified_apps_write ON classified_apps
    FOR ALL
    USING (true)
    WITH CHECK (true);  -- app role (vita) handles all writes

-- ── 5. Verify ────────────────────────────────────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
