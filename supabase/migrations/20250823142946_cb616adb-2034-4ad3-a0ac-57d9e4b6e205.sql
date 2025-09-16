-- SECURITY FIX: Block direct access to quiz_questions to prevent answer theft
-- Force all access through secure SECURITY DEFINER functions only

-- Remove any existing policies
DROP POLICY IF EXISTS "Block all direct access to quiz questions table" ON quiz_questions;
DROP POLICY IF EXISTS "Block quiz question INSERT" ON quiz_questions;
DROP POLICY IF EXISTS "Block quiz question UPDATE" ON quiz_questions; 
DROP POLICY IF EXISTS "Block quiz question DELETE" ON quiz_questions;

-- Create comprehensive blocking policy for all operations
-- This ensures quiz answers cannot be stolen through direct database queries
CREATE POLICY "Block all direct access to prevent answer theft" 
ON quiz_questions 
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Note: Access is now only possible through SECURITY DEFINER functions:
-- - get_quiz_questions_secure: Returns questions without correct_answer column
-- - submit_quiz_results: Validates answers securely server-side
-- - validate_quiz_answer: Validates individual answers securely
-- These functions bypass RLS using elevated privileges while protecting quiz integrity