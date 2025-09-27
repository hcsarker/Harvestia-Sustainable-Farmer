-- Complete Quiz System Database Setup
-- Copy and paste this entire script in your Supabase SQL Editor and run it

-- Step 1: Create all required tables
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_quiz_results table  
CREATE TABLE public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Disable RLS for admin operations
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.user_quiz_results DISABLE ROW LEVEL SECURITY;

-- Step 3: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON public.user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_quiz_id ON public.user_quiz_results(quiz_id);

-- Step 4: Insert sample quizzes (from local catalog)
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) VALUES
('soil-health-basics', 'Soil Health Basics', 'Easy', 'Soil Moisture', 3),
('climate-change-impact', 'Climate Change Impact', 'Medium', 'Climate Data', 3),
('satellite-imagery-analysis', 'Satellite Imagery Analysis', 'Hard', 'Remote Sensing', 3),
('sustainable-practices', 'Sustainable Practices', 'Easy', 'Carbon Cycle', 3),
('precision-agriculture', 'Precision Agriculture with NASA Data', 'Intermediate', 'MODIS', 3),
('water-management', 'Smart Water Management', 'Medium', 'SMAP', 3);

-- Step 5: Insert sample quiz questions
-- Questions for Soil Health Basics
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('soil-health-basics', 'What is the ideal pH range for most crops?', 
 '["4.0-5.5", "6.0-7.5", "8.0-9.0", "2.0-3.5"]', 
 '6.0-7.5', 
 'Most crops grow best in slightly acidic to neutral soil with pH 6.0-7.5'),
('soil-health-basics', 'Which nutrient is most important for plant growth?', 
 '["Iron", "Nitrogen", "Calcium", "Zinc"]', 
 'Nitrogen', 
 'Nitrogen is essential for photosynthesis and protein synthesis in plants'),
('soil-health-basics', 'What indicates healthy soil structure?', 
 '["Hard compacted soil", "Good water infiltration", "No organic matter", "High salinity"]', 
 'Good water infiltration', 
 'Healthy soil allows water to infiltrate easily while retaining necessary moisture');

-- Questions for Climate Change Impact
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('climate-change-impact', 'What is the main cause of global warming?', 
 '["Solar radiation", "Greenhouse gas emissions", "Ocean currents", "Volcanic activity"]', 
 'Greenhouse gas emissions', 
 'Human activities increase greenhouse gases, trapping heat in the atmosphere'),
('climate-change-impact', 'Which crop is most affected by temperature rise?', 
 '["Rice", "Wheat", "Corn", "All of the above"]', 
 'All of the above', 
 'All major crops are sensitive to temperature changes and extreme weather'),
('climate-change-impact', 'What is the projected global temperature increase by 2100?', 
 '["0.5-1°C", "1.5-4.5°C", "5-10°C", "No change"]', 
 '1.5-4.5°C', 
 'IPCC projections show 1.5-4.5°C increase depending on emissions scenarios');

-- Questions for Satellite Imagery Analysis
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('satellite-imagery-analysis', 'What does NDVI measure in satellite imagery?', 
 '["Soil moisture", "Vegetation health", "Temperature", "Precipitation"]', 
 'Vegetation health', 
 'NDVI (Normalized Difference Vegetation Index) indicates plant health and biomass'),
('satellite-imagery-analysis', 'Which satellite program provides free agricultural data?', 
 '["Landsat", "WorldView", "GeoEye", "QuickBird"]', 
 'Landsat', 
 'Landsat program provides free, long-term satellite imagery for agricultural monitoring'),
('satellite-imagery-analysis', 'What spatial resolution is best for farm-scale monitoring?', 
 '["1 km", "100 m", "10-30 m", "1 m"]', 
 '10-30 m', 
 '10-30 meter resolution provides good balance of coverage and detail for farm management');

-- Questions for Sustainable Practices
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('sustainable-practices', 'What is crop rotation beneficial for?', 
 '["Soil health only", "Pest control only", "Both soil health and pest control", "Neither"]', 
 'Both soil health and pest control', 
 'Crop rotation improves soil nutrients and breaks pest/disease cycles'),
('sustainable-practices', 'Which practice reduces carbon footprint in farming?', 
 '["Cover cropping", "Excessive tillage", "Monoculture", "Chemical overuse"]', 
 'Cover cropping', 
 'Cover crops sequester carbon, improve soil health, and reduce erosion'),
('sustainable-practices', 'What is integrated pest management (IPM)?', 
 '["Using only pesticides", "Combining multiple pest control methods", "Ignoring pests", "Using only biological control"]', 
 'Combining multiple pest control methods', 
 'IPM uses biological, cultural, physical, and chemical tools in coordination');

-- Questions for Precision Agriculture
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('precision-agriculture', 'What technology enables variable rate application?', 
 '["GPS and sensors", "Traditional maps", "Weather stations only", "Manual observation"]', 
 'GPS and sensors', 
 'GPS guidance with soil/yield sensors enables precise, location-specific inputs'),
('precision-agriculture', 'What does yield mapping help farmers understand?', 
 '["Weather patterns", "Field variability", "Market prices", "Equipment maintenance"]', 
 'Field variability', 
 'Yield maps reveal spatial patterns of productivity across fields'),
('precision-agriculture', 'Which NASA data helps with precision agriculture?', 
 '["MODIS vegetation indices", "Astronaut photos", "Rocket telemetry", "Space station images"]', 
 'MODIS vegetation indices', 
 'MODIS provides vegetation health data useful for precision crop management');

-- Questions for Water Management
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('water-management', 'What is the most efficient irrigation method?', 
 '["Flood irrigation", "Sprinkler irrigation", "Drip irrigation", "Furrow irrigation"]', 
 'Drip irrigation', 
 'Drip irrigation delivers water directly to roots with minimal waste'),
('water-management', 'Which NASA mission monitors soil moisture globally?', 
 '["GRACE", "SMAP", "ICESat", "GEOS"]', 
 'SMAP', 
 'SMAP (Soil Moisture Active Passive) provides global soil moisture measurements'),
('water-management', 'What indicates water stress in crops?', 
 '["Increased leaf temperature", "Faster growth", "More flowers", "Darker green color"]', 
 'Increased leaf temperature', 
 'Water-stressed plants show higher canopy temperatures due to reduced cooling');

-- Step 6: Update question counts
UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = quizzes.id
);

-- Verification queries (run these to check if everything worked)
SELECT 'Quizzes created:' as status, COUNT(*) as count FROM public.quizzes;
SELECT 'Questions created:' as status, COUNT(*) as count FROM public.quiz_questions;
SELECT 'Sample data ready!' as message;