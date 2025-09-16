-- Postgres/Supabase RLS and policies hardening
-- Ensure required extensions separately (Supabase: Database > Extensions)

-- nasa_data_cache
-- alter table public.nasa_data_cache enable row level security;
-- drop policy if exists "Allow read nasa cache" on public.nasa_data_cache;
-- create policy "Allow read nasa cache" on public.nasa_data_cache for select using (true);
-- drop policy if exists "Service upsert nasa cache" on public.nasa_data_cache;
-- create policy "Service upsert nasa cache" on public.nasa_data_cache for insert to service_role with check (true);
-- drop policy if exists "Service update nasa cache" on public.nasa_data_cache;
-- create policy "Service update nasa cache" on public.nasa_data_cache for update to service_role using (true) with check (true);
-- drop policy if exists "Service delete nasa cache" on public.nasa_data_cache;
-- create policy "Service delete nasa cache" on public.nasa_data_cache for delete to service_role using (true);
create index if not exists idx_nasa_data_cache_expires on
   public.nasa_data_cache (
      expires_at
   );

-- story_progress
-- alter table public.story_progress enable row level security;
-- drop policy if exists "Own story progress" on public.story_progress;
-- create policy "Own story progress" on public.story_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- quiz_attempts
-- alter table public.quiz_attempts enable row level security;
-- drop policy if exists "Own quiz attempts" on public.quiz_attempts;
-- create policy "Own quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- simulation_runs
-- alter table public.simulation_runs enable row level security;
-- drop policy if exists "Own simulation runs" on public.simulation_runs;
-- create policy "Own simulation runs" on public.simulation_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- simulation_weeks
-- alter table public.simulation_weeks enable row level security;
-- drop policy if exists "Own simulation weeks" on public.simulation_weeks;
-- create policy "Own simulation weeks" on public.simulation_weeks for all using (
--   auth.uid() = (select user_id from public.simulation_runs r where r.id = run_id)
-- ) with check (
--   auth.uid() = (select user_id from public.simulation_runs r where r.id = run_id)
-- );

-- achievements
-- alter table public.achievements enable row level security;
-- drop policy if exists "Public read achievements" on public.achievements;
-- create policy "Public read achievements" on public.achievements for select using (true);
-- drop policy if exists "Service write achievements" on public.achievements;
-- create policy "Service write achievements" on public.achievements for all to service_role using (true) with check (true);

-- user_achievements
-- alter table public.user_achievements enable row level security;
-- drop policy if exists "Own user achievements" on public.user_achievements;
-- create policy "Own user achievements" on public.user_achievements for select using (auth.uid() = user_id);
-- drop policy if exists "Insert own user achievements" on public.user_achievements;
-- create policy "Insert own user achievements" on public.user_achievements for insert with check (auth.uid() = user_id);
-- drop policy if exists "Service insert user achievements" on public.user_achievements;
-- create policy "Service insert user achievements" on public.user_achievements for insert to service_role with check (true);

-- certificates
-- alter table public.certificates enable row level security;
-- drop policy if exists "Public read certificates" on public.certificates;
-- create policy "Public read certificates" on public.certificates for select using (true);
-- drop policy if exists "Service write certificates" on public.certificates;
-- create policy "Service write certificates" on public.certificates for all to service_role using (true) with check (true);

-- user_certificates
-- alter table public.user_certificates enable row level security;
-- drop policy if exists "Own certificates" on public.user_certificates;
-- create policy "Own certificates" on public.user_certificates for select using (auth.uid() = user_id);
-- drop policy if exists "Insert own certificates" on public.user_certificates;
-- create policy "Insert own certificates" on public.user_certificates for insert with check (auth.uid() = user_id);
-- drop policy if exists "Service insert certificates" on public.user_certificates;
-- create policy "Service insert certificates" on public.user_certificates for insert to service_role with check (true);

-- rate_limits
-- alter table public.rate_limits enable row level security;
-- drop policy if exists "Allow own rate limit view" on public.rate_limits;
-- create policy "Allow own rate limit view" on public.rate_limits for select using (auth.uid() = user_id);
-- drop policy if exists "Service insert rate" on public.rate_limits;
-- create policy "Service insert rate" on public.rate_limits for insert to service_role with check (true);
-- drop policy if exists "Service update rate" on public.rate_limits;
-- create policy "Service update rate" on public.rate_limits for update to service_role using (true) with check (true);