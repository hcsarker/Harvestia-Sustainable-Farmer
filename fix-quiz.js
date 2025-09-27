const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bnyagvqylorlastljrey.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWFndnF5bG9ybGFzdGxqcmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTAwOTIsImV4cCI6MjA3MTQ2NjA5Mn0.-aVy3ZdkLNytfOo1sqMAiCuAMSdXRIahZzqiDAW3rZk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addQuestions() {
  console.log('🚀 Adding questions to make quiz exam work...')
  
  try {
    // Get first quiz
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title')
      .limit(1)
    
    if (quizError || !quizzes || quizzes.length === 0) {
      console.log('❌ No quizzes found:', quizError?.message)
      return
    }
    
    const quiz = quizzes[0]
    console.log('📝 Adding questions to quiz:', quiz.title)
    
    // Add questions
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([
        {
          quiz_id: quiz.id,
          question: 'What is the ideal pH range for most crops?',
          options: ['5.0-6.0', '6.0-7.0', '7.0-8.0', '8.0-9.0'],
          correct_answer: '6.0-7.0',
          explanation: 'Most crops prefer slightly acidic to neutral soil.'
        },
        {
          quiz_id: quiz.id,
          question: 'Which nutrient is most important for plant growth?',
          options: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium'],
          correct_answer: 'Nitrogen',
          explanation: 'Nitrogen is essential for protein synthesis.'
        },
        {
          quiz_id: quiz.id,
          question: 'What causes soil erosion?',
          options: ['Wind and water', 'Plants', 'Fertilizers', 'Sunlight'],
          correct_answer: 'Wind and water',
          explanation: 'Wind and water are primary causes of soil erosion.'
        }
      ])
      .select()
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log('✅ Successfully added', data.length, 'questions!')
      console.log('🎯 Quiz exam is now ready to use!')
      
      // Update question count
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ questions_count: data.length })
        .eq('id', quiz.id)
      
      if (!updateError) {
        console.log('✅ Updated question count')
      }
    }
    
  } catch (error) {
    console.log('💥 Error:', error.message)
  }
}

addQuestions()