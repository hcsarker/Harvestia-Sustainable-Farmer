import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, quizId, answers, questionId, answer } = await req.json()

    switch (action) {
      case 'getQuiz':
        // Get quiz info
        const { data: quiz } = await supabaseClient
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        // Get questions securely (without answers)
        const { data: questions } = await supabaseClient
          .rpc('get_quiz_questions_secure', { quiz_id_param: quizId })

        const quizWithQuestions = {
          ...quiz,
          quiz_questions: questions || []
        }

        return new Response(
          JSON.stringify({ quiz: quizWithQuestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

      case 'submitQuiz':
        // Use the secure server function to validate answers
        const { data: result, error } = await supabaseClient
          .rpc('submit_quiz_results', {
            quiz_id_param: quizId,
            answers_param: answers
          })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

      case 'validateAnswer':
        // Validate single answer (useful for immediate feedback)
        const { data: isCorrect, error: validationError } = await supabaseClient
          .rpc('validate_quiz_answer', {
            question_id: questionId,
            submitted_answer: answer
          })

        if (validationError) {
          throw validationError
        }

        return new Response(
          JSON.stringify({ isCorrect }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})