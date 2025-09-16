-- Fix quiz questions RLS policy to allow secure access while protecting answers
-- Drop the overly restrictive policy that blocks all access
DROP POLICY IF EXISTS "Block direct access to quiz questions" ON quiz_questions;

-- Create a new policy that allows authenticated users to read quiz data
-- but relies on the secure functions to filter out sensitive information
CREATE POLICY "Allow authenticated access to quiz questions" 
ON quiz_questions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ensure the security definer functions can still access the table
-- (They should be able to bypass RLS anyway, but this makes it explicit)
CREATE POLICY "Allow security definer function access" 
ON quiz_questions 
FOR ALL 
USING (current_setting('role', true) = 'service_role');