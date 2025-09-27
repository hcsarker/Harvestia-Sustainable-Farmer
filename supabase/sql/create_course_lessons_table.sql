-- Create course_lessons table for managing course lessons
-- Run this in Supabase SQL Editor

-- Create the course_lessons table
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
DROP POLICY IF EXISTS "Anyone can read published lessons" ON public.course_lessons;
CREATE POLICY "Anyone can read published lessons" 
    ON public.course_lessons FOR SELECT 
    USING (is_published = true);

-- Allow authenticated users to insert/update/delete lessons
DROP POLICY IF EXISTS "Authenticated users can manage lessons" ON public.course_lessons;
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
DROP TRIGGER IF EXISTS trigger_update_course_lesson_count ON public.course_lessons;
CREATE TRIGGER trigger_update_course_lesson_count
    AFTER INSERT OR UPDATE OR DELETE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_course_lesson_count();

-- Insert sample lessons for existing courses
-- Get first few course IDs and add sample lessons
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER := 0;
BEGIN
    -- Loop through first 3 courses and add sample lessons
    FOR course_record IN 
        SELECT id, title FROM public.courses 
        ORDER BY created_at 
        LIMIT 3
    LOOP
        lesson_count := lesson_count + 1;
        
        -- Add 3 sample lessons per course
        INSERT INTO public.course_lessons (course_id, title, content, order_index, duration_minutes)
        VALUES 
        (
            course_record.id,
            'Introduction to ' || course_record.title,
            'This lesson introduces the basic concepts of ' || course_record.title || '. You will learn the fundamental principles and get started with practical applications.',
            1,
            15
        ),
        (
            course_record.id,
            'Advanced Techniques in ' || course_record.title,
            'Dive deeper into advanced methodologies and best practices. This lesson covers complex scenarios and real-world applications.',
            2,
            25
        ),
        (
            course_record.id,
            'Practical Applications of ' || course_record.title,
            'Put your knowledge into practice with hands-on exercises and case studies. Learn how to apply these concepts in real farming situations.',
            3,
            20
        );
        
        RAISE NOTICE 'Added lessons for course: %', course_record.title;
    END LOOP;
    
    RAISE NOTICE 'Sample lessons added successfully!';
END $$;

-- Verify the results
SELECT 
    'Course Lessons Table Created Successfully!' as message,
    COUNT(*) as total_lessons
FROM public.course_lessons;

-- Show courses with their lesson counts
SELECT 
    c.title as course_title,
    c.lesson_count,
    COUNT(cl.id) as actual_lessons
FROM public.courses c
LEFT JOIN public.course_lessons cl ON c.id = cl.course_id
GROUP BY c.id, c.title, c.lesson_count
ORDER BY c.title
LIMIT 10;