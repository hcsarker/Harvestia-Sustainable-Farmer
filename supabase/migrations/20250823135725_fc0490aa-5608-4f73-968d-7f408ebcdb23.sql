-- Fix profiles table RLS policies to ensure email privacy
-- Drop existing policies and recreate with more explicit security

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create more restrictive policies that explicitly protect user data
CREATE POLICY "Users can only view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can only update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Ensure user_id column is NOT NULL to prevent security bypass
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add index for better performance on security checks
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);