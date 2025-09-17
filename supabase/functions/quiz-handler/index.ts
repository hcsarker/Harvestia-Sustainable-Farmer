// @ts-nocheck
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
      case 'ping': {
        return new Response(
          JSON.stringify({ ok: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
      case 'getQuiz': {
        // Get quiz info
        const { data: quiz } = await supabaseClient
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        // Get questions securely (without answers)
        const { data: questions } = await supabaseClient
          .rpc('get_quiz_questions_secure', { quiz_id_param: quizId })

        // Check if user already attempted
        const { data: existing } = await supabaseClient
          .from('user_quiz_results')
          .select('id, score, total_questions, completed_at')
          .eq('quiz_id', quizId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const quizWithQuestions = {
          ...quiz,
          quiz_questions: questions || [],
          attempted: !!existing,
          last_result: existing || null
        }

        return new Response(
          JSON.stringify({ quiz: quizWithQuestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      case 'submitQuiz': {
        // Block reattempts: allow only one attempt per user per quiz
        const { data: prior } = await supabaseClient
          .from('user_quiz_results')
          .select('id')
          .eq('quiz_id', quizId)
          .limit(1)
          .maybeSingle()

        if (prior) {
          return new Response(
            JSON.stringify({ error: 'Already attempted' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }

        // Use the secure server function to validate answers
        const { data: result, error } = await supabaseClient
          .rpc('submit_quiz_results', {
            quiz_id_param: quizId,
            answers_param: answers
          })

        if (error) {
          throw error
        }

        // Award Bronze achievement if score >= 80%
        try {
          const percentage = Number(result?.percentage ?? 0)
          if (!Number.isNaN(percentage) && percentage >= 80) {
            // find an achievement that matches Bronze criteria
            const { data: ach } = await supabaseClient
              .from('achievements')
              .select('id')
              .eq('name', 'Bronze Quiz Master')
              .limit(1)
              .maybeSingle()
            if (ach?.id) {
              // get current user
              const { data: { user } } = await supabaseClient.auth.getUser()
              if (user?.id) {
                // upsert unique user achievement
                await supabaseClient
                  .from('user_achievements')
                  .insert({ user_id: user.id, achievement_id: ach.id })
              }
            }
          }
        } catch { /* non-blocking */ }

        return new Response(
          JSON.stringify({ result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      case 'validateAnswer': {
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
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    const message = error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})