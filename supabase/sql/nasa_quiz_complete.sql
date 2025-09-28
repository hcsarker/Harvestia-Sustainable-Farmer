-- NASA Data Integration Quiz Questions 
-- Run this in Supabase SQL Editor to add NASA-focused quizzes

-- Clean up existing NASA quizzes
DELETE FROM public.quiz_questions 
WHERE quiz_id LIKE '%nasa%' OR quiz_id LIKE '%harvestia%' OR quiz_id LIKE '%farming%';

DELETE FROM public.quizzes 
WHERE id LIKE '%nasa%' OR id LIKE '%harvestia%' OR id LIKE '%farming%';

-- Create NASA Satellite Data Quiz 
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) VALUES ('nasa-satellite-data', 'NASA Satellite Data for Agriculture', 'Medium', 'Satellite Remote Sensing', 0);

-- Add NASA satellite data questions 
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES 
('nasa-satellite-data', 'What does NDVI (Normalized Difference Vegetation Index) measure?', '["Soil temperature", "Plant health and biomass", "Water content in soil", "Air humidity"]', 'Plant health and biomass', 'NDVI uses near-infrared and visible red light reflectance to assess vegetation health. Higher NDVI values indicate healthier, denser vegetation.'),

('nasa-satellite-data', 'Which NASA satellite program provides soil moisture data?', '["LANDSAT", "MODIS", "SMAP", "GOES"]', 'SMAP', 'SMAP (Soil Moisture Active Passive) is specifically designed to measure soil moisture from space using L-band radar and radiometer.'),

('nasa-satellite-data', 'What is the typical spatial resolution of MODIS NDVI data?', '["1 meter", "10 meters", "250 meters", "1 kilometer"]', '250 meters', 'MODIS NDVI products are available at 250m spatial resolution, making them suitable for regional agricultural monitoring.'),

('nasa-satellite-data', 'GPM (Global Precipitation Measurement) provides data on:', '["Soil temperature", "Rainfall and precipitation", "Wind speed", "Solar radiation"]', 'Rainfall and precipitation', 'GPM is a joint NASA-JAXA mission that provides global precipitation measurements every 3 hours.'),

('nasa-satellite-data', 'Which spectral bands are most useful for crop monitoring?', '["Visible blue and green", "Near-infrared and red", "Thermal infrared only", "Microwave bands only"]', 'Near-infrared and red', 'The combination of near-infrared (NIR) and red bands is fundamental for vegetation indices like NDVI, as healthy plants reflect NIR strongly and absorb red light.');

-- Create Climate Data Quiz 
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) VALUES ('nasa-climate-data', 'NASA Climate Data for Farming', 'Hard', 'Climate Science', 0);

-- Add climate data questions 
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES 
('nasa-climate-data', 'NASA POWER provides which agricultural parameters?', '["Only temperature data", "Solar radiation, temperature, and humidity", "Only precipitation data", "Only wind data"]', 'Solar radiation, temperature, and humidity', 'NASA POWER (Prediction of Worldwide Energy Resources) provides comprehensive meteorological data including solar radiation, temperature, humidity, wind speed, and precipitation for agricultural applications.'),

('nasa-climate-data', 'What does the SMAP L4 product provide for agriculture?', '["Only surface temperature", "Root zone soil moisture", "Crop yield predictions", "Pest population data"]', 'Root zone soil moisture', 'SMAP Level 4 provides root zone soil moisture estimates (0-100cm depth) which is crucial for understanding water availability to crops.'),

('nasa-climate-data', 'Which NASA dataset helps predict drought conditions?', '["MODIS Land Surface Temperature", "Palmer Drought Severity Index from GLDAS", "Landsat true color images", "GOES cloud cover"]', 'Palmer Drought Severity Index from GLDAS', 'NASA GLDAS (Global Land Data Assimilation System) provides the Palmer Drought Severity Index, which combines precipitation, temperature, and soil moisture to assess drought conditions.'),

('nasa-climate-data', 'How often does NASA GPM provide global precipitation data?', '["Once per day", "Every 3 hours", "Once per week", "Once per month"]', 'Every 3 hours', 'GPM Core Observatory provides precipitation measurements approximately every 3 hours, enabling near real-time monitoring of rainfall patterns globally.'),

('nasa-climate-data', 'What is the advantage of using NASA Earth data for precision agriculture?', '["Only provides historical data", "Combines multiple satellite sensors for comprehensive monitoring", "Only works for large farms", "Requires expensive equipment"]', 'Combines multiple satellite sensors for comprehensive monitoring', 'NASA Earth data integrates information from multiple satellites (MODIS, SMAP, GPM, Landsat) to provide comprehensive monitoring of vegetation, soil moisture, weather, and climate patterns essential for precision agriculture.');

-- Update question counts 
UPDATE public.quizzes SET questions_count = ( SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-satellite-data' ) WHERE id = 'nasa-satellite-data';

UPDATE public.quizzes SET questions_count = ( SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-climate-data' ) WHERE id = 'nasa-climate-data';

-- Create Advanced NASA Applications Quiz 
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) VALUES ('nasa-advanced-apps', 'Advanced NASA Data Applications', 'Hard', 'Data Integration', 0);

-- Add advanced application questions 
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES 
('nasa-advanced-apps', 'How can MODIS NDVI time series help farmers?', '["Only shows current conditions", "Tracks crop growth patterns and predicts harvest timing", "Only useful for weather forecasting", "Measures soil pH levels"]', 'Tracks crop growth patterns and predicts harvest timing', 'MODIS NDVI time series analysis reveals crop phenology patterns, growth stages, and can help predict optimal harvest timing by tracking vegetation development throughout the growing season.'),

('nasa-advanced-apps', 'Which combination of NASA data is best for irrigation scheduling?', '["NDVI only", "SMAP soil moisture + GPM precipitation + weather forecasts", "Temperature data only", "Cloud cover only"]', 'SMAP soil moisture + GPM precipitation + weather forecasts', 'Effective irrigation scheduling requires soil moisture status (SMAP), recent precipitation (GPM), and weather forecasts to determine when and how much to irrigate.'),

('nasa-advanced-apps', 'What does anomaly detection in NDVI time series reveal?', '["Normal crop growth only", "Stress conditions like drought, disease, or pest damage", "Soil composition", "Market prices"]', 'Stress conditions like drought, disease, or pest damage', 'NDVI anomalies (deviations from normal patterns) can indicate various stress factors including drought stress, nutrient deficiency, disease outbreaks, or pest damage, enabling early intervention.'),

('nasa-advanced-apps', 'How can NASA data support crop yield prediction?', '["Single NDVI measurement is sufficient", "Combining NDVI trends, weather data, and soil moisture throughout growing season", "Only soil temperature is needed", "Market data alone"]', 'Combining NDVI trends, weather data, and soil moisture throughout growing season', 'Accurate yield prediction requires integrating multiple NASA datasets: NDVI for vegetation condition, meteorological data for growing conditions, and soil moisture for water stress assessment throughout the entire growing season.'),

('nasa-advanced-apps', 'What is the benefit of using NASA data for sustainable agriculture?', '["Increases pesticide use", "Optimizes resource use and reduces environmental impact", "Only increases profits", "Eliminates need for field monitoring"]', 'Optimizes resource use and reduces environmental impact', 'NASA Earth observation data enables precision agriculture practices that optimize water, fertilizer, and pesticide use, reducing environmental impact while maintaining or improving yields through data-driven decision making.');

-- Update question count for advanced applications quiz 
UPDATE public.quizzes SET questions_count = ( SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-advanced-apps' ) WHERE id = 'nasa-advanced-apps';

-- Create Practical NASA Farming Quiz
INSERT INTO public.quizzes (id, title, difficulty, nasa_topic, questions_count) VALUES ('nasa-practical-farming', 'Practical NASA Data for Farmers', 'Easy', 'Farm Management', 0);

-- Add practical farming questions 
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation) VALUES 
('nasa-practical-farming', 'When should farmers irrigate based on SMAP soil moisture data?', '["When soil moisture is above 50%", "When soil moisture drops below 20%", "Always irrigate daily", "Never use satellite data"]', 'When soil moisture drops below 20%', 'SMAP data shows when soil moisture falls below 20%, indicating the optimal time to irrigate to prevent crop stress and save water.'),

('nasa-practical-farming', 'How can NDVI help detect crop diseases early?', '["NDVI cannot detect diseases", "Lower NDVI values in specific areas indicate potential disease", "Only shows healthy crops", "Only useful for harvest timing"]', 'Lower NDVI values in specific areas indicate potential disease', 'Sudden drops in NDVI can signal disease outbreaks, nutrient deficiencies, or pest damage, allowing farmers to investigate and treat affected areas early.'),

('nasa-practical-farming', 'What weather data from NASA POWER helps with pest management?', '["Only temperature", "Humidity and temperature combinations", "Only wind speed", "Only solar radiation"]', 'Humidity and temperature combinations', 'High humidity combined with specific temperatures creates favorable conditions for fungal diseases and pest reproduction, helping farmers time preventive treatments.'),

('nasa-practical-farming', 'How can GPM precipitation data improve fertilizer application?', '["Prevents fertilizer application", "Helps time fertilizer application after rainfall", "Only shows drought conditions", "Only useful for irrigation"]', 'Helps time fertilizer application after rainfall', 'GPM data shows recent rainfall patterns, helping farmers apply fertilizers when soil moisture is adequate for nutrient uptake and avoiding runoff during heavy rains.'),

('nasa-practical-farming', 'What is the main benefit of using NASA satellite data for small farms?', '["Too expensive for small farms", "Provides free, comprehensive field monitoring", "Only useful for large farms", "Requires special equipment"]', 'Provides free, comprehensive field monitoring', 'NASA data is free and provides complete field coverage, helping small farmers monitor their entire farm without expensive equipment or manual scouting.'),

('nasa-practical-farming', 'How often should farmers check NASA SMAP soil moisture data?', '["Once per year", "Weekly during growing season", "Only during drought", "Never, use local sensors only"]', 'Weekly during growing season', 'Checking SMAP data weekly during the growing season helps farmers track soil moisture trends and make timely irrigation decisions.'),

('nasa-practical-farming', 'Which NASA data combination helps predict harvest timing?', '["Soil moisture only", "NDVI trends + weather forecasts", "Precipitation only", "Temperature only"]', 'NDVI trends + weather forecasts', 'NDVI shows crop maturity stages, while weather forecasts help plan harvest timing to avoid rain damage and optimize crop quality and storage.'),

('nasa-practical-farming', 'How can NASA data reduce pesticide use?', '["Increases pesticide use", "Targeted application based on stress detection", "Eliminates pesticides entirely", "Only for organic farming"]', 'Targeted application based on stress detection', 'NASA data identifies specific stressed areas, allowing farmers to apply pesticides only where needed, reducing overall chemical use and environmental impact.'),

('nasa-practical-farming', 'What NASA data helps with drought preparedness?', '["Only current weather", "Soil moisture trends + precipitation forecasts", "Only historical data", "Only temperature data"]', 'Soil moisture trends + precipitation forecasts', 'Monitoring declining soil moisture combined with precipitation forecasts gives early warning of drought conditions, allowing farmers to adjust irrigation and crop management.'),

('nasa-practical-farming', 'How can farmers access NASA data without internet?', '["Cannot access without internet", "Download data in advance for offline use", "Only through paid services", "Only in urban areas"]', 'Download data in advance for offline use', 'Farmers can download NASA data when internet is available and use it offline in farm management apps, crucial for remote farming areas with poor connectivity.');

-- Update question count for practical farming quiz 
UPDATE public.quizzes SET questions_count = ( SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = 'nasa-practical-farming' ) WHERE id = 'nasa-practical-farming';

-- Success message 
SELECT 'NASA-focused quiz questions created successfully!' as result, (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id LIKE 'nasa%') as total_questions_added;
