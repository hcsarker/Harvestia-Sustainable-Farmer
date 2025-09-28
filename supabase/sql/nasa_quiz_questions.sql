-- NASA Data Integration Quiz Questions
-- Run this in Supabase SQL Editor to add NASA-focused quizzes

-- Create NASA Satellite Data Quiz
insert into public.quizzes (
   id,
   title,
   difficulty,
   nasa_topic,
   questions_count,
   attempts_allowed
) values ( 'nasa-satellite-data',
           'NASA Satellite Data for Agriculture',
           'Medium',
           'Satellite Remote Sensing',
           0,
           3 );

-- Add NASA satellite data questions
insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation,
   nasa_data_reference
) values ( 'nasa-satellite-data',
           'What does NDVI (Normalized Difference Vegetation Index) measure?',
           '["Soil temperature", "Plant health and biomass", "Water content in soil", "Air humidity"]',
           'Plant health and biomass',
           'NDVI uses near-infrared and visible red light reflectance to assess vegetation health. Higher NDVI values indicate healthier, denser vegetation.'
           ,
           '{"source": "MODIS", "bands": ["NIR", "Red"], "formula": "(NIR - Red) / (NIR + Red)"}' ),( 'nasa-satellite-data',
                                                                                                      'Which NASA satellite program provides soil moisture data?'
                                                                                                      ,
                                                                                                      '["LANDSAT", "MODIS", "SMAP", "GOES"]'
                                                                                                      ,
                                                                                                      'SMAP',
                                                                                                      'SMAP (Soil Moisture Active Passive) is specifically designed to measure soil moisture from space using L-band radar and radiometer.'
                                                                                                      ,
                                                                                                      '{"source": "SMAP", "frequency": "1.4 GHz", "penetration_depth": "5cm"}'
                                                                                                      ),( 'nasa-satellite-data'
                                                                                                      ,
                                                                                                                                                                               'What is the typical spatial resolution of MODIS NDVI data?'
                                                                                                                                                                               ,
                                                                                                                                                                               '["1 meter", "10 meters", "250 meters", "1 kilometer"]'
                                                                                                                                                                               ,
                                                                                                                                                                               '250 meters'
                                                                                                                                                                               ,
                                                                                                                                                                               'MODIS NDVI products are available at 250m spatial resolution, making them suitable for regional agricultural monitoring.'
                                                                                                                                                                               ,
                                                                                                                                                                               '{"source": "MODIS", "product": "MOD13Q1", "resolution": "250m", "temporal": "16-day"}'
                                                                                                                                                                               )
                                                                                                                                                                               ,
                                                                                                                                                                               (
                                                                                                                                                                               'nasa-satellite-data'
                                                                                                                                                                               ,
                                                                                                                                                                                                                                                                       'GPM (Global Precipitation Measurement) provides data on:'
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                       '["Soil temperature", "Rainfall and precipitation", "Wind speed", "Solar radiation"]'
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                       'Rainfall and precipitation'
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                       'GPM is a joint NASA-JAXA mission that provides global precipitation measurements every 3 hours.'
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                       '{"source": "GPM", "temporal_resolution": "3 hours", "coverage": "65°N to 65°S"}'
                                                                                                                                                                                                                                                                       )
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                       (
                                                                                                                                                                                                                                                                       'nasa-satellite-data'
                                                                                                                                                                                                                                                                       ,
                                                                                                                                                                                                                                                                                                                                                         'Which spectral bands are most useful for crop monitoring?'
                                                                                                                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                                                                                                                         '["Visible blue and green", "Near-infrared and red", "Thermal infrared only", "Microwave bands only"]'
                                                                                                                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                                                                                                                         'Near-infrared and red'
                                                                                                                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                                                                                                                         'The combination of near-infrared (NIR) and red bands is fundamental for vegetation indices like NDVI, as healthy plants reflect NIR strongly and absorb red light.'
                                                                                                                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                                                                                                                         '{"bands": {"red": "620-750nm", "NIR": "750-1400nm"}, "applications": ["NDVI", "EVI", "crop_health"]}'
                                                                                                                                                                                                                                                                                                                                                         )
                                                                                                                                                                                                                                                                                                                                                         ;

-- Create Climate Data Quiz
insert into public.quizzes (
   id,
   title,
   difficulty,
   nasa_topic,
   questions_count,
   attempts_allowed
) values ( 'nasa-climate-data',
           'NASA Climate Data for Farming',
           'Hard',
           'Climate Science',
           0,
           3 );

-- Add climate data questions
insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation,
   nasa_data_reference
) values ( 'nasa-climate-data',
           'NASA POWER provides which agricultural parameters?',
           '["Only temperature data", "Solar radiation, temperature, and humidity", "Only precipitation data", "Only wind data"]'
           ,
           'Solar radiation, temperature, and humidity',
           'NASA POWER (Prediction of Worldwide Energy Resources) provides comprehensive meteorological data including solar radiation, temperature, humidity, wind speed, and precipitation for agricultural applications.'
           ,
           '{"source": "NASA_POWER", "parameters": ["T2M", "RH2M", "ALLSKY_SFC_SW_DWN", "WS10M", "PRECTOTCORR"]}' ),( 'nasa-climate-data'
           ,
                                                                                                                      'What does the SMAP L4 product provide for agriculture?'
                                                                                                                      ,
                                                                                                                      '["Only surface temperature", "Root zone soil moisture", "Crop yield predictions", "Pest population data"]'
                                                                                                                      ,
                                                                                                                      'Root zone soil moisture'
                                                                                                                      ,
                                                                                                                      'SMAP Level 4 provides root zone soil moisture estimates (0-100cm depth) which is crucial for understanding water availability to crops.'
                                                                                                                      ,
                                                                                                                      '{"source": "SMAP_L4", "depth": "0-100cm", "resolution": "9km", "applications": ["irrigation", "drought_monitoring"]}'
                                                                                                                      ),( 'nasa-climate-data'
                                                                                                                      ,
                                                                                                                                                                                                                                             'Which NASA dataset helps predict drought conditions?'
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                             '["MODIS Land Surface Temperature", "Palmer Drought Severity Index from GLDAS", "Landsat true color images", "GOES cloud cover"]'
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                             'Palmer Drought Severity Index from GLDAS'
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                             'NASA GLDAS (Global Land Data Assimilation System) provides the Palmer Drought Severity Index, which combines precipitation, temperature, and soil moisture to assess drought conditions.'
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                             '{"source": "GLDAS", "index": "PDSI", "temporal_resolution": "monthly", "applications": ["drought_early_warning"]}'
                                                                                                                                                                                                                                             )
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                             (
                                                                                                                                                                                                                                             'nasa-climate-data'
                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                                                                                                                                                 'How often does NASA GPM provide global precipitation data?'
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                 '["Once per day", "Every 3 hours", "Once per week", "Once per month"]'
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                 'Every 3 hours'
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                 'GPM Core Observatory provides precipitation measurements approximately every 3 hours, enabling near real-time monitoring of rainfall patterns globally.'
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                 '{"source": "GPM", "revisit_time": "3 hours", "coverage": "global", "products": ["IMERG"]}'
                                                                                                                                                                                                                                                                                                                                                                 )
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                 (
                                                                                                                                                                                                                                                                                                                                                                 'nasa-climate-data'
                                                                                                                                                                                                                                                                                                                                                                 ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                             'What is the advantage of using NASA Earth data for precision agriculture?'
                                                                                                                                                                                                                                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                             '["Only provides historical data", "Combines multiple satellite sensors for comprehensive monitoring", "Only works for large farms", "Requires expensive equipment"]'
                                                                                                                                                                                                                                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                             'Combines multiple satellite sensors for comprehensive monitoring'
                                                                                                                                                                                                                                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                             'NASA Earth data integrates information from multiple satellites (MODIS, SMAP, GPM, Landsat) to provide comprehensive monitoring of vegetation, soil moisture, weather, and climate patterns essential for precision agriculture.'
                                                                                                                                                                                                                                                                                                                                                                                                                                                             ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                             '{"integration": ["MODIS_vegetation", "SMAP_soil_moisture", "GPM_precipitation", "POWER_meteorology"], "benefits": ["multi_parameter", "global_coverage", "free_access"]}'
                                                                                                                                                                                                                                                                                                                                                                                                                                                             )
                                                                                                                                                                                                                                                                                                                                                                                                                                                             ;

-- Update question counts
update public.quizzes
   set
   questions_count = (
      select count(*)
        from public.quiz_questions
       where quiz_id = 'nasa-satellite-data'
   )
 where id = 'nasa-satellite-data';

update public.quizzes
   set
   questions_count = (
      select count(*)
        from public.quiz_questions
       where quiz_id = 'nasa-climate-data'
   )
 where id = 'nasa-climate-data';

-- Create Advanced NASA Applications Quiz
insert into public.quizzes (
   id,
   title,
   difficulty,
   nasa_topic,
   questions_count,
   attempts_allowed
) values ( 'nasa-advanced-apps',
           'Advanced NASA Data Applications',
           'Hard',
           'Data Integration',
           0,
           3 );

-- Add advanced application questions
insert into public.quiz_questions (
   quiz_id,
   question,
   options,
   correct_answer,
   explanation,
   nasa_data_reference
) values ( 'nasa-advanced-apps',
           'How can MODIS NDVI time series help farmers?',
           '["Only shows current conditions", "Tracks crop growth patterns and predicts harvest timing", "Only useful for weather forecasting", "Measures soil pH levels"]'
           ,
           'Tracks crop growth patterns and predicts harvest timing',
           'MODIS NDVI time series analysis reveals crop phenology patterns, growth stages, and can help predict optimal harvest timing by tracking vegetation development throughout the growing season.'
           ,
           '{"application": "crop_phenology", "temporal_resolution": "8-day", "methodology": "time_series_analysis"}' ),( 'nasa-advanced-apps'
           ,
                                                                                                                        'Which combination of NASA data is best for irrigation scheduling?'
                                                                                                                        ,
                                                                                                                        '["NDVI only", "SMAP soil moisture + GPM precipitation + weather forecasts", "Temperature data only", "Cloud cover only"]'
                                                                                                                        ,
                                                                                                                        'SMAP soil moisture + GPM precipitation + weather forecasts'
                                                                                                                        ,
                                                                                                                        'Effective irrigation scheduling requires soil moisture status (SMAP), recent precipitation (GPM), and weather forecasts to determine when and how much to irrigate.'
                                                                                                                        ,
                                                                                                                        '{"data_fusion": ["SMAP_soil_moisture", "GPM_precipitation", "weather_forecasts"], "decision_support": "irrigation_scheduling"}'
                                                                                                                        ),( 'nasa-advanced-apps'
                                                                                                                        ,
                                                                                                                                                                                                                                                         'What does anomaly detection in NDVI time series reveal?'
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                         '["Normal crop growth only", "Stress conditions like drought, disease, or pest damage", "Soil composition", "Market prices"]'
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                         'Stress conditions like drought, disease, or pest damage'
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                         'NDVI anomalies (deviations from normal patterns) can indicate various stress factors including drought stress, nutrient deficiency, disease outbreaks, or pest damage, enabling early intervention.'
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                         '{"technique": "anomaly_detection", "indicators": ["drought_stress", "disease", "pest_damage"], "threshold": "statistical_deviation"}'
                                                                                                                                                                                                                                                         )
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                         (
                                                                                                                                                                                                                                                         'nasa-advanced-apps'
                                                                                                                                                                                                                                                         ,
                                                                                                                                                                                                                                                                                                                                                                                                'How can NASA data support crop yield prediction?'
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                '["Single NDVI measurement is sufficient", "Combining NDVI trends, weather data, and soil moisture throughout growing season", "Only soil temperature is needed", "Market data alone"]'
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                'Combining NDVI trends, weather data, and soil moisture throughout growing season'
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                'Accurate yield prediction requires integrating multiple NASA datasets: NDVI for vegetation condition, meteorological data for growing conditions, and soil moisture for water stress assessment throughout the entire growing season.'
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                '{"model_inputs": ["NDVI_time_series", "temperature", "precipitation", "soil_moisture"], "approach": "data_fusion_modeling"}'
                                                                                                                                                                                                                                                                                                                                                                                                )
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                (
                                                                                                                                                                                                                                                                                                                                                                                                'nasa-advanced-apps'
                                                                                                                                                                                                                                                                                                                                                                                                ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              'What is the benefit of using NASA data for sustainable agriculture?'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              '["Increases pesticide use", "Optimizes resource use and reduces environmental impact", "Only increases profits", "Eliminates need for field monitoring"]'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              'Optimizes resource use and reduces environmental impact'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              'NASA Earth observation data enables precision agriculture practices that optimize water, fertilizer, and pesticide use, reducing environmental impact while maintaining or improving yields through data-driven decision making.'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              '{"sustainability_benefits": ["water_optimization", "precision_fertilization", "reduced_chemical_inputs"], "environmental_impact": "positive"}'
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ;

-- Update question count for advanced applications quiz
update public.quizzes
   set
   questions_count = (
      select count(*)
        from public.quiz_questions
       where quiz_id = 'nasa-advanced-apps'
   )
 where id = 'nasa-advanced-apps';

-- Success message
select 'NASA-focused quiz questions created successfully!' as result,
       (
          select count(*)
            from public.quiz_questions
           where quiz_id like 'nasa%'
       ) as total_questions_added;