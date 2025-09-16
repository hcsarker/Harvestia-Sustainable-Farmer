-- Fix critical security issue: Allow secure functions to access quiz_questions
-- while still blocking direct user access

-- Remove the overly restrictive policy that blocks everything
DROP POLICY IF EXISTS "Block all direct access to quiz questions" ON quiz_questions;

-- Create a simple policy that blocks all direct access but allows system functions
-- The SECURITY DEFINER functions will bypass RLS and access the table directly
CREATE POLICY "Block direct user access to quiz questions" 
ON quiz_questions 
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Note: The secure functions (get_quiz_questions_secure, submit_quiz_results, validate_quiz_answer) 
-- use SECURITY DEFINER which bypasses RLS, so they can still access the table safely