-- Simple Quiz System Database Setup for Supabase/PostgreSQL
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_quiz_results CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;

-- Create quizzes table
CREATE TABLE public.quizzes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    nasa_topic TEXT,
    questions_count INTEGER DEFAULT 0,
    attempts_allowed INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE
);

-- Create user_quiz_results table
CREATE TABLE public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB DEFAULT '{}',
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_user_quiz_results_user_id ON public.user_quiz_results(user_id);
CREATE INDEX idx_user_quiz_results_quiz_id ON public.user_quiz_results(quiz_id);

-- Add unique constraint for single attempt per user per quiz
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_quiz_attempt_idx ON public.user_quiz_results (user_id, quiz_id);

-- Add attempts limit constraint
ALTER TABLE public.quizzes ADD CONSTRAINT chk_quizzes_attempts_allowed_nonneg CHECK (attempts_allowed >= 1);

-- Function to refresh question count for a quiz
CREATE OR REPLACE FUNCTION public.refresh_quiz_questions_count(p_quiz_id TEXT)
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

-- Create trigger
DROP TRIGGER IF EXISTS trg_quiz_questions_count_aiud ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_count_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.tr_quiz_questions_count_aiud();

-- Create achievements table if not exists
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tier TEXT DEFAULT 'bronze',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed quiz achievements
INSERT INTO public.achievements (code, name, description, tier)
SELECT 'bronze_quiz', 'Bronze Quiz', 'Score at least 80% on a quiz', 'bronze'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE code = 'bronze_quiz');

INSERT INTO public.achievements (code, name, description, tier)
SELECT 'silver_quiz', 'Silver Quiz', 'Score at least 90% on a quiz', 'silver'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE code = 'silver_quiz');

INSERT INTO public.achievements (code, name, description, tier)
SELECT 'perfect_quiz', 'Perfect Score', 'Score 100% on a quiz', 'gold'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE code = 'perfect_quiz');

-- Insert sample data
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('soil-basics', 'Soil Management Basics', 'Easy', 'Soil Health', 3, 5),
('water-conservation', 'Water Conservation Techniques', 'Medium', 'Water Management', 4, 3),
('crop-rotation', 'Sustainable Crop Rotation', 'Hard', 'Crop Science', 5, 2);

-- Insert sample questions for soil-basics quiz
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('soil-basics', 'What is the ideal pH range for most crops?', 
 '["5.0-6.0", "6.0-7.0", "7.0-8.0", "8.0-9.0"]', 
 '6.0-7.0', 
 'Most crops prefer slightly acidic to neutral soil with pH between 6.0-7.0.'),

('soil-basics', 'Which nutrient is most important for plant growth?', 
 '["Nitrogen", "Phosphorus", "Potassium", "Calcium"]', 
 'Nitrogen', 
 'Nitrogen is essential for protein synthesis and chlorophyll production.'),

('soil-basics', 'What percentage of organic matter is ideal in agricultural soil?', 
 '["1-2%", "3-5%", "6-8%", "9-12%"]', 
 '3-5%', 
 'Healthy agricultural soil typically contains 3-5% organic matter.');

-- Insert sample questions for water-conservation quiz
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('water-conservation', 'Which irrigation method is most water-efficient?', 
 '["Flood irrigation", "Sprinkler irrigation", "Drip irrigation", "Furrow irrigation"]', 
 'Drip irrigation', 
 'Drip irrigation delivers water directly to plant roots with minimal waste.'),

('water-conservation', 'What is mulching primarily used for?', 
 '["Pest control", "Water retention", "Fertilization", "Weed prevention"]', 
 'Water retention', 
 'Mulching helps retain soil moisture and reduces evaporation.'),

('water-conservation', 'When is the best time to water plants?', 
 '["Noon", "Early morning", "Late evening", "Anytime"]', 
 'Early morning', 
 'Early morning watering reduces evaporation and allows plants to absorb water efficiently.'),

('water-conservation', 'What is xeriscaping?', 
 '["Desert farming", "Drought-resistant landscaping", "Flood irrigation", "Rainwater harvesting"]', 
 'Drought-resistant landscaping', 
 'Xeriscaping uses drought-tolerant plants to reduce water consumption.');

-- Insert sample questions for crop-rotation quiz  
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('crop-rotation', 'What is the main benefit of crop rotation?', 
 '["Higher yields", "Soil health improvement", "Pest reduction", "All of the above"]', 
 'All of the above', 
 'Crop rotation improves soil health, reduces pests, and can increase yields.'),

('crop-rotation', 'Which crop is best for nitrogen fixation?', 
 '["Corn", "Soybeans", "Wheat", "Rice"]', 
 'Soybeans', 
 'Legumes like soybeans have nitrogen-fixing bacteria in their root nodules.'),

('crop-rotation', 'How often should crop rotation cycles occur?', 
 '["Annually", "Every 2-3 years", "Every 5 years", "Every decade"]', 
 'Every 2-3 years', 
 'Most effective crop rotations cycle every 2-3 years to maximize benefits.'),

('crop-rotation', 'Which practice should be avoided in sustainable agriculture?', 
 '["Cover cropping", "Monoculture", "Composting", "Integrated pest management"]', 
 'Monoculture', 
 'Monoculture depletes soil nutrients and increases pest and disease risks.'),

('crop-rotation', 'What is a cover crop?', 
 '["Cash crop", "Soil protection plant", "Weed killer", "Harvest crop"]', 
 'Soil protection plant', 
 'Cover crops protect and improve soil when main crops are not growing.');

-- Update questions count for each quiz
UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = public.quizzes.id
);

-- Success message
SELECT 'Quiz system setup complete! You can now create and manage quizzes.' as message;