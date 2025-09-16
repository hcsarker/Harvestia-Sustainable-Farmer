-- SECURITY FIX: Prevent quiz answer theft while maintaining functionality
-- Create a secure view for quiz questions without exposing correct answers

-- First, remove the overly permissive SELECT policy
DROP POLICY IF EXISTS "Allow quiz question SELECT access" ON quiz_questions;

-- Block all direct access to quiz_questions table to prevent answer theft
CREATE POLICY "Block all direct access to quiz questions table" 
ON quiz_questions 
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Create a secure view that exposes quiz questions without correct answers
CREATE OR REPLACE VIEW public.quiz_questions_public AS
SELECT 
    id,
    quiz_id,
    question,
    options,
    explanation,
    nasa_data_reference
FROM quiz_questions;

-- Enable RLS on the view
ALTER VIEW public.quiz_questions_public SET (security_invoker = true);

-- Allow public read access to the secure view (no correct answers exposed)
CREATE POLICY "Allow access to public quiz questions view"
ON public.quiz_questions_public
FOR SELECT
TO authenticated, anon
USING (true);

-- Note: SECURITY DEFINER functions can still access the full table for secure operations