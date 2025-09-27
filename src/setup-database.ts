import { supabase } from '@/integrations/supabase/client'

async function setupQuizDatabase() {
  console.log('🚀 Starting Quiz System Database Setup...')
  
  try {
    // Step 1: Check if tables already exist
    console.log('📝 Checking existing tables...')
    
    const { data: existingQuizzes } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1)
    
    if (existingQuizzes && existingQuizzes.length > 0) {
      console.log('✅ Tables already exist, skipping creation')
    } else {
      console.log('📝 Tables need to be created manually in Supabase dashboard')
      console.log('🔗 Go to: https://supabase.com/dashboard → Your Project → SQL Editor')
      console.log('📋 Copy and run the SQL from: supabase/sql/database_setup.sql')
      return false
    }
    
    // Step 2: Insert sample data using direct inserts
    console.log('📊 Adding sample quizzes...')
    
    // Check if sample data already exists
    const { data: existingSample } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', 'soil-basics')
      .single()
    
    if (existingSample) {
      console.log('✅ Sample data already exists')
      return true
    }
    
    const { error: quizInsertError } = await supabase.from('quizzes').insert([
      { id: 'soil-basics', title: 'Soil Management Basics', difficulty: 'Easy', nasa_topic: 'Soil Health', questions_count: 3, attempts_allowed: 5 },
      { id: 'water-conservation', title: 'Water Conservation Techniques', difficulty: 'Medium', nasa_topic: 'Water Management', questions_count: 4, attempts_allowed: 3 },
      { id: 'crop-rotation', title: 'Sustainable Crop Rotation', difficulty: 'Hard', nasa_topic: 'Crop Science', questions_count: 5, attempts_allowed: 2 }
    ])
    
    if (quizInsertError) {
      console.error('❌ Failed to insert quizzes:', quizInsertError)
      return
    }
    console.log('✅ Added sample quizzes')
    
    // Step 3: Add sample questions
    console.log('❓ Adding sample questions...')
    
    const { error: questionsInsertError } = await supabase.from('quiz_questions').insert([
      // Soil basics questions
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
      }
    ])
    
    if (questionsInsertError) {
      console.error('❌ Failed to insert questions:', questionsInsertError)
      return
    }
    console.log('✅ Added sample questions')
    
    console.log('🎉 Quiz System Database Setup Complete!')
    return true
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
    return false
  }
}

// Export for use in component
export { setupQuizDatabase }