-- Keep quizzes.questions_count in sync with quiz_questions, add helpful indexes,
-- and ensure secure question RPC exists with search_path.

-- Function to refresh question count for a quiz
CREATE OR REPLACE FUNCTION public.refresh_quiz_questions_count(p_quiz_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quizzes q
  SET questions_count = COALESCE((
    SELECT COUNT(*) FROM public.quiz_questions qq WHERE qq.quiz_id = p_quiz_id
  ), 0)
  WHERE q.id = p_quiz_id;
END;
$$;

-- Trigger function to call refresh on insert/update/delete
CREATE OR REPLACE FUNCTION public.tr_quiz_questions_count_aiud()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.refresh_quiz_questions_count(NEW.quiz_id);
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.refresh_quiz_questions_count(OLD.quiz_id);
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.quiz_id <> OLD.quiz_id) THEN
      PERFORM public.refresh_quiz_questions_count(OLD.quiz_id);
      PERFORM public.refresh_quiz_questions_count(NEW.quiz_id);
    ELSE
      PERFORM public.refresh_quiz_questions_count(NEW.quiz_id);
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_questions_count_aiud ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_count_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.tr_quiz_questions_count_aiud();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user ON public.user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_quiz ON public.user_quiz_results(quiz_id);

-- Ensure secure question RPC exists with correct search_path (no answers exposed)
CREATE OR REPLACE FUNCTION public.get_quiz_questions_secure(quiz_id_param uuid)
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
  FROM public.quiz_questions q
  WHERE q.quiz_id = quiz_id_param;
END;
$$;
