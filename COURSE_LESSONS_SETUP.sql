-- Complete Course Lessons System Setup
-- Copy this entire script and run in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/bnyagvqylorlastljrey/sql

-- Step 1: Add lesson_count column to courses table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'lesson_count'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN lesson_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added lesson_count column to courses table';
    ELSE
        RAISE NOTICE 'lesson_count column already exists in courses table';
    END IF;
END $$;

-- Step 2: Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    video_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key to courses table
    CONSTRAINT fk_course_lessons_course_id 
        FOREIGN KEY (course_id) 
        REFERENCES public.courses(id) 
        ON DELETE CASCADE
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);

-- Step 4: Create unique constraint for lesson order within each course
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_course_lesson_order'
    ) THEN
        CREATE UNIQUE INDEX uq_course_lesson_order 
            ON public.course_lessons(course_id, order_index);
        RAISE NOTICE 'Created unique constraint for lesson order';
    END IF;
END $$;

-- Step 5: Enable RLS and create policies
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read published lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Authenticated users can manage lessons" ON public.course_lessons;

-- Create new policies
CREATE POLICY "Anyone can read published lessons" 
    ON public.course_lessons FOR SELECT 
    USING (is_published = true);

CREATE POLICY "Authenticated users can manage lessons" 
    ON public.course_lessons FOR ALL
    USING (auth.role() = 'authenticated');

-- Step 6: Create function to auto-update lesson count
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update lesson_count in courses table
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

-- Step 7: Create trigger to auto-update lesson count
DROP TRIGGER IF EXISTS trigger_update_course_lesson_count ON public.course_lessons;
CREATE TRIGGER trigger_update_course_lesson_count
    AFTER INSERT OR UPDATE OR DELETE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_course_lesson_count();

-- Step 8: Add sample lessons to first few courses
DO $$
DECLARE
    course_record RECORD;
    course_count INTEGER := 0;
BEGIN
    -- Loop through first 3 courses and add sample lessons
    FOR course_record IN 
        SELECT id, title FROM public.courses 
        ORDER BY created_at 
        LIMIT 3
    LOOP
        course_count := course_count + 1;
        
        -- Add 3 sample lessons per course
        INSERT INTO public.course_lessons (course_id, title, content, order_index, duration_minutes, is_published)
        VALUES 
        -- Lesson 1
        (
            course_record.id,
            'Introduction to ' || course_record.title,
            'This lesson introduces the basic concepts and fundamentals. You will learn the core principles that form the foundation of ' || course_record.title || '. Perfect for beginners starting their journey.',
            1,
            15,
            true
        ),
        -- Lesson 2  
        (
            course_record.id,
            'Advanced Techniques',
            'Dive deeper into advanced methodologies and professional techniques. This lesson covers complex scenarios, best practices, and industry standards that experienced practitioners use.',
            2,
            25,
            true
        ),
        -- Lesson 3
        (
            course_record.id,
            'Practical Applications & Case Studies',
            'Put your knowledge into practice with real-world applications and detailed case studies. Learn how to apply these concepts in actual farming and agricultural scenarios.',
            3,
            20,
            true
        );
        
        RAISE NOTICE 'Added 3 lessons for course: %', course_record.title;
    END LOOP;
    
    RAISE NOTICE 'Sample lessons added to % courses', course_count;
END $$;

-- Step 9: Update all existing courses lesson count
UPDATE public.courses 
SET lesson_count = (
    SELECT COUNT(*) 
    FROM public.course_lessons 
    WHERE course_id = courses.id 
    AND is_published = true
);

-- Step 10: Verification queries
SELECT 
    'Course Lessons System Setup Complete!' as message,
    COUNT(*) as total_lessons_created
FROM public.course_lessons;

-- Show courses with their lesson counts
SELECT 
    c.title as course_title,
    c.lesson_count,
    COUNT(cl.id) as actual_lessons_in_db
FROM public.courses c
LEFT JOIN public.course_lessons cl ON c.id = cl.course_id AND cl.is_published = true
GROUP BY c.id, c.title, c.lesson_count
ORDER BY c.lesson_count DESC, c.title
LIMIT 10;

-- Show sample lessons
SELECT 
    c.title as course_title,
    cl.title as lesson_title,
    cl.order_index,
    cl.duration_minutes
FROM public.courses c
JOIN public.course_lessons cl ON c.id = cl.course_id
WHERE cl.is_published = true
ORDER BY c.title, cl.order_index
LIMIT 15;