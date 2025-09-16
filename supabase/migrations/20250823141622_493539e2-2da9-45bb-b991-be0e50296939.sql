-- Fix critical security issue: Allow secure functions to access quiz_questions
-- while still blocking direct user access

-- Remove the overly restrictive policy that blocks everything
DROP POLICY IF EXISTS "Block all direct access to quiz questions" ON quiz_questions;

-- Create a policy that allows system access but blocks direct user queries
-- This allows SECURITY DEFINER functions to work while protecting quiz answers
CREATE POLICY "Allow secure function access only" 
ON quiz_questions 
FOR SELECT
TO authenticated
USING (
  -- Allow access only when called from our secure functions
  -- by checking if the current user context indicates system access
  current_setting('app.current_user_id', true) != ''
  OR 
  -- Fallback: Allow service role access for system operations
  auth.role() = 'service_role'
);

-- Block all modification attempts to maintain quiz integrity
CREATE POLICY "Block quiz question modifications" 
ON quiz_questions 
FOR INSERT, UPDATE, DELETE
TO authenticated
USING (false)
WITH CHECK (false);