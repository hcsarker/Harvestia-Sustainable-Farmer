# Quiz DB Setup and Flow

This app ships with a fully secure, one-attempt quiz system backed by Supabase. Use this guide to verify your database, seed sample data, and understand the end-to-end flow.

## 1) Tables and RPCs

Tables (already in migrations):

- public.quizzes: Quiz headers (title, difficulty, questions_count, nasa_topic)
- public.quiz_questions: Per-quiz questions with options and correct_answer
- public.user_quiz_results: Stores a user’s final score and answers

Server functions (RPCs):

- get_quiz_questions_secure(quiz_id uuid): returns questions WITHOUT `correct_answer`
- submit_quiz_results(quiz_id uuid, answers jsonb): scores answers on the server and inserts a row in `user_quiz_results`
- validate_quiz_answer(question_id uuid, submitted_answer text): returns boolean; not used by default UI (optional immediate feedback)

These are defined in the migrations under `supabase/migrations/` and consumed by the edge function `supabase/functions/quiz-handler`.

## 2) RLS and Policies

- quizzes: public read (or authenticated read depending on your policy choice)
- quiz_questions: direct access restricted; use `get_quiz_questions_secure` to fetch questions
- user_quiz_results: users can read/insert their own rows only

Double-check RLS is enabled per migration notes if you customized your DB.

## 3) One Attempt Rule

Enforced in edge function `quiz-handler` on `submitQuiz`:

- If a row already exists in `user_quiz_results` for (auth.uid, quiz_id), submission is blocked.

Optional (recommended) DB hardening:

- Add a unique constraint in SQL: `ALTER TABLE public.user_quiz_results ADD CONSTRAINT uq_user_quiz UNIQUE (user_id, quiz_id);`

## 4) Seeding Sample Data

Use the provided seed script to populate example quizzes and questions:

- File: `supabase/seeds/seed_quizzes.sql`

Run it in Supabase SQL Editor or psql. Notes:

- Requires `pgcrypto` (for `gen_random_uuid()`). In Supabase, this is enabled by default. Otherwise, install extensions as needed.

## 5) App Flow

- Quizzes page (`/quizzes`):
  - Lists quizzes from DB and shows per-user status (Start Quiz or View Result)
  - Requires auth to start (guest mode or unauthenticated users are redirected to `/auth`)
- Exam page (`/quizzes/:quizId`):
  - Loads questions via `quiz-handler` → `get_quiz_questions_secure`
  - MCQ UI with progress bar and an optional timer (60s/question)
  - Submit → `quiz-handler` → `submit_quiz_results` (server-side scoring + insert)
  - One attempt enforced by the edge function
  - If already attempted, the exam page shows your saved result immediately

## 6) Troubleshooting

- Infinite spinner when starting quiz

  - Ensure you’re signed in (not guest mode)
  - Confirm Supabase env vars in `.env`:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
  - Confirm the edge function `quiz-handler` is deployed and reachable

- No quizzes shown

  - Run the seed script or create quizzes manually in the DB

- Multiple results per quiz
  - One attempt is enforced in the edge function; consider adding a DB unique constraint for extra safety (see #3)

## 7) Minimal verification

1. Seed quizzes (`supabase/seeds/seed_quizzes.sql`)
2. Sign up or sign in
3. Navigate to `/quizzes` → Start Quiz
4. Submit answers → see results; revisit to view saved result

That’s it—your quiz section should be fully workable and secure.
