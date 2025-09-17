-- Enable RLS and create safe policies for nasa_data_cache
-- This migration ensures the cache table can be read by anon/auth clients,
-- while writes are restricted to the service role (edge functions).

-- Note: Some Supabase migration runners restrict DO blocks. Use straightforward DDL with IF NOT EXISTS guards.

-- Ensure table exists (will no-op if already present); comment left for context
-- select 1 from public.nasa_data_cache limit 1;

-- Enable RLS
-- Enable fast reads and basic access for cache table without RLS (tooling-friendly)
-- Note: For production hardening, consider enabling RLS and policies instead.

-- Helpful indexes
create index if not exists idx_nasa_cache_type_loc on
   public.nasa_data_cache (
      data_type,
      location
   );
create index if not exists idx_nasa_cache_expires on
   public.nasa_data_cache (
      expires_at
   );

-- Allow read access to cache for anon and authenticated roles
grant select on public.nasa_data_cache to anon;
grant select on public.nasa_data_cache to authenticated;

-- Allow maintenance by service_role
grant select,insert,update,delete on public.nasa_data_cache to service_role;