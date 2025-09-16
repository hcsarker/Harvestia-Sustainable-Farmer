-- Create a function to get quiz questions without answers
CREATE OR REPLACE FUNCTION get_quiz_questions_secure(quiz_id_param uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  options jsonb,
  explanation text,
  nasa_data_reference jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.quiz_id,
    q.question,
    q.options,
    q.explanation,
    q.nasa_data_reference
  FROM quiz_questions q
  WHERE q.quiz_id = quiz_id_param;
END;
$$;

-- Update RLS policy to completely block direct access to quiz_questions
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Users can view quiz questions without answers" ON public.quiz_questions;
DROP POLICY IF EXISTS "Only system can access quiz questions with answers" ON public.quiz_questions;

-- Create a restrictive policy that blocks all direct access
CREATE POLICY "Block direct access to quiz questions"
ON public.quiz_questions
FOR ALL
USING (false);