-- Migration: add content and video_url columns to course_lessons
-- Run this in your Supabase SQL editor or include in your migration pipeline

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'content'
  ) THEN
    ALTER TABLE course_lessons ADD COLUMN content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE course_lessons ADD COLUMN video_url text;
  END IF;
END
$$;

-- Optional: if you want a default placeholder for older rows, run an UPDATE
-- UPDATE course_lessons SET content = 'Lesson content not provided.' WHERE content IS NULL;
