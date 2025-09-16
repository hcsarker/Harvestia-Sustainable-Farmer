-- Fix quiz questions RLS policy to allow secure access while protecting answers
-- Drop all existing policies first
DROP POLICY IF EXISTS "Block direct access to quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Allow authenticated access to quiz questions" ON quiz_questions;
DROP POLICY IF EXISTS "Allow security definer function access" ON quiz_questions;

-- Create a single comprehensive policy that allows authenticated users to read quiz questions
-- The secure functions (get_quiz_questions_secure) will handle filtering out correct answers
CREATE POLICY "Authenticated users can read quiz questions" 
ON quiz_questions 
FOR SELECT 
TO authenticated
USING (true);

-- Block all other operations (INSERT, UPDATE, DELETE) to maintain security
CREATE POLICY "Block quiz question modifications" 
ON quiz_questions 
FOR ALL 
TO authenticated
USING (false) 
WITH CHECK (false);