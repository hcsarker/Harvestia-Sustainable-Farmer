-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  location TEXT,
  farm_type TEXT DEFAULT 'Beginner Farm',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  duration TEXT,
  difficulty TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  certificate BOOLEAN DEFAULT false,
  lessons_count INTEGER DEFAULT 0,
  quick_facts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Create story chapters table
CREATE TABLE public.story_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  status TEXT DEFAULT 'locked',
  nasa_data_integration JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user story progress table
CREATE TABLE public.user_story_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.story_chapters(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'locked',
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, chapter_id)
);

-- Create mini games table
CREATE TABLE public.mini_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  duration TEXT,
  game_type TEXT NOT NULL,
  nasa_data_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user game scores table
CREATE TABLE public.user_game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.mini_games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  high_score INTEGER NOT NULL DEFAULT 0,
  times_played INTEGER DEFAULT 1,
  last_played TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  questions_count INTEGER DEFAULT 0,
  difficulty TEXT,
  nasa_topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  nasa_data_reference JSONB
);

-- Create user quiz results table
CREATE TABLE public.user_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answers JSONB
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create NASA data cache table
CREATE TABLE public.nasa_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_type TEXT NOT NULL,
  location TEXT,
  date_range DATERANGE,
  data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 day')
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mini_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nasa_data_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for courses (public read)
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Create RLS policies for user course progress
CREATE POLICY "Users can view their own course progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own course progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own course progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for story chapters (public read)
CREATE POLICY "Anyone can view story chapters" ON public.story_chapters FOR SELECT USING (true);

-- Create RLS policies for user story progress
CREATE POLICY "Users can view their own story progress" ON public.user_story_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own story progress" ON public.user_story_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own story progress" ON public.user_story_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mini games (public read)
CREATE POLICY "Anyone can view mini games" ON public.mini_games FOR SELECT USING (true);

-- Create RLS policies for user game scores
CREATE POLICY "Users can view their own game scores" ON public.user_game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own game scores" ON public.user_game_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own game scores" ON public.user_game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for quizzes (public read)
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);

-- Create RLS policies for quiz questions (public read)
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Create RLS policies for user quiz results
CREATE POLICY "Users can view their own quiz results" ON public.user_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz results" ON public.user_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Create RLS policies for user achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for NASA data cache (public read)
CREATE POLICY "Anyone can view NASA data cache" ON public.nasa_data_cache FOR SELECT USING (true);
CREATE POLICY "System can manage NASA data cache" ON public.nasa_data_cache FOR ALL USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for courses
INSERT INTO public.courses (title, description, instructor, duration, difficulty, rating, students_count, certificate, lessons_count, quick_facts) VALUES
('Sustainable Agriculture Fundamentals', 'Learn the core principles of sustainable farming practices using NASA satellite data and climate monitoring.', 'Dr. Sarah Johnson', '6 weeks', 'Beginner', 4.8, 1250, true, 12, ARRAY['Uses real NASA MODIS satellite data', 'Track soil moisture with SMAP data', 'Monitor crop health via NDVI indices']),
('Climate-Smart Farming', 'Advanced techniques for adapting farming practices to changing climate conditions using NASA Earth observation data.', 'Prof. Michael Chen', '8 weeks', 'Intermediate', 4.6, 890, true, 16, ARRAY['NASA GISS temperature data integration', 'Precipitation forecasting models', 'Carbon sequestration tracking']),
('Precision Agriculture with Remote Sensing', 'Master precision agriculture using NASA satellite imagery and remote sensing technologies.', 'Dr. Emily Rodriguez', '10 weeks', 'Advanced', 4.9, 567, true, 20, ARRAY['Landsat and Sentinel data analysis', 'AI-powered crop monitoring', 'Yield prediction algorithms']);

-- Insert initial data for story chapters
INSERT INTO public.story_chapters (chapter_number, title, description, duration, status) VALUES
(1, 'Welcome to Green Valley Farm', 'Meet Sarah, a young farmer inheriting her grandmother''s farm. Learn the basics of sustainable farming.', '15 min', 'unlocked'),
(2, 'The Drought Challenge', 'Water becomes scarce. Use NASA satellite data to optimize irrigation and save the crops.', '20 min', 'locked'),
(3, 'Climate Data Analytics', 'Learn to interpret weather patterns and make data-driven farming decisions.', '25 min', 'locked'),
(4, 'Harvest Success', 'Apply everything you''ve learned to achieve a successful sustainable harvest.', '30 min', 'locked');

-- Insert initial data for mini games
INSERT INTO public.mini_games (title, description, difficulty, duration, game_type, nasa_data_type) VALUES
('Crop Water Manager', 'Manage irrigation using real NASA soil moisture data to optimize water usage.', 'Easy', '5-10 min', 'simulation', 'SMAP'),
('Weather Predictor', 'Predict weather patterns using NASA atmospheric data and save your crops.', 'Medium', '10-15 min', 'prediction', 'GISS'),
('Satellite Farm Monitor', 'Use NASA satellite imagery to detect crop diseases and optimize farming.', 'Hard', '15-20 min', 'analysis', 'MODIS'),
('Carbon Tracker', 'Track and optimize carbon sequestration in your virtual farm ecosystem.', 'Medium', '8-12 min', 'strategy', 'OCO-2');

-- Insert initial data for quizzes
INSERT INTO public.quizzes (title, questions_count, difficulty, nasa_topic) VALUES
('Soil Health Basics', 10, 'Easy', 'Soil Moisture'),
('Climate Change Impact', 15, 'Medium', 'Climate Data'),
('Satellite Imagery Analysis', 12, 'Hard', 'Remote Sensing'),
('Sustainable Practices', 8, 'Easy', 'Carbon Cycle');

-- Insert initial data for achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Welcome Farmer', 'Complete your first story chapter', 'Sprout', 'story_chapters', 1),
('Course Graduate', 'Complete your first course', 'GraduationCap', 'courses', 1),
('Game Master', 'Play 5 different mini games', 'Trophy', 'games_played', 5),
('Quiz Champion', 'Score 100% on any quiz', 'Award', 'perfect_quiz', 1),
('Data Explorer', 'View NASA data visualization', 'Satellite', 'nasa_data_viewed', 1),
('Eco Warrior', 'Complete sustainability course', 'Leaf', 'eco_course', 1);