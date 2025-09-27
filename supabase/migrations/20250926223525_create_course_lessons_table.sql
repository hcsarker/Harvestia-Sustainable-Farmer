-- Create course_lessons table for managing course lessons

CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add foreign key constraint to courses table
    CONSTRAINT fk_course_lessons_course_id 
        FOREIGN KEY (course_id) 
        REFERENCES public.courses(id) 
        ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);

-- Add unique constraint to prevent duplicate order within same course
CREATE UNIQUE INDEX IF NOT EXISTS uq_course_lesson_order 
    ON public.course_lessons(course_id, order_index);

-- Enable RLS (Row Level Security)
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow everyone to read published lessons
CREATE POLICY "Anyone can read published lessons" 
    ON public.course_lessons FOR SELECT 
    USING (is_published = true);

-- Allow authenticated users to insert/update/delete lessons
CREATE POLICY "Authenticated users can manage lessons" 
    ON public.course_lessons FOR ALL
    USING (auth.role() = 'authenticated');

-- Function to update course lesson_count automatically
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the lesson_count in courses table
    UPDATE public.courses 
    SET lesson_count = (
        SELECT COUNT(*) 
        FROM public.course_lessons 
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND is_published = true
    )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update lesson count
CREATE TRIGGER trigger_update_course_lesson_count
    AFTER INSERT OR UPDATE OR DELETE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_course_lesson_count();
