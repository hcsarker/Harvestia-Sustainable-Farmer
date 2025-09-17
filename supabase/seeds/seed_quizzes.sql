-- Seed data for quizzes and quiz_questions (safe for dev/testing)
-- Usage (Supabase SQL Editor or psql): run this file to populate quizzes

-- Quizzes (idempotent inserts)
insert into public.quizzes (id, title, questions_count, difficulty, nasa_topic)
select gen_random_uuid(), 'Soil Health Basics', 5, 'Easy', 'Soil Moisture'
where not exists (select 1 from public.quizzes where title = 'Soil Health Basics');

insert into public.quizzes (id, title, questions_count, difficulty, nasa_topic)
select gen_random_uuid(), 'Climate Change & Agriculture', 5, 'Medium', 'Climate Data'
where not exists (select 1 from public.quizzes where title = 'Climate Change & Agriculture');

insert into public.quizzes (id, title, questions_count, difficulty, nasa_topic)
select gen_random_uuid(), 'Precision Farming Technologies', 5, 'Hard', 'Remote Sensing'
where not exists (select 1 from public.quizzes where title = 'Precision Farming Technologies');

-- Seed a basic Bronze Quiz Master achievement (id created with code approach in migrations)
insert into public.achievements (id, name, description, icon, requirement_type, requirement_value)
select gen_random_uuid(), 'Bronze Quiz Master', 'Score >= 80% on any quiz', '🥉', 'quiz_score_threshold', 80
where not exists (select 1 from public.achievements where name = 'Bronze Quiz Master');

-- Soil Health Basics (5 questions)
insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'What does soil moisture primarily affect?', CAST('["Plant water availability","Wind speed","Solar activity","Snow cover"]' AS jsonb), 'Plant water availability', 'Moisture availability drives plant growth and stress tolerance.'
from public.quizzes q
where q.title = 'Soil Health Basics'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'What does soil moisture primarily affect?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which practice improves soil structure?', CAST('["Tillage","Heavy machinery","Adding organic matter","Over-irrigation"]' AS jsonb), 'Adding organic matter', 'Organic matter improves aggregation and porosity.'
from public.quizzes q
where q.title = 'Soil Health Basics'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which practice improves soil structure?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which nutrient is essential for root growth?', CAST('["Nitrogen","Phosphorus","Potassium","Calcium"]' AS jsonb), 'Phosphorus', 'Phosphorus supports roots and energy transfer (ATP).'
from public.quizzes q
where q.title = 'Soil Health Basics'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which nutrient is essential for root growth?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Cover crops help by…', CAST('["Increasing erosion","Reducing soil compaction","Reducing nutrient cycling","Improving infiltration"]' AS jsonb), 'Improving infiltration', 'Cover crops increase residue and enhance infiltration.'
from public.quizzes q
where q.title = 'Soil Health Basics'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Cover crops help by…');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Soil pH close to neutral is important because…', CAST('["It increases salinity","It optimizes nutrient availability","It removes all pathogens","It maximizes evaporation"]' AS jsonb), 'It optimizes nutrient availability', 'Most crops prefer near-neutral pH for nutrient uptake.'
from public.quizzes q
where q.title = 'Soil Health Basics'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Soil pH close to neutral is important because…');

-- Climate Change & Agriculture (same 5 questions used for demo)
insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'What does soil moisture primarily affect?', CAST('["Plant water availability","Wind speed","Solar activity","Snow cover"]' AS jsonb), 'Plant water availability', 'Moisture availability drives plant growth and stress tolerance.'
from public.quizzes q
where q.title = 'Climate Change & Agriculture'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'What does soil moisture primarily affect?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which practice improves soil structure?', CAST('["Tillage","Heavy machinery","Adding organic matter","Over-irrigation"]' AS jsonb), 'Adding organic matter', 'Organic matter improves aggregation and porosity.'
from public.quizzes q
where q.title = 'Climate Change & Agriculture'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which practice improves soil structure?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which nutrient is essential for root growth?', CAST('["Nitrogen","Phosphorus","Potassium","Calcium"]' AS jsonb), 'Phosphorus', 'Phosphorus supports roots and energy transfer (ATP).'
from public.quizzes q
where q.title = 'Climate Change & Agriculture'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which nutrient is essential for root growth?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Cover crops help by…', CAST('["Increasing erosion","Reducing soil compaction","Reducing nutrient cycling","Improving infiltration"]' AS jsonb), 'Improving infiltration', 'Cover crops increase residue and enhance infiltration.'
from public.quizzes q
where q.title = 'Climate Change & Agriculture'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Cover crops help by…');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Soil pH close to neutral is important because…', CAST('["It increases salinity","It optimizes nutrient availability","It removes all pathogens","It maximizes evaporation"]' AS jsonb), 'It optimizes nutrient availability', 'Most crops prefer near-neutral pH for nutrient uptake.'
from public.quizzes q
where q.title = 'Climate Change & Agriculture'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Soil pH close to neutral is important because…');

-- Precision Farming Technologies (same 5 questions used for demo)
insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'What does soil moisture primarily affect?', CAST('["Plant water availability","Wind speed","Solar activity","Snow cover"]' AS jsonb), 'Plant water availability', 'Moisture availability drives plant growth and stress tolerance.'
from public.quizzes q
where q.title = 'Precision Farming Technologies'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'What does soil moisture primarily affect?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which practice improves soil structure?', CAST('["Tillage","Heavy machinery","Adding organic matter","Over-irrigation"]' AS jsonb), 'Adding organic matter', 'Organic matter improves aggregation and porosity.'
from public.quizzes q
where q.title = 'Precision Farming Technologies'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which practice improves soil structure?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Which nutrient is essential for root growth?', CAST('["Nitrogen","Phosphorus","Potassium","Calcium"]' AS jsonb), 'Phosphorus', 'Phosphorus supports roots and energy transfer (ATP).'
from public.quizzes q
where q.title = 'Precision Farming Technologies'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Which nutrient is essential for root growth?');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Cover crops help by…', CAST('["Increasing erosion","Reducing soil compaction","Reducing nutrient cycling","Improving infiltration"]' AS jsonb), 'Improving infiltration', 'Cover crops increase residue and enhance infiltration.'
from public.quizzes q
where q.title = 'Precision Farming Technologies'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Cover crops help by…');

insert into public.quiz_questions (quiz_id, question, options, correct_answer, explanation)
select q.id, 'Soil pH close to neutral is important because…', CAST('["It increases salinity","It optimizes nutrient availability","It removes all pathogens","It maximizes evaporation"]' AS jsonb), 'It optimizes nutrient availability', 'Most crops prefer near-neutral pH for nutrient uptake.'
from public.quizzes q
where q.title = 'Precision Farming Technologies'
and not exists (select 1 from public.quiz_questions qq where qq.quiz_id = q.id and qq.question = 'Soil pH close to neutral is important because…');

-- Legacy bulk insert blocks removed; explicit inserts above handle seeding
