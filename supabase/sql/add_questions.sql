-- Quick Quiz Fix Script
-- Copy and paste in Supabase SQL Editor

-- Add questions to first quiz
insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation
)
   select '5c8b88fb-29e9-4fef-93a8-65ef6fba248b',
          'What is the ideal pH range for most crops?',
          '["5.0-6.0", "6.0-7.0", "7.0-8.0", "8.0-9.0"]',
          '6.0-7.0',
          'Most crops prefer slightly acidic to neutral soil with pH between 6.0-7.0.'
    where not exists (
      select 1
        from public.quiz_questions
       where quiz_id = '5c8b88fb-29e9-4fef-93a8-65ef6fba248b'
         and question like '%pH range%'
   );

insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation
)
   select '5c8b88fb-29e9-4fef-93a8-65ef6fba248b',
          'Which nutrient is most important for plant growth?',
          '["Nitrogen", "Phosphorus", "Potassium", "Calcium"]',
          'Nitrogen',
          'Nitrogen is essential for protein synthesis and chlorophyll production.'
    where not exists (
      select 1
        from public.quiz_questions
       where quiz_id = '5c8b88fb-29e9-4fef-93a8-65ef6fba248b'
         and question like '%nutrient%'
   );

insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation
)
   select '5c8b88fb-29e9-4fef-93a8-65ef6fba248b',
          'What causes soil erosion?',
          '["Wind and water", "Plants", "Fertilizers", "Sunlight"]',
          'Wind and water',
          'Wind and water are primary causes of soil erosion.'
    where not exists (
      select 1
        from public.quiz_questions
       where quiz_id = '5c8b88fb-29e9-4fef-93a8-65ef6fba248b'
         and question like '%erosion%'
   );

-- Update question count
update public.quizzes
   set
   questions_count = (
      select count(*)
        from public.quiz_questions
       where quiz_id = public.quizzes.id
   )
 where id = '5c8b88fb-29e9-4fef-93a8-65ef6fba248b';

-- Success
select 'Quiz questions added! Quiz exam is now ready.' as message;