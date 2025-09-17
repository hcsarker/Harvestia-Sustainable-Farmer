-- Enforce single attempt per user per quiz at the DB level (use a unique index)
create unique index if not exists uq_user_quiz_attempt_idx on
   public.user_quiz_results (
      user_id,
      quiz_id
   );