-- Remove email field from profiles table to eliminate security risk
-- Email is already available through auth.users, no need to duplicate it

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;