-- CRITICAL SECURITY FIX: Block direct access to quiz questions to prevent answer theft
-- Only allow access through secure functions that filter out correct answers

-- Remove all existing policies that allow direct access
DROP POLICY IF EXISTS "Authenticated users can read quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Block quiz question modifications" ON quiz_questions;

-- Create a restrictive policy that blocks ALL direct access to quiz_questions
-- This forces all access to go through the secure SECURITY DEFINER functions
-- which properly filter out correct answers
CREATE POLICY "Block all direct access to quiz questions" 
ON quiz_questions 
FOR ALL 
TO authenticated
USING (false)
WITH CHECK (false);

-- Note: The secure functions (get_quiz_questions_secure, submit_quiz_results, validate_quiz_answer) 
-- can still access the table because they use SECURITY DEFINER privilege escalation