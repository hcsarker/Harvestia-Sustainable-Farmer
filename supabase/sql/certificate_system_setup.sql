-- CERTIFICATE SYSTEM SETUP
-- Dynamic Certificate System connected with User Courses
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bnyagvqylorlastljrey/sql

-- ================================
-- STEP 1: CREATE CERTIFICATES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_name TEXT NOT NULL,
    certificate_type TEXT DEFAULT 'course_completion',
    issued_date TIMESTAMPTZ DEFAULT NOW(),
    certificate_number TEXT UNIQUE,
    completion_score INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    quiz_scores JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for certificates
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_date ON public.certificates(issued_date);

-- ================================
-- STEP 2: CREATE USER_PROGRESS TABLE  
-- ================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    progress_type TEXT NOT NULL CHECK (progress_type IN ('lesson_started', 'lesson_completed', 'quiz_attempted', 'quiz_passed', 'course_started', 'course_completed')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    score INTEGER,
    time_spent_minutes INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id, lesson_id, quiz_id, progress_type)
);

-- Indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_quiz ON public.user_progress(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON public.user_progress(progress_type);

-- ================================
-- STEP 3: ENABLE RLS AND POLICIES
-- ================================

-- Certificates RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" 
    ON public.certificates FOR SELECT 
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all certificates" 
    ON public.certificates FOR ALL 
    USING (true);

-- User Progress RLS  
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" 
    ON public.user_progress FOR ALL 
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all progress" 
    ON public.user_progress FOR ALL 
    USING (true);

-- ================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- ================================

-- Function to auto-generate certificate when course is completed
CREATE OR REPLACE FUNCTION generate_certificate_for_user(
    p_user_id UUID,
    p_course_id UUID
) RETURNS UUID AS $$
DECLARE
    v_certificate_id UUID;
    v_course_title TEXT;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_completion_score INTEGER;
BEGIN
    -- Get course info
    SELECT title INTO v_course_title FROM public.courses WHERE id = p_course_id;
    
    -- Count total lessons
    SELECT COUNT(*) INTO v_total_lessons 
    FROM public.course_lessons WHERE course_id = p_course_id;
    
    -- Count completed lessons for user
    SELECT COUNT(*) INTO v_completed_lessons
    FROM public.user_progress 
    WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND progress_type = 'lesson_completed';
    
    -- Calculate completion score (percentage)
    v_completion_score := CASE 
        WHEN v_total_lessons > 0 THEN (v_completed_lessons * 100 / v_total_lessons)
        ELSE 0 
    END;
    
    -- Only generate certificate if course is fully completed
    IF v_completion_score >= 100 THEN
        INSERT INTO public.certificates (
            user_id,
            course_id,
            certificate_name,
            completion_score,
            total_lessons_completed
        ) VALUES (
            p_user_id,
            p_course_id,
            'Certificate of Completion: ' || v_course_title,
            v_completion_score,
            v_completed_lessons
        ) RETURNING id INTO v_certificate_id;
        
        RETURN v_certificate_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- STEP 5: CREATE SAMPLE DATA
-- ================================

-- Add sample user progress (using dummy user IDs)
INSERT INTO public.user_progress (user_id, course_id, progress_type, completion_percentage, created_at)
SELECT 
    gen_random_uuid() as user_id,
    c.id as course_id,
    'course_started' as progress_type,
    25 as completion_percentage,
    NOW() - INTERVAL '7 days'
FROM public.courses c
LIMIT 3;

-- Add sample lesson completions
INSERT INTO public.user_progress (user_id, course_id, lesson_id, progress_type, completion_percentage, completed_at)
SELECT 
    (SELECT user_id FROM public.user_progress WHERE progress_type = 'course_started' LIMIT 1),
    cl.course_id,
    cl.id as lesson_id,
    'lesson_completed' as progress_type,
    100 as completion_percentage,
    NOW() - INTERVAL '3 days'
FROM public.course_lessons cl
LIMIT 5;

-- Generate sample certificates
INSERT INTO public.certificates (user_id, course_id, certificate_name, completion_score, total_lessons_completed)
SELECT DISTINCT
    up.user_id,
    up.course_id,
    'Certificate of Completion: ' || c.title,
    85 + (RANDOM() * 15)::INTEGER,
    (SELECT COUNT(*) FROM public.course_lessons WHERE course_id = up.course_id)
FROM public.user_progress up
JOIN public.courses c ON c.id = up.course_id
WHERE up.progress_type = 'course_started'
LIMIT 2;

-- ================================
-- VERIFICATION
-- ================================
SELECT 'Certificate System Setup Complete!' as status;
SELECT 'Total Certificates:' as info, COUNT(*) as count FROM public.certificates;
SELECT 'Total User Progress Records:' as info, COUNT(*) as count FROM public.user_progress;
SELECT 'Sample Certificate:' as info, certificate_name as name FROM public.certificates LIMIT 1;