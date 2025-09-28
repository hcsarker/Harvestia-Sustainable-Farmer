-- Complete NASA Data Quiz Setup for Harvestia
-- This script creates comprehensive NASA data quizzes for farmers

-- Clean up existing NASA quizzes (if needed)
DELETE FROM public.quiz_questions WHERE quiz_id LIKE '%nasa%' OR quiz_id LIKE '%harvestia%' OR quiz_id LIKE '%farming%';
DELETE FROM public.quizzes WHERE id LIKE '%nasa%' OR id LIKE '%harvestia%' OR id LIKE '%farming%';

-- ========================================
-- 1. BASIC NASA DATA UNDERSTANDING QUIZ
-- ========================================
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-basics', 'NASA Data বেসিক ধারণা', 'Easy', 'Introduction', 0, 5);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, nasa_data_reference) VALUES
('nasa-basics', 'NASA কী ধরনের data প্রদান করে যা চাষাবাদে কাজে লাগে?',
 '["শুধু আবহাওয়ার তথ্য", "Satellite থেকে মাটি, ফসল, আবহাওয়া ও পানির তথ্য", "শুধু temperature data", "কোনো farming data নেই"]',
 'Satellite থেকে মাটি, ফসল, আবহাওয়া ও পানির তথ্য',
 'NASA এর satellite গুলো space থেকে পৃথিবীর ছবি তুলে মাটির আর্দ্রতা, ফসলের স্বাস্থ্য, বৃষ্টিপাত, তাপমাত্রা সব measure করে।',
 '{"nasa_services": ["soil_monitoring", "crop_health", "weather", "precipitation"], "technology": "satellite_remote_sensing"}'),

('nasa-basics', 'কেন NASA data চাষাবাদের জন্য গুরুত্বপূর্ণ?',
 '["শুধু research এর জন্য", "Free এবং accurate data যা farming decisions এ সাহায্য করে", "শুধু বড় company দের জন্য", "কোনো কাজে লাগে না"]',
 'Free এবং accurate data যা farming decisions এ সাহায্য করে',
 'NASA data সম্পূর্ণ বিনামূল্যে এবং খুবই নির্ভুল। এটা দিয়ে farmers রা সেচ, সার, ফসল কাটার সময় ইত্যাদি সঠিক সিদ্ধান্ত নিতে পারেন।',
 '{"benefits": ["free_access", "high_accuracy", "decision_support"], "applications": ["irrigation", "fertilization", "harvest_timing"]}'),

('nasa-basics', 'বাংলাদেশের মতো ছোট দেশেও কি NASA satellite data পাওয়া যায়?',
 '["না, শুধু বড় দেশের জন্য", "হ্যাঁ, সারা পৃথিবীর জন্য available", "শুধু America এর জন্য", "শুধু ocean এর জন্য"]',
 'হ্যাঁ, সারা পৃথিবীর জন্য available',
 'NASA satellite গুলো সারা পৃথিবী cover করে। বাংলাদেশের যেকোনো জায়গার data পাওয়া যায় বিনামূল্যে।',
 '{"global_coverage": true, "bangladesh_included": true, "accessibility": "free_worldwide"}');

-- ========================================
-- 2. HARVESTIA APP NASA FEATURES QUIZ  
-- ========================================
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('harvestia-nasa', 'Harvestia App এ NASA Data', 'Easy', 'App Features', 0, 5);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, nasa_data_reference) VALUES
('harvestia-nasa', 'Harvestia Dashboard এ কোন NASA data দেখতে পাবেন?',
 '["কোনো NASA data নেই", "NDVI chart, soil moisture, precipitation", "শুধু temperature", "শুধু weather forecast"]',
 'NDVI chart, soil moisture, precipitation',
 'Harvestia Dashboard এ NASA MODIS NDVI, SMAP soil moisture, এবং GPM precipitation data real-time দেখানো হয়।',
 '{"dashboard_data": ["MODIS_NDVI", "SMAP_soil_moisture", "GPM_precipitation"]}'),

('harvestia-nasa', 'Agricultural Simulation এ location select করলে কী হয়?',
 '["কিছু হয় না", "সেই এলাকার actual NASA data দিয়ে simulation চলে", "fake data ব্যবহার হয়", "শুধু map দেখায়"]',
 'সেই এলাকার actual NASA data দিয়ে simulation চলে',
 'যে location select করবেন সেখানের real NASA satellite data দিয়ে realistic farming simulation হয়।',
 '{"simulation_feature": "location_specific_NASA_data", "realism": "actual_satellite_data"}'),

('harvestia-nasa', 'Weather section এ কোন NASA data পাবেন?',
 '["শুধু local weather", "NASA POWER + GPM data", "কোনো NASA data নেই", "শুধু temperature"]',
 'NASA POWER + GPM data',
 'Weather section এ NASA POWER meteorological data এবং GPM precipitation data একসাথে দেখানো হয়।',
 '{"weather_integration": ["NASA_POWER_meteorology", "GPM_precipitation"]}');

-- ========================================
-- 3. PRACTICAL NASA DATA APPLICATION
-- ========================================
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('practical-nasa', 'বাস্তব NASA Data প্রয়োগ', 'Medium', 'Practical Use', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, nasa_data_reference) VALUES
('practical-nasa', 'আপনার ধানের জমির NDVI 0.3 দেখাচ্ছে। কী করবেন?',
 '["কিছু করবো না", "সেচ ও সার দেবো কারণ এটা কম", "খুব ভালো", "বুঝি না"]',
 'সেচ ও সার দেবো কারণ এটা কম',
 'NDVI 0.3 মানে vegetation health খারাপ। সুস্থ ধানের NDVI 0.6-0.8 হয়। তাই সেচ/সার দিতে হবে।',
 '{"crop": "rice", "NDVI_poor": "<0.4", "NDVI_healthy": "0.6-0.8", "action": "irrigation_fertilization"}'),

('practical-nasa', 'Soil moisture 15% এবং 3 দিন বৃষ্টি নেই। কী করবেন?',
 '["অপেক্ষা করবো", "তাৎক্ষণিক সেচ দেবো", "কিছু করবো না", "বুঝতে পারছি না"]',
 'তাৎক্ষণিক সেচ দেবো',
 '15% soil moisture খুব কম (আদর্শ 25-35%)। তাৎক্ষণিক সেচ না দিলে ফসল মরে যাবে।',
 '{"soil_moisture_critical": "15%", "ideal": "25-35%", "urgency": "immediate_irrigation"}'),

('practical-nasa', 'GPM data বলছে 2 দিনে 20mm বৃষ্টি। কী করবেন?',
 '["সার ও spray করবো", "সার/spray postpone করবো", "আরো সেচ দেবো", "কিছু করবো না"]',
 'সার/spray postpone করবো',
 '20mm বৃষ্টিতে সার ধুয়ে যাবে, spray কাজ করবে না। বৃষ্টির পর করাই ভালো।',
 '{"precipitation_forecast": "20mm", "decision": "postpone_inputs", "reason": "washoff_prevention"}'),

('practical-nasa', 'NDVI trend 2 সপ্তাহ ধরে কমছে। সম্ভাব্য কারণ কী?',
 '["কোনো সমস্যা নেই", "পানির অভাব, পোকা বা রোগ", "এটা normal", "বুঝি না"]',
 'পানির অভাব, পোকা বা রোগ',
 'NDVI ক্রমাগত কমা মানে vegetation health খারাপ হচ্ছে। কারণ হতে পারে drought, pest বা disease।',
 '{"trend": "declining_NDVI", "causes": ["water_stress", "pest_attack", "disease"], "investigation": "required"}');

-- ========================================
-- 4. NASA DATA INTERPRETATION QUIZ
-- ========================================
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-interpretation', 'NASA Data বিশ্লেষণ', 'Hard', 'Data Analysis', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, nasa_data_reference) VALUES
('nasa-interpretation', 'NDVI map এ সবুজ, হলুদ, লাল রঙের মানে কী?',
 '["সব একই", "সবুজ=সুস্থ, হলুদ=মাঝারি, লাল=খারাপ", "রঙের মানে নেই", "শুধু decoration"]',
 'সবুজ=সুস্থ, হলুদ=মাঝারি, লাল=খারাপ',
 'NDVI color coding: সবুজ (>0.6) = সুস্থ, হলুদ (0.3-0.6) = মাঝারি, লাল (<0.3) = খারাপ vegetation।',
 '{"color_coding": {"green": ">0.6_healthy", "yellow": "0.3-0.6_moderate", "red": "<0.3_poor"}}'),

('nasa-interpretation', 'Humidity 90% দেখাচ্ছে। কী সমস্যা হতে পারে?',
 '["কোনো সমস্যা নেই", "Fungal disease এর ঝুঁকি", "খুব ভালো", "humidity কোনো effect করে না"]',
 'Fungal disease এর ঝুঁকি',
 '90% humidity খুব বেশি। এতে fungal spores বেশি বাড়ে, তাই blast, blight ইত্যাদি রোগের ঝুঁকি বাড়ে।',
 '{"humidity_high": "90%", "risk": "fungal_diseases", "prevention": "fungicide_spray"}'),

('nasa-interpretation', 'Winter এ গমের NDVI 0.4। এটা কি চিন্তার বিষয়?',
 '["হ্যাঁ, খুব খারাপ", "না, winter এ এটা normal", "বুঝতে পারছি না", "season এর effect নেই"]',
 'না, winter এ এটা normal',
 'Winter এ গমের growth slow, তাই NDVI 0.4-0.5 normal। Spring এ বাড়বে।',
 '{"seasonal_crop": "winter_wheat", "normal_NDVI": "0.4-0.5", "peak_season": "spring"}'),

('nasa-interpretation', 'NDVI=0.8, Soil Moisture=40%, Temperature=35°C। সামগ্রিক অবস্থা?',
 '["সব perfect", "NDVI ভালো কিন্তু temperature বেশি", "সব খারাপ", "শুধু temp দেখলেই হবে"]',
 'NDVI ভালো কিন্তু temperature বেশি',
 'NDVI 0.8 চমৎকার, soil moisture 40% যথেষ্ট, কিন্তু 35°C তাপমাত্রা বেশি - heat stress হতে পারে।',
 '{"analysis": {"NDVI": "excellent", "moisture": "adequate", "temp": "heat_stress_risk"}}');

-- ========================================
-- 5. ADVANCED NASA APPLICATIONS
-- ========================================
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-advanced', 'উন্নত NASA Data ব্যবহার', 'Hard', 'Advanced Techniques', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, nasa_data_reference) VALUES
('nasa-advanced', 'বিভিন্ন ফসলের জন্য NDVI threshold আলাদা কেন?',
 '["সব ফসল একই", "প্রতি ফসলের growth pattern আলাদা", "কোনো difference নেই", "জানি না"]',
 'প্রতি ফসলের growth pattern আলাদা',
 'ধান, গম, ভুট্টা - প্রতি ফসলের leaf structure ও growth rate আলাদা, তাই NDVI threshold ও আলাদা।',
 '{"crop_specific": "different_thresholds", "factors": ["leaf_structure", "growth_pattern"]}'),

('nasa-advanced', 'Variable Rate Application কী?',
 '["সব জায়গায় সমান সার", "NDVI অনুযায়ী আলাদা পরিমাণ সার", "কোনো সার না", "অনুমানে সার"]',
 'NDVI অনুযায়ী আলাদা পরিমাণ সার',
 'NDVI map দেখে জমির যে অংশে কম সুস্থ গাছ সেখানে বেশি সার, যেখানে ভালো সেখানে কম সার দেওয়া।',
 '{"precision_ag": "variable_rate_fertilization", "basis": "NDVI_mapping"}'),

('nasa-advanced', 'Climate change এর জন্য NASA long-term data কীভাবে ব্যবহার করবেন?',
 '["এক বছরের data যথেষ্ট", "20+ বছরের trends দেখে adaptation planning", "কোনো planning নেই", "traditional method follow"]',
 '20+ বছরের trends দেখে adaptation planning',
 'Climate change বুঝতে ২০+ বছরের precipitation ও temperature trends analyze করে crop selection ও farming practices adjust করতে হবে।',
 '{"climate_adaptation": "long_term_analysis", "timeframe": "20+_years", "application": "adaptive_farming"}');

-- Update question counts for all quizzes
UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = quizzes.id
) WHERE id IN ('nasa-basics', 'harvestia-nasa', 'practical-nasa', 'nasa-interpretation', 'nasa-advanced');

-- Success message with summary
SELECT 
    'NASA Data Quiz System Setup Complete!' as message,
    (SELECT COUNT(*) FROM public.quizzes WHERE id LIKE '%nasa%') as total_quizzes,
    (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id LIKE '%nasa%') as total_questions,
    'Farmers can now learn NASA data applications!' as note;