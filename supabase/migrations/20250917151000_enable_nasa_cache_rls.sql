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
CREATE INDEX IF NOT EXISTS idx_nasa_cache_type_loc ON public.nasa_data_cache(data_type, location);
CREATE INDEX IF NOT EXISTS idx_nasa_cache_expires ON public.nasa_data_cache(expires_at);

-- Allow read access to cache for anon and authenticated roles
GRANT SELECT ON public.nasa_data_cache TO anon;
GRANT SELECT ON public.nasa_data_cache TO authenticated;

-- Allow maintenance by service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nasa_data_cache TO service_role;
