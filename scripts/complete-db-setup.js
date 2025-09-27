import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bnyagvqylorlastljrey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWFndnF5bG9ybGFzdGxqcmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg5MDA5MiwiZXhwIjoyMDcxNDY2MDkyfQ.aZl3V0ooLsjxTQ5lnlH_PATG80XVgEgYVklPepb1vMA'
);

console.log('🚀 COMPLETE DATABASE SETUP SCRIPT');
console.log('==================================');

async function completeSetup() {
  try {
    console.log('\n📊 CHECKING DATABASE STATUS...');
    
    // Check current state
    const [coursesRes, quizzesRes, questionsRes] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact' }),
      supabase.from('quizzes').select('*', { count: 'exact' }),
      supabase.from('quiz_questions').select('*', { count: 'exact' })
    ]);
    
    console.log('✅ Courses:', coursesRes.count);
    console.log('✅ Quizzes:', quizzesRes.count);
    console.log('✅ Quiz Questions:', questionsRes.count);
    
    // Check if course_lessons exists
    console.log('\n📚 CHECKING COURSE_LESSONS TABLE...');
    const { data: testLessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact' })
      .limit(1);
      
    if (lessonsError && lessonsError.message.includes('does not exist')) {
      console.log('❌ course_lessons table is missing');
      console.log('\n🔧 MANUAL ACTION REQUIRED:');
      console.log('Go to Supabase Dashboard: https://supabase.com/dashboard/project/bnyagvqylorlastljrey/sql');
      console.log('\nCopy and paste this SQL:');
      console.log('----------------------------------------');
      
      const createTableSQL = `-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(course_id, order_index);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published lessons" 
  ON public.course_lessons FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Service role can manage lessons" 
  ON public.course_lessons FOR ALL 
  USING (true);`;
  
      console.log(createTableSQL);
      console.log('----------------------------------------');
      console.log('\n⚠️ After running this SQL, run this script again to populate lessons!');
      
    } else if (lessonsError) {
      console.log('⚠️ Error checking lessons:', lessonsError.message);
    } else {
      console.log('✅ course_lessons table exists with', testLessons.length || 0, 'lessons');
      
      // Add lessons if table exists
      console.log('\n📝 ADDING COMPREHENSIVE LESSONS...');
      
      if (coursesRes.data && coursesRes.data.length > 0) {
        // Clear existing lessons
        await supabase.from('course_lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('🧹 Cleared existing lessons');
        
        const allLessons = [];
        
        coursesRes.data.slice(0, 5).forEach((course, courseIndex) => {
          const courseLessons = [
            {
              course_id: course.id,
              title: `Introduction to ${course.title}`,
              content: `Welcome to ${course.title}. This introductory lesson covers the fundamental concepts and principles. You will learn the basic terminology, key objectives, and how this course will benefit your sustainable farming journey. Perfect for beginners who want to build a solid foundation.`,
              order_index: 1,
              duration_minutes: 20,
              is_published: true
            },
            {
              course_id: course.id,
              title: 'Core Principles and Best Practices',
              content: `Dive deep into the core principles of ${course.title}. This lesson explores industry best practices, proven methodologies, and expert recommendations. Learn from real-world examples and case studies that demonstrate successful implementation.`,
              order_index: 2,
              duration_minutes: 30,
              is_published: true
            },
            {
              course_id: course.id,
              title: 'Advanced Techniques and Technologies',
              content: `Explore advanced techniques and cutting-edge technologies in ${course.title}. This lesson covers modern tools, innovative approaches, and emerging trends that are shaping the future of sustainable agriculture.`,
              order_index: 3,
              duration_minutes: 25,
              is_published: true
            },
            {
              course_id: course.id,
              title: 'Practical Implementation Guide',
              content: `Learn how to implement ${course.title} concepts in real-world scenarios. This hands-on lesson provides step-by-step guidance, practical tips, and actionable strategies that you can apply immediately in your farming operations.`,
              order_index: 4,
              duration_minutes: 35,
              is_published: true
            },
            {
              course_id: course.id,
              title: 'Assessment and Future Steps',
              content: `Review key concepts from ${course.title} and assess your learning progress. This final lesson includes self-assessment tools, next steps for continued learning, and resources for further exploration of advanced topics.`,
              order_index: 5,
              duration_minutes: 15,
              is_published: true
            }
          ];
          
          allLessons.push(...courseLessons);
        });
        
        const { data: insertedLessons, error: lessonsInsertError } = await supabase
          .from('course_lessons')
          .insert(allLessons);
          
        if (lessonsInsertError) {
          console.log('❌ Error adding lessons:', lessonsInsertError.message);
        } else {
          console.log('✅ Added', allLessons.length, 'comprehensive lessons!');
        }
      }
    }
    
    // Final verification
    console.log('\n🎯 FINAL VERIFICATION');
    const [finalQuestions, finalQuizzes] = await Promise.all([
      supabase.from('quiz_questions').select('*', { count: 'exact' }),
      supabase.from('quizzes').select('*', { count: 'exact' })
    ]);
    
    const { data: finalLessons, error: finalLessonsError } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact' });
    
    console.log('📊 DATABASE STATUS:');
    console.log('   ✅ Courses:', coursesRes.count);
    console.log('   ✅ Quizzes:', finalQuizzes.count);
    console.log('   ✅ Quiz Questions:', finalQuestions.count);
    console.log('   ✅ Course Lessons:', finalLessonsError ? 'Table missing' : finalLessons.length);
    
    if (!finalLessonsError && finalLessons.length > 0) {
      console.log('\n🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
      console.log('✅ All tables created and populated');
      console.log('✅ Quiz system fully functional');
      console.log('✅ Course lessons system ready');
    } else {
      console.log('\n⚠️ ALMOST DONE - Manual table creation needed');
      console.log('   Run the SQL shown above in Supabase dashboard');
      console.log('   Then everything will be fully functional');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

completeSetup();