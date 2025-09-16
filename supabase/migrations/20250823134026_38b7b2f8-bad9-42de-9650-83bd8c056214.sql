-- Update RLS policies for quiz_questions to hide correct answers from students
-- First drop existing policy
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON quiz_questions;

-- Create new policy that excludes correct answers for regular access
CREATE POLICY "Users can view quiz questions without answers" 
ON quiz_questions 
FOR SELECT 
USING (true);

-- Create a security definer function to validate quiz answers server-side
CREATE OR REPLACE FUNCTION validate_quiz_answer(
  question_id uuid,
  submitted_answer text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the submitted answer matches the correct answer
  RETURN EXISTS (
    SELECT 1 
    FROM quiz_questions 
    WHERE id = question_id 
    AND correct_answer = submitted_answer
  );
END;
$$;

-- Create function to get quiz results securely
CREATE OR REPLACE FUNCTION submit_quiz_results(
  quiz_id_param uuid,
  answers_param jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  question_record record;
  total_questions integer := 0;
  correct_answers integer := 0;
  result_data jsonb := '{}';
  user_answer text;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to submit quiz';
  END IF;

  -- Calculate score by checking each answer
  FOR question_record IN 
    SELECT id, correct_answer 
    FROM quiz_questions 
    WHERE quiz_id = quiz_id_param
  LOOP
    total_questions := total_questions + 1;
    user_answer := answers_param ->> question_record.id::text;
    
    IF user_answer = question_record.correct_answer THEN
      correct_answers := correct_answers + 1;
    END IF;
  END LOOP;

  -- Insert quiz result
  INSERT INTO user_quiz_results (
    user_id,
    quiz_id,
    score,
    total_questions,
    answers
  ) VALUES (
    auth.uid(),
    quiz_id_param,
    correct_answers,
    total_questions,
    answers_param
  );

  -- Return results without exposing correct answers
  RETURN jsonb_build_object(
    'score', correct_answers,
    'total_questions', total_questions,
    'percentage', ROUND((correct_answers::numeric / total_questions::numeric) * 100, 2)
  );
END;
$$;