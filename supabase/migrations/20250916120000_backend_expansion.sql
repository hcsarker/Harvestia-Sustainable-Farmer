-- Backend Expansion Migration
-- Includes: core tables, RLS, indices, policies consolidation
-- Timestamp: 2025-09-16

-- Ensure required extensions (Supabase stores extensions under the 'extensions' schema)
ALTER TABLE public.nasa_data_cache ENABLE ROW LEVEL SECURITY;
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. NASA Data Cache (if not exists)
CREATE TABLE IF NOT EXISTS public.nasa_data_cache (

-- Allow service role to maintain cache entries explicitly (even though service role bypasses RLS)
DO $$ BEGIN
  CREATE POLICY "Service upsert nasa cache" ON public.nasa_data_cache FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service update nasa cache" ON public.nasa_data_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Service delete nasa cache" ON public.nasa_data_cache FOR DELETE TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes for fast cache lookups and expiry pruning
CREATE INDEX IF NOT EXISTS idx_nasa_cache_type_loc ON public.nasa_data_cache(data_type, location);
CREATE INDEX IF NOT EXISTS idx_nasa_cache_expires ON public.nasa_data_cache(expires_at);
  id bigserial PRIMARY KEY,
  data_type text NOT NULL,
  location text NOT NULL,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(data_type, location)
);
-- NOTE: Enable RLS on this table in your Supabase/Postgres environment:
-- ALTER TABLE public.nasa_data_cache ENABLE ROW LEVEL SECURITY;
-- Policies are PostgreSQL-specific; apply in Supabase SQL editor:
-- CREATE POLICY IF NOT EXISTS "Allow read nasa cache" ON public.nasa_data_cache FOR SELECT USING (true);
-- CREATE POLICY IF NOT EXISTS "Service upsert nasa cache" ON public.nasa_data_cache FOR INSERT TO service_role WITH CHECK (true);
-- CREATE POLICY IF NOT EXISTS "Service update nasa cache" ON public.nasa_data_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY IF NOT EXISTS "Service delete nasa cache" ON public.nasa_data_cache FOR DELETE TO service_role USING (true);
CREATE INDEX IF NOT EXISTS idx_nasa_data_cache_expires ON public.nasa_data_cache(expires_at);

-- 2. Story Progress
CREATE TABLE IF NOT EXISTS public.story_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'locked', -- locked | unlocked | completed
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);
-- NOTE: Enable RLS on this table in your Supabase/Postgres environment:
-- ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS "Own story progress" ON public.story_progress FOR ALL
--   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_story_progress_user ON public.story_progress(user_id);

-- 3. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL,
  score numeric,
  answers jsonb, -- submitted answers summary
  created_at timestamptz DEFAULT now()
);
-- NOTE: Enable RLS on this table in your Supabase/Postgres environment:
-- ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS "Own quiz attempts" ON public.quiz_attempts FOR ALL
--   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- 4. Simulation Runs & Weeks
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL,
  crop text NOT NULL,
  soil text NOT NULL,
  location jsonb,
  final_score int,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
-- NOTE: Enable RLS on this table in your Supabase/Postgres environment:
-- ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS "Own simulation runs" ON public.simulation_runs FOR ALL
--   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user ON public.simulation_runs(user_id);

CREATE TABLE IF NOT EXISTS public.simulation_weeks (
  id bigserial PRIMARY KEY,
  run_id uuid REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
  -- Backend Expansion Migration
  -- Includes: core tables, RLS, indices, policies consolidation
  -- Timestamp: 2025-09-16

  -- 1. NASA Data Cache (if not exists)
  CREATE TABLE IF NOT EXISTS public.nasa_data_cache (
    id bigserial PRIMARY KEY,
    data_type text NOT NULL,
    location text NOT NULL,
    data jsonb NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(data_type, location)
  );
  -- Enable RLS (Supabase enables by default for new tables in some contexts; uncomment if needed)
  -- ALTER TABLE public.nasa_data_cache ENABLE ROW LEVEL SECURITY;
  -- Cache is non-user specific: allow read to all, restrict writes to service role later
  DO $$ BEGIN
    CREATE POLICY "Allow read nasa cache" ON public.nasa_data_cache FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  -- 2. Story Progress
  CREATE TABLE IF NOT EXISTS public.story_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'locked', -- locked | unlocked | completed
    unlocked_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, chapter_id)
  );
  -- ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own story progress" ON public.story_progress FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_story_progress_user ON public.story_progress(user_id);

  -- 3. Quiz Attempts
  CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id uuid NOT NULL,
    score numeric,
    answers jsonb, -- submitted answers summary
    created_at timestamptz DEFAULT now()
  );
  -- ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own quiz attempts" ON public.quiz_attempts FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

  -- 4. Simulation Runs & Weeks
  CREATE TABLE IF NOT EXISTS public.simulation_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    mode text NOT NULL,
    crop text NOT NULL,
    soil text NOT NULL,
    location jsonb,
    final_score int,
    started_at timestamptz DEFAULT now(),
    ended_at timestamptz
  );
  -- ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own simulation runs" ON public.simulation_runs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_simulation_runs_user ON public.simulation_runs(user_id);

  CREATE TABLE IF NOT EXISTS public.simulation_weeks (
    id bigserial PRIMARY KEY,
    run_id uuid REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    week_number int NOT NULL,
    decisions jsonb NOT NULL,
    state jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(run_id, week_number)
  );
  -- ALTER TABLE public.simulation_weeks ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own simulation weeks" ON public.simulation_weeks FOR ALL
      USING (auth.uid() = (SELECT user_id FROM public.simulation_runs r WHERE r.id = run_id))
      WITH CHECK (auth.uid() = (SELECT user_id FROM public.simulation_runs r WHERE r.id = run_id));
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_simulation_weeks_run ON public.simulation_weeks(run_id);

  -- 5. Achievements
  CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    tier text,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.user_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at timestamptz DEFAULT now(),
    UNIQUE(user_id, achievement_id)
  );
  -- ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own user achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Insert own user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

  -- 6. Certificates
  CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid,
    title text NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.user_certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_id uuid REFERENCES public.certificates(id) ON DELETE CASCADE,
    issued_at timestamptz DEFAULT now(),
    verification_code text UNIQUE,
    UNIQUE(user_id, certificate_id)
  );
  -- ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Own certificates" ON public.user_certificates FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Insert own certificates" ON public.user_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_user_certificates_user ON public.user_certificates(user_id);

  -- 7. Rate Limits
  CREATE TABLE IF NOT EXISTS public.rate_limits (
    id bigserial PRIMARY KEY,
    user_id uuid,
    resource text NOT NULL,
    window_start timestamptz NOT NULL,
    count int NOT NULL DEFAULT 1,
    UNIQUE(user_id, resource, window_start)
  );
  -- ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
  DO $$ BEGIN
    CREATE POLICY "Allow rate limit inserts" ON public.rate_limits FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow own rate limit view" ON public.rate_limits FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS idx_rate_limits_resource_window ON public.rate_limits(resource, window_start);

  -- 8. Consolidate quiz_questions policies (drop conflicting)
  DO $$ BEGIN
    DROP POLICY IF EXISTS "Block direct access to quiz questions" ON public.quiz_questions;
    DROP POLICY IF EXISTS "Allow authenticated access to quiz questions" ON public.quiz_questions;
    DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON public.quiz_questions;
    DROP POLICY IF EXISTS "Block quiz question modifications" ON public.quiz_questions;
  EXCEPTION WHEN undefined_table THEN NULL; END $$;

  -- Final policy: read-only via authenticated; answers should be excluded at application / secure function level
  DO $$ BEGIN
    CREATE POLICY "Read quiz questions" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  -- 9. Helper function: issue_certificate (simplified)
  CREATE OR REPLACE FUNCTION public.issue_certificate(p_user uuid, p_certificate uuid, p_code text)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE new_id uuid;
  BEGIN
    INSERT INTO public.user_certificates(user_id, certificate_id, verification_code)
    VALUES (p_user, p_certificate, p_code)
    ON CONFLICT (user_id, certificate_id) DO UPDATE
      SET verification_code = EXCLUDED.verification_code
    RETURNING id INTO new_id;
    RETURN new_id;
  END; $$;

  -- 10. Helper function: record_achievement
  CREATE OR REPLACE FUNCTION public.record_achievement(p_user uuid, p_code text)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE ach_id uuid; out_id uuid;
  BEGIN
    SELECT id INTO ach_id FROM public.achievements WHERE code = p_code;
    IF ach_id IS NULL THEN
      RAISE EXCEPTION 'Achievement code % not found', p_code;
    END IF;
    INSERT INTO public.user_achievements(user_id, achievement_id)
    VALUES (p_user, ach_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING
    RETURNING id INTO out_id;
    RETURN out_id;
  END; $$;

  -- 11. Helper function: upsert_rate(resource, window_minutes, p_user uuid)
  CREATE OR REPLACE FUNCTION public.upsert_rate(resource text, window_minutes int, p_user uuid)
  RETURNS int
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE w_start timestamptz; current_count int; new_count int;
  BEGIN
    w_start := date_trunc('minute', now()) - make_interval(mins => EXTRACT(minute FROM now())::int % window_minutes);
    INSERT INTO public.rate_limits(user_id, resource, window_start, count)
    VALUES (p_user, resource, w_start, 1)
    ON CONFLICT (user_id, resource, window_start) DO UPDATE SET count = public.rate_limits.count + 1
    RETURNING count INTO new_count;
    RETURN new_count;
  END; $$;

  -- End of migration
