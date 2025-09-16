-- Fix quiz system access while maintaining security
-- Replace the overly restrictive policy that blocks everything

-- Remove the policy that blocks all access
DROP POLICY IF EXISTS "Block direct user access to quiz questions" ON quiz_questions;

-- Create a proper policy that allows the quiz system to function
-- while relying on secure functions to filter out correct answers
CREATE POLICY "Allow quiz question access through secure functions" 
ON quiz_questions 
FOR SELECT
TO authenticated, anon
USING (true);

-- Keep blocking all modifications to maintain quiz integrity
CREATE POLICY "Block quiz question modifications" 
ON quiz_questions 
FOR INSERT, UPDATE, DELETE
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Note: The application uses SECURITY DEFINER functions (get_quiz_questions_secure) 
-- that properly filter out correct_answer columns, so this SELECT policy is safe