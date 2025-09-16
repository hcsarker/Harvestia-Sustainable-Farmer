-- Enable RLS and (idempotent) policies for newly added backend tables
-- Date: 2025-09-17

-- 1) nasa_data_cache: public readable (safe cache), service role can write
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.nasa_data_cache ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist yet in this environment; ignore
    NULL;
  END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nasa_data_cache' AND policyname = 'Allow read nasa cache'
  ) THEN
    CREATE POLICY "Allow read nasa cache" ON public.nasa_data_cache FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nasa_data_cache' AND policyname = 'Service upsert nasa cache'
  ) THEN
    CREATE POLICY "Service upsert nasa cache" ON public.nasa_data_cache FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nasa_data_cache' AND policyname = 'Service update nasa cache'
  ) THEN
    CREATE POLICY "Service update nasa cache" ON public.nasa_data_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'nasa_data_cache' AND policyname = 'Service delete nasa cache'
  ) THEN
    CREATE POLICY "Service delete nasa cache" ON public.nasa_data_cache FOR DELETE TO service_role USING (true);
  END IF;
END $$;

-- 2) story_progress: user owns rows
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'story_progress' AND policyname = 'Own story progress'
  ) THEN
    CREATE POLICY "Own story progress" ON public.story_progress FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3) quiz_attempts: user owns rows
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quiz_attempts' AND policyname = 'Own quiz attempts'
  ) THEN
    CREATE POLICY "Own quiz attempts" ON public.quiz_attempts FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4) simulation tables: user owns via run linkage
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'simulation_runs' AND policyname = 'Own simulation runs'
  ) THEN
    CREATE POLICY "Own simulation runs" ON public.simulation_runs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.simulation_weeks ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'simulation_weeks' AND policyname = 'Own simulation weeks'
  ) THEN
    CREATE POLICY "Own simulation weeks" ON public.simulation_weeks FOR ALL
      USING (auth.uid() = (SELECT user_id FROM public.simulation_runs r WHERE r.id = run_id))
      WITH CHECK (auth.uid() = (SELECT user_id FROM public.simulation_runs r WHERE r.id = run_id));
  END IF;
END $$;

-- 5) achievements
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Own user achievements'
  ) THEN
    CREATE POLICY "Own user achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_achievements' AND policyname = 'Insert own user achievements'
  ) THEN
    CREATE POLICY "Insert own user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6) certificates
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certificates' AND policyname = 'Own certificates'
  ) THEN
    CREATE POLICY "Own certificates" ON public.user_certificates FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_certificates' AND policyname = 'Insert own certificates'
  ) THEN
    CREATE POLICY "Insert own certificates" ON public.user_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 7) rate_limits: only service role can mutate; users can view own rate
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rate_limits' AND policyname = 'Service insert rate'
  ) THEN
    CREATE POLICY "Service insert rate" ON public.rate_limits FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rate_limits' AND policyname = 'Service update rate'
  ) THEN
    CREATE POLICY "Service update rate" ON public.rate_limits FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'rate_limits' AND policyname = 'Allow own rate limit view'
  ) THEN
    CREATE POLICY "Allow own rate limit view" ON public.rate_limits FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8) quiz_questions read policy (answers excluded via RPC)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quiz_questions' AND policyname = 'Read quiz questions'
  ) THEN
    CREATE POLICY "Read quiz questions" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- table may be created in earlier migrations; ignore if absent here
  NULL;
END $$;
