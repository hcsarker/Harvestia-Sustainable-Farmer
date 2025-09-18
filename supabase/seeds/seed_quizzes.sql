-- Seed data for quizzes and quiz_questions (safe for dev/testing)
-- Usage (Supabase SQL Editor or psql): run this file to populate quizzes

-- Quizzes
insert into public.quizzes (id, title, questions_count, difficulty, nasa_topic)
values
  (gen_random_uuid(), 'Soil Health Basics', 5, 'Easy', 'Soil Moisture'),
  (gen_random_uuid(), 'Climate Change & Agriculture', 5, 'Medium', 'Climate Data'),
  (gen_random_uuid(), 'Precision Farming Technologies', 5, 'Hard', 'Remote Sensing')
on conflict do nothing;

-- Pick quiz IDs to use for questions
with q as (
  select id, title from public.quizzes
  where title in ('Soil Health Basics','Climate Change & Agriculture','Precision Farming Technologies')
)
-- Insert questions per quiz (example set of 5 per quiz)
insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select id as quiz_id,
  unnest(array[
    'What does soil moisture primarily affect?',
    'Which practice improves soil structure?',
    'Which nutrient is essential for root growth?',
    'Cover crops help by…',
    'Soil pH close to neutral is important because…'
  ]) as question,
  unnest(array[
    '["Plant water availability","Wind speed","Solar activity","Snow cover"]',
    '["Tillage","Heavy machinery","Adding organic matter","Over-irrigation"]',
    '["Nitrogen","Phosphorus","Potassium","Calcium"]',
    '["Increasing erosion","Reducing soil compaction","Reducing nutrient cycling","Improving infiltration"]',
    '["It increases salinity","It optimizes nutrient availability","It removes all pathogens","It maximizes evaporation"]'
  ])::jsonb as options,
  unnest(array[
    'Plant water availability',
    'Adding organic matter',
    'Phosphorus',
    'Improving infiltration',
    'It optimizes nutrient availability'
  ]) as correct_answer,
  unnest(array[
    'Moisture availability drives plant growth and stress tolerance.',
    'Organic matter improves aggregation and porosity.',
    'Phosphorus supports roots and energy transfer (ATP).',
    'Cover crops increase residue and enhance infiltration.',
    'Most crops prefer near-neutral pH for nutrient uptake.'
  ]) as explanation
from q
on conflict do nothing;
