-- Create stories table (parent of story chapters)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  estimated_time TEXT,
  chapters_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add story_id to story_chapters table
ALTER TABLE public.story_chapters 
ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE;

-- Enable RLS on stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stories
DROP POLICY IF EXISTS "Anyone can view published stories" ON public.stories;
CREATE POLICY "Anyone can view published stories" 
  ON public.stories 
  FOR SELECT 
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can view all stories" ON public.stories;
CREATE POLICY "Admins can view all stories" 
  ON public.stories 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert stories" ON public.stories;
CREATE POLICY "Admins can insert stories" 
  ON public.stories 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update stories" ON public.stories;
CREATE POLICY "Admins can update stories" 
  ON public.stories 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete stories" ON public.stories;
CREATE POLICY "Admins can delete stories" 
  ON public.stories 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Create trigger for stories updated_at
DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
CREATE TRIGGER update_stories_updated_at 
  BEFORE UPDATE ON public.stories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample stories
INSERT INTO public.stories (title, description, image_url, difficulty, estimated_time, chapters_count, is_published) VALUES
('Sarah''s Green Valley Farm', 'Follow Sarah as she transforms her grandmother''s farm using sustainable practices and NASA satellite data. Learn climate-smart farming through her journey.', '/Team logo.jpg', 'Beginner', '2 hours', 4, true),
('Climate Resilient Farming', 'Master advanced techniques for adapting to climate change. Use real NASA data to build a resilient farming operation.', '/Team logo.jpg', 'Intermediate', '3 hours', 0, false),
('Precision Agriculture Journey', 'Dive deep into precision agriculture with cutting-edge technology and NASA Earth observation data.', '/Team logo.jpg', 'Advanced', '4 hours', 0, false);

-- Update existing story_chapters to link to first story
UPDATE public.story_chapters 
SET story_id = (SELECT id FROM public.stories WHERE title = 'Sarah''s Green Valley Farm' LIMIT 1)
WHERE story_id IS NULL;

-- Update chapters count for first story
UPDATE public.stories 
SET chapters_count = (
  SELECT COUNT(*) 
  FROM public.story_chapters 
  WHERE story_id = public.stories.id
)
WHERE title = 'Sarah''s Green Valley Farm';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_story_chapters_story_id ON public.story_chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(is_published);
