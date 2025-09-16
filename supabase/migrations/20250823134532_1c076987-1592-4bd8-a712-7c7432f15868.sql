-- Create a secure view for quiz questions without answers
CREATE OR REPLACE VIEW public.quiz_questions_secure AS
SELECT 
  id,
  quiz_id,
  question,
  options,
  explanation,
  nasa_data_reference
FROM public.quiz_questions;

-- Enable RLS on the view
ALTER VIEW public.quiz_questions_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Anyone can view quiz questions without answers"
ON public.quiz_questions_secure
FOR SELECT
USING (true);

-- Update the original table policy to be more restrictive
DROP POLICY IF EXISTS "Users can view quiz questions without answers" ON public.quiz_questions;

-- Create a policy that only allows system/admin access to full table
CREATE POLICY "Only system can access quiz questions with answers"
ON public.quiz_questions
FOR SELECT
USING (false); -- This effectively blocks direct access

-- Grant usage on the view to authenticated and anon users  
GRANT SELECT ON public.quiz_questions_secure TO authenticated;
GRANT SELECT ON public.quiz_questions_secure TO anon;