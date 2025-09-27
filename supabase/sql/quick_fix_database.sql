-- STEP BY STEP DATABASE FIX
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/bnyagvqylorlastljrey/sql

-- ================================
-- STEP 1: CREATE COURSE_LESSONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    video_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published lessons" 
    ON public.course_lessons FOR SELECT 
    USING (is_published = true);

-- ================================  
-- STEP 2: ADD SAMPLE LESSONS
-- ================================
INSERT INTO public.course_lessons (course_id, title, content, order_index, duration_minutes)
SELECT 
    c.id,
    'Introduction to ' || c.title,
    'This is the first lesson covering basic concepts of ' || c.title || '. You will learn the fundamentals and get started with practical knowledge.',
    1,
    15
FROM public.courses c
LIMIT 5;

INSERT INTO public.course_lessons (course_id, title, content, order_index, duration_minutes)
SELECT 
    c.id,
    'Advanced Techniques in ' || c.title,
    'Advanced lesson covering professional techniques and best practices in ' || c.title || '. Suitable for intermediate to advanced learners.',
    2,
    25  
FROM public.courses c
LIMIT 5;

-- ================================
-- STEP 3: ADD QUIZ QUESTIONS  
-- ================================
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
SELECT 
    q.id,
    'What is the main benefit of sustainable farming?',
    '["Higher costs", "Better for environment", "More work", "Less profit"]',
    'Better for environment',
    'Sustainable farming practices help protect the environment while maintaining productivity.'
FROM public.quizzes q
LIMIT 1;

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
SELECT 
    q.id,
    'Which practice helps improve soil health?',
    '["Heavy machinery use", "Crop rotation", "Chemical overuse", "Monoculture"]',
    'Crop rotation',
    'Crop rotation helps maintain soil nutrients and prevents pest buildup.'
FROM public.quizzes q
LIMIT 1;

-- ================================
-- STEP 4: UPDATE QUESTION COUNTS
-- ================================
UPDATE public.quizzes 
SET questions_count = (
    SELECT COUNT(*) 
    FROM public.quiz_questions 
    WHERE quiz_id = quizzes.id
);

-- ================================
-- VERIFICATION
-- ================================
SELECT 'Setup Complete!' as status;
SELECT 'Courses with lessons:' as info, COUNT(DISTINCT course_id) as count FROM public.course_lessons;
SELECT 'Total lessons created:' as info, COUNT(*) as count FROM public.course_lessons;  
SELECT 'Quizzes with questions:' as info, COUNT(DISTINCT quiz_id) as count FROM public.quiz_questions;
SELECT 'Total questions created:' as info, COUNT(*) as count FROM public.quiz_questions;