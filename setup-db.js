// Direct Database Setup Script
// Run with: node setup-db.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bnyagvqylorlastljrey.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWFndnF5bG9ybGFzdGxqcmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTAwOTIsImV4cCI6MjA3MTQ2NjA5Mn0.-aVy3ZdkLNytfOo1sqMAiCuAMSdXRIahZzqiDAW3rZk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🚀 Starting Database Setup...')
  
  try {
    // Test connection first
    console.log('🔍 Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.log('❌ Tables do not exist. Need to create them manually.')
      console.log('📋 Please run the SQL from supabase/sql/database_setup.sql in your Supabase dashboard')
      return
    }
    
    console.log('✅ Connection successful! Tables exist.')
    
    // Check if sample data exists
    const { data: existing } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', 'soil-basics')
      .single()
    
    if (existing) {
      console.log('✅ Sample data already exists!')
      return
    }
    
    // Insert sample quizzes
    console.log('📊 Adding sample quizzes...')
    const { error: quizError } = await supabase.from('quizzes').insert([
      { 
        id: 'soil-basics', 
        title: 'Soil Management Basics', 
        difficulty: 'Easy', 
        nasa_topic: 'Soil Health', 
        questions_count: 3, 
        attempts_allowed: 5 
      },
      { 
        id: 'water-conservation', 
        title: 'Water Conservation Techniques', 
        difficulty: 'Medium', 
        nasa_topic: 'Water Management', 
        questions_count: 2, 
        attempts_allowed: 3 
      }
    ])
    
    if (quizError) {
      console.error('❌ Failed to insert quizzes:', quizError.message)
      return
    }
    console.log('✅ Sample quizzes added!')
    
    // Insert sample questions
    console.log('❓ Adding sample questions...')
    const { error: questionError } = await supabase.from('quiz_questions').insert([
      {
        quiz_id: 'soil-basics',
        question: 'What is the ideal pH range for most crops?',
        options: ['5.0-6.0', '6.0-7.0', '7.0-8.0', '8.0-9.0'],
        correct_answer: '6.0-7.0',
        explanation: 'Most crops prefer slightly acidic to neutral soil with pH between 6.0-7.0.'
      },
      {
        quiz_id: 'soil-basics',
        question: 'Which nutrient is most important for plant growth?',
        options: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium'],
        correct_answer: 'Nitrogen',
        explanation: 'Nitrogen is essential for protein synthesis and chlorophyll production.'
      },
      {
        quiz_id: 'soil-basics',
        question: 'What percentage of organic matter is ideal in agricultural soil?',
        options: ['1-2%', '3-5%', '6-8%', '9-12%'],
        correct_answer: '3-5%',
        explanation: 'Healthy agricultural soil typically contains 3-5% organic matter.'
      },
      {
        quiz_id: 'water-conservation',
        question: 'Which irrigation method is most water-efficient?',
        options: ['Flood irrigation', 'Sprinkler irrigation', 'Drip irrigation', 'Furrow irrigation'],
        correct_answer: 'Drip irrigation',
        explanation: 'Drip irrigation delivers water directly to plant roots with minimal waste.'
      },
      {
        quiz_id: 'water-conservation',
        question: 'What is mulching primarily used for?',
        options: ['Pest control', 'Water retention', 'Fertilization', 'Weed prevention'],
        correct_answer: 'Water retention',
        explanation: 'Mulching helps retain soil moisture and reduces evaporation.'
      }
    ])
    
    if (questionError) {
      console.error('❌ Failed to insert questions:', questionError.message)
      return
    }
    console.log('✅ Sample questions added!')
    
    // Update question counts
    console.log('🔄 Updating question counts...')
    const { error: updateError } = await supabase.rpc('refresh_quiz_questions_count', { p_quiz_id: 'soil-basics' })
    if (updateError) {
      console.log('⚠️ Could not update question count (function might not exist)')
    }
    
    console.log('🎉 Database setup complete!')
    console.log('🔗 Visit your app at /admin/quiz to manage quizzes')
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
  }
}

// Run setup
setupDatabase().then(() => {
  console.log('✨ Done!')
  process.exit(0)
})