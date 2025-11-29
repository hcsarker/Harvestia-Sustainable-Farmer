-- Add admin management features to story_chapters table

-- Add content field for rich chapter content
ALTER TABLE public.story_chapters 
ADD COLUMN IF NOT EXISTS content JSONB,
ADD COLUMN IF NOT EXISTS icon_type TEXT DEFAULT 'Sprout',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for story_chapters
DROP TRIGGER IF EXISTS update_story_chapters_updated_at ON public.story_chapters;
CREATE TRIGGER update_story_chapters_updated_at 
  BEFORE UPDATE ON public.story_chapters 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add admin role check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for admin CRUD operations
DROP POLICY IF EXISTS "Admins can insert story chapters" ON public.story_chapters;
CREATE POLICY "Admins can insert story chapters" 
  ON public.story_chapters 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update story chapters" ON public.story_chapters;
CREATE POLICY "Admins can update story chapters" 
  ON public.story_chapters 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete story chapters" ON public.story_chapters;
CREATE POLICY "Admins can delete story chapters" 
  ON public.story_chapters 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Update existing chapters with content structure
UPDATE public.story_chapters
SET content = jsonb_build_object(
  'heading', CASE chapter_number
    WHEN 1 THEN 'Meet Sarah and the Farm'
    WHEN 2 THEN 'The Drought Challenge'
    WHEN 3 THEN 'Climate Data Analytics'
    WHEN 4 THEN 'Harvest Success'
    ELSE 'Chapter Content'
  END,
  'sections', CASE chapter_number
    WHEN 1 THEN jsonb_build_array(
      jsonb_build_object('title', 'A new beginning', 'text', 'Sarah inherits her grandmother''s farm in Green Valley. It''s fertile land, but climate patterns have become unpredictable.'),
      jsonb_build_object('title', 'Sustainable mindset', 'text', 'She decides to adopt climate-smart practices: crop rotation, soil moisture monitoring, and efficient irrigation.'),
      jsonb_build_object('title', 'First task', 'text', 'Use satellite NDVI to check crop health and identify fields needing immediate care.')
    )
    WHEN 2 THEN jsonb_build_array(
      jsonb_build_object('title', 'Water scarcity', 'text', 'A prolonged dry spell means every drop counts. Sarah turns to soil moisture data (SMAP).'),
      jsonb_build_object('title', 'Irrigation planning', 'text', 'She creates a schedule prioritizing stressed fields, while avoiding over-watering.'),
      jsonb_build_object('title', 'Outcome', 'text', 'Water usage drops 20% with no yield penalty.')
    )
    WHEN 3 THEN jsonb_build_array(
      jsonb_build_object('title', 'Weather windows', 'text', 'Using GPM precipitation and temperature trends, Sarah plans planting windows to avoid extreme heat.'),
      jsonb_build_object('title', 'Risk management', 'text', 'She diversifies crops and uses mulching to protect soils.'),
      jsonb_build_object('title', 'Decision support', 'text', 'Dashboards summarize risk and recommend weekly actions.')
    )
    WHEN 4 THEN jsonb_build_array(
      jsonb_build_object('title', 'Putting it all together', 'text', 'Sarah integrates NDVI trends, soil moisture, and forecasts to determine the harvest window.'),
      jsonb_build_object('title', 'Community impact', 'text', 'She shares best practices with neighboring farms, improving resilience across the valley.'),
      jsonb_build_object('title', 'You did it!', 'text', 'Completing this chapter unlocks your Story Master badge if all previous chapters are done.')
    )
    ELSE jsonb_build_array()
  END
),
icon_type = CASE chapter_number
  WHEN 1 THEN 'Sprout'
  WHEN 2 THEN 'Droplets'
  WHEN 3 THEN 'Sun'
  WHEN 4 THEN 'Trophy'
  ELSE 'Sprout'
END
WHERE content IS NULL;
