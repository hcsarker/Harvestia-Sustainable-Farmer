-- Simple Quiz System Setup (Without Achievements)
-- Run this in Supabase SQL Editor

-- Step 1: Add questions to existing quiz
DO $$
DECLARE
    quiz_id_var TEXT;
BEGIN
    -- Get first quiz ID
    SELECT id INTO quiz_id_var FROM public.quizzes LIMIT 1;
    
    IF quiz_id_var IS NOT NULL THEN
        -- Check if questions already exist
        IF NOT EXISTS (SELECT 1 FROM public.quiz_questions WHERE quiz_id = quiz_id_var) THEN
            -- Insert sample questions
            INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
            (quiz_id_var, 'What is the ideal pH range for most crops?', 
             '["5.0-6.0", "6.0-7.0", "7.0-8.0", "8.0-9.0"]', 
             '6.0-7.0', 
             'Most crops prefer slightly acidic to neutral soil with pH between 6.0-7.0.'),
            
            (quiz_id_var, 'Which nutrient is most important for plant growth?', 
             '["Nitrogen", "Phosphorus", "Potassium", "Calcium"]', 
             'Nitrogen', 
             'Nitrogen is essential for protein synthesis and chlorophyll production.'),
            
            (quiz_id_var, 'What percentage of organic matter is ideal in agricultural soil?', 
             '["1-2%", "3-5%", "6-8%", "9-12%"]', 
             '3-5%', 
             'Healthy agricultural soil typically contains 3-5% organic matter.');
            
            -- Update questions count
            UPDATE public.quizzes 
            SET questions_count = (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = quiz_id_var)
            WHERE id = quiz_id_var;
            
            RAISE NOTICE 'Added 3 questions to quiz: %', quiz_id_var;
        ELSE
            RAISE NOTICE 'Questions already exist for quiz: %', quiz_id_var;
        END IF;
    ELSE
        RAISE NOTICE 'No quizzes found. Please create a quiz first.';
    END IF;
END $$;

-- Step 2: Add user_quiz_results table if not exists
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB DEFAULT '{}',
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_quiz_results_quiz_id_fkey'
    ) THEN
        ALTER TABLE public.user_quiz_results 
        ADD CONSTRAINT user_quiz_results_quiz_id_fkey 
        FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Add indexes if not exist
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON public.user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_quiz_id ON public.user_quiz_results(quiz_id);

-- Success message
SELECT 'Quiz system is now ready! Questions added successfully.' as message;