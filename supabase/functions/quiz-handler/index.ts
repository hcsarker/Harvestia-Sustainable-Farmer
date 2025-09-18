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
        // Get quiz info (including attempts_allowed)
        const { data: quiz } = await supabaseClient
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        // Get questions securely (without answers)
        const { data: questions } = await supabaseClient
          .rpc('get_quiz_questions_secure', { quiz_id_param: quizId })

        // Check current user's attempts
        const { data: userRes } = await supabaseClient.auth.getUser()
        const uid = userRes.user?.id ?? null
        let existing: any = null
        let attemptsUsed = 0
        if (uid) {
          const latest = await supabaseClient
            .from('user_quiz_results')
            .select('id, score, total_questions, completed_at')
            .eq('quiz_id', quizId)
            .eq('user_id', uid)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          existing = latest.data ?? null

          const cnt = await supabaseClient
            .from('user_quiz_results')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', quizId)
            .eq('user_id', uid)
          attemptsUsed = cnt.count ?? 0
        }

  const attemptsAllowed = (quiz as any)?.attempts_allowed ?? 5
        const attemptsLeft = Math.max(0, attemptsAllowed - attemptsUsed)

        const quizWithQuestions = {
          ...quiz,
          quiz_questions: questions || [],
          attempted: attemptsUsed > 0,
          last_result: existing || null,
          attempts_allowed: attemptsAllowed,
          attempts_used: attemptsUsed,
          attempts_left: attemptsLeft,
        }

        return new Response(
          JSON.stringify({ quiz: quizWithQuestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      case 'submitQuiz': {
        // Must be authenticated
        const { data: userRes } = await supabaseClient.auth.getUser()
        const uid = userRes.user?.id
        if (!uid) {
          return new Response(
            JSON.stringify({ ok: false, error: 'Unauthorized' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }

        // Enforce attempt limit per quiz
        const { data: quiz } = await supabaseClient
          .from('quizzes')
          .select('attempts_allowed')
          .eq('id', quizId)
          .single()

        const attemptsAllowed = (quiz as any)?.attempts_allowed ?? 5
        const cnt = await supabaseClient
          .from('user_quiz_results')
          .select('id', { count: 'exact', head: true })
          .eq('quiz_id', quizId)
          .eq('user_id', uid)
        const attemptsUsed = cnt.count ?? 0

        if (attemptsUsed >= attemptsAllowed) {
          return new Response(
            JSON.stringify({ ok: false, error: 'No attempts left' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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

        // Award achievements based on score
        try {
          const pct = result?.percentage ?? Math.round((result?.score / result?.total_questions) * 100)
          const code = pct >= 100 ? 'perfect_quiz' : pct >= 90 ? 'silver_quiz' : pct >= 80 ? 'bronze_quiz' : null
          if (code) {
            await supabaseClient.rpc('record_achievement', { p_user: (await supabaseClient.auth.getUser()).data.user?.id, p_code: code })
          }
        } catch (_) { /* non-blocking */ }

        return new Response(
          JSON.stringify({ ok: true, result }),
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
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
  } catch (error) {
    const message = error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})