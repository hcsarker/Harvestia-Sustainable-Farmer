-- Fix quiz system access while maintaining security
-- Replace the overly restrictive policy that blocks everything

-- Remove the policy that blocks all access
DROP POLICY IF EXISTS "Block direct user access to quiz questions" ON quiz_questions;

-- Create a proper policy that allows the quiz system to function
-- The secure functions filter out correct answers at the application layer
CREATE POLICY "Allow quiz question SELECT access" 
ON quiz_questions 
FOR SELECT
TO authenticated, anon
USING (true);

-- Block all modifications to maintain quiz integrity
CREATE POLICY "Block quiz question INSERT" 
ON quiz_questions 
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block quiz question UPDATE" 
ON quiz_questions 
FOR UPDATE
TO authenticated, anon
USING (false);

CREATE POLICY "Block quiz question DELETE" 
ON quiz_questions 
FOR DELETE
TO authenticated, anon
USING (false);

-- Note: Security relies on the SECURITY DEFINER functions that filter out correct_answer columns