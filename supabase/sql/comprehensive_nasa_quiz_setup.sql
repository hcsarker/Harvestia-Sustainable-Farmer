-- Comprehensive NASA Data Quiz Setup for Harvestia
-- Based on actual NASA data features in the app: MODIS, SMAP, GPM, NASA POWER
-- These questions help farmers learn practical NASA data applications

-- Clear existing NASA quizzes if any
DELETE FROM public.quiz_questions WHERE quiz_id LIKE 'nasa-%';
DELETE FROM public.quizzes WHERE id LIKE 'nasa-%';

-- Quiz 1: NASA Data Basics for Farmers
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-basics', 'NASA Data Basics for Smart Farming', 'Easy', 'NASA Earth Data Introduction', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('nasa-basics', 'কোন NASA satellite থেকে soil moisture data পাওয়া যায়?',
 '["MODIS", "SMAP", "Landsat", "GOES"]',
 'SMAP',
 'SMAP (Soil Moisture Active Passive) satellite মাটির আর্দ্রতা পরিমাপ করে যা irrigation planning এর জন্য খুব গুরুত্বপূর্ণ।'),

('nasa-basics', 'NDVI কী পরিমাপ করে?',
 '["মাটির তাপমাত্রা", "গাছের স্বাস্থ্য ও বৃদ্ধি", "বৃষ্টিপাতের পরিমাণ", "বাতাসের গতি"]',
 'গাছের স্বাস্থ্য ও বৃদ্ধি',
 'NDVI (Normalized Difference Vegetation Index) গাছের স্বাস্থ্য, পাতার ঘনত্ব এবং সবুজ অংশের পরিমাণ দেখায়।'),

('nasa-basics', 'GPM satellite কী ধরনের data প্রদান করে?',
 '["সূর্যের আলো", "বৃষ্টিপাত ও precipitation", "মাটির pH", "কীটপতঙ্গের সংখ্যা"]',
 'বৃষ্টিপাত ও precipitation',
 'GPM (Global Precipitation Measurement) সারা বিশ্বে বৃষ্টিপাতের পরিমাণ পরিমাপ করে প্রতি ৩ ঘন্টায়।'),

('nasa-basics', 'NASA POWER থেকে কোন weather data পাওয়া যায়?',
 '["শুধু তাপমাত্রা", "তাপমাত্রা, আর্দ্রতা, সৌর বিকিরণ, বাতাস", "শুধু বৃষ্টি", "শুধু মেঘ"]',
 'তাপমাত্রা, আর্দ্রতা, সৌর বিকিরণ, বাতাস',
 'NASA POWER comprehensive weather data প্রদান করে যা crop planning এবং daily farm management এর জন্য প্রয়োজনীয়।');

-- Quiz 2: Practical NASA Data Applications
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-practical', 'Practical NASA Data for Daily Farming', 'Medium', 'Farm Application', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('nasa-practical', 'কখন irrigation করবেন SMAP soil moisture data দেখে?',
 '["যখন soil moisture 50% এর উপরে", "যখন soil moisture 20% এর নিচে", "সবসময়", "কখনোই না"]',
 'যখন soil moisture 20% এর নিচে',
 'SMAP data যখন soil moisture 20% এর নিচে দেখায় তখন গাছের জন্য পানির অভাব, তাই irrigation প্রয়োজন।'),

('nasa-practical', 'MODIS NDVI data কীভাবে crop health monitor করতে সাহায্য করে?',
 '["শুধু একদিনের data যথেষ্ট", "সময়ের সাথে NDVI changes দেখে", "শুধু harvest এর সময়", "শুধু রোপণের সময়"]',
 'সময়ের সাথে NDVI changes দেখে',
 'নিয়মিত NDVI monitoring করলে crop growth pattern, stress, disease বা পুষ্টির অভাব চিনতে পারি।'),

('nasa-practical', 'GPM precipitation data দিয়ে কী সিদ্ধান্ত নিতে পারেন?',
 '["শুধু আগামীকালের আবহাওয়া", "Irrigation scheduling ও fertilizer application timing", "শুধু বীজ বপন", "শুধু harvest timing"]',
 'Irrigation scheduling ও fertilizer application timing',
 'Recent rainfall data দেখে irrigation এর প্রয়োজন আছে কিনা এবং fertilizer কখন দিতে হবে তা ঠিক করতে পারি।'),

('nasa-practical', 'কোন NASA data combination irrigation এর জন্য সবচেয়ে কার্যকর?',
 '["শুধু NDVI", "SMAP soil moisture + GPM rainfall + weather forecast", "শুধু temperature", "শুধু cloud cover"]',
 'SMAP soil moisture + GPM rainfall + weather forecast',
 'Soil moisture (বর্তমান অবস্থা), recent rainfall (সাম্প্রতিক পানি), এবং weather forecast (আগামী পরিকল্পনা) একসাথে দেখে সঠিক irrigation decision নেওয়া যায়।');

-- Quiz 3: Advanced NASA Data Integration
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-advanced', 'Advanced NASA Data Integration', 'Hard', 'Data Integration & Analysis', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('nasa-advanced', 'NDVI time series analysis কীভাবে crop yield prediction এ সাহায্য করে?',
 '["একদিনের NDVI যথেষ্ট", "পুরো growing season এর NDVI pattern দেখে", "শুধু সর্বোচ্চ NDVI value", "শুধু সর্বনিম্ন NDVI value"]',
 'পুরো growing season এর NDVI pattern দেখে',
 'Growing season জুড়ে NDVI এর pattern, peak values, এবং decline rate দেখে crop health ও expected yield estimate করা যায়।'),

('nasa-advanced', 'Drought detection এর জন্য কোন NASA data combination সবচেয়ে কার্যকর?',
 '["শুধু temperature", "SMAP soil moisture + GPM precipitation + temperature trends", "শুধু NDVI", "শুধু cloud data"]',
 'SMAP soil moisture + GPM precipitation + temperature trends',
 'Drought detection এর জন্য soil moisture deficit, low precipitation, এবং high temperature একসাথে analyze করতে হয়।'),

('nasa-advanced', 'কীভাবে NASA data দিয়ে fertilizer application optimize করবেন?',
 '["Random timing এ", "NDVI কম area গুলোতে বেশি fertilizer + soil moisture check", "সর্বত্র সমান", "শুধু বৃষ্টির পর"]',
 'NDVI কম area গুলোতে বেশি fertilizer + soil moisture check',
 'NDVI কম এলাকায় nutrients এর অভাব থাকতে পারে, এবং soil moisture যথেষ্ট থাকলে fertilizer absorption ভাল হয়।'),

('nasa-advanced', 'Crop stress early detection এর জন্য কোন approach সবচেয়ে ভাল?',
 '["শুধু visual inspection", "NDVI anomaly detection + soil moisture monitoring", "শুধু weather data", "শুধু historical data"]',
 'NDVI anomaly detection + soil moisture monitoring',
 'Normal NDVI pattern থেকে deviation এবং soil moisture deficit একসাথে দেখলে drought, disease, বা pest stress early detect করা যায়।');

-- Quiz 4: Seasonal Planning with NASA Data
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count, attempts_allowed) VALUES
('nasa-seasonal', 'Seasonal Crop Planning with NASA Data', 'Medium', 'Seasonal Planning', 0, 3);

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES
('nasa-seasonal', 'বর্ষা season এ কোন NASA data সবচেয়ে গুরুত্বপূর্ণ?',
 '["শুধু temperature", "GPM precipitation + soil moisture monitoring", "শুধু NDVI", "শুধু wind data"]',
 'GPM precipitation + soil moisture monitoring',
 'বর্ষায় excessive rainfall এবং waterlogging এড়াতে precipitation ও soil moisture একসাথে monitor করা জরুরি।'),

('nasa-seasonal', 'শুকনো মৌসুমে crop planning এর জন্য কী করবেন?',
 '["কিছু করার নেই", "Historical precipitation + soil moisture data analysis", "শুধু আবহাওয়ার খবর দেখা", "শুধু পানি সংগ্রহ"]',
 'Historical precipitation + soil moisture data analysis',
 'Past years এর precipitation pattern ও soil moisture trends দেখে drought resistant crops select করা এবং irrigation planning করা যায়।'),

('nasa-seasonal', 'নতুন ক্ষেত select করার সময় NASA data কীভাবে সাহায্য করে?',
 '["শুধু location দেখে", "Historical NDVI, soil moisture, precipitation patterns analysis", "শুধু বর্তমান weather", "শুধু market price"]',
 'Historical NDVI, soil moisture, precipitation patterns analysis',
 'কোন জমিতে আগে কেমন crop performance ছিল, water availability কেমন, এবং climate pattern analysis করে জমি selection করা যায়।'),

('nasa-seasonal', 'Climate change adaptation এর জন্য NASA data কীভাবে ব্যবহার করবেন?',
 '["শুধু current data", "Long-term trends analysis + adaptation strategies", "শুধু temperature data", "কোনো planning নেই"]',
 'Long-term trends analysis + adaptation strategies',
 'বছরের পর বছরের temperature, precipitation, এবং extreme weather patterns দেখে climate resilient farming practices adopt করা যায়।');

-- Update question counts for all quizzes
UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-basics'
) WHERE id = 'nasa-basics';

UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-practical'
) WHERE id = 'nasa-practical';

UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-advanced'
) WHERE id = 'nasa-advanced';

UPDATE public.quizzes SET questions_count = (
    SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-seasonal'
) WHERE id = 'nasa-seasonal';

-- Display success message
SELECT 
    'NASA Quiz Setup Complete!' as status,
    COUNT(DISTINCT quiz_id) as total_quizzes_created,
    COUNT(*) as total_questions_added
FROM public.quiz_questions WHERE quiz_id LIKE 'nasa-%';