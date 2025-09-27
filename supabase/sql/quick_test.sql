-- Quick Setup - If main script fails, run these commands one by one

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    nasa_topic TEXT,
    questions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Disable RLS
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;

-- 3. Insert one test quiz
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) 
VALUES ('test-quiz', 'Test Quiz', 'Easy', 'General', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Check if it worked
SELECT * FROM public.quizzes;