-- Add attempts_allowed to quizzes; default 5 (allow 5 attempts per quiz)
-- Add column (first run). If re-running and column exists, this will fail; apply once.
ALTER TABLE public.quizzes ADD COLUMN attempts_allowed integer;

-- Ensure default and not null
ALTER TABLE public.quizzes ALTER COLUMN attempts_allowed SET DEFAULT 5;
UPDATE public.quizzes SET attempts_allowed = 5 WHERE attempts_allowed IS NULL;
ALTER TABLE public.quizzes ALTER COLUMN attempts_allowed SET NOT NULL;

-- Helpful check constraint
ALTER TABLE public.quizzes ADD CONSTRAINT chk_quizzes_attempts_allowed_nonneg CHECK (attempts_allowed >= 1);

-- Optional: Index if filtering by attempts_allowed becomes common (not necessary by default)
-- create index if not exists idx_quizzes_attempts_allowed on public.quizzes(attempts_allowed);
