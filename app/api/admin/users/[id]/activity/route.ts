import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const [simulados, attempts, feedback, desafios, ledger] = await Promise.all([
    supabase
      .from('simulados')
      .select('id, nome, areas, prova, quantidade_questoes, modo, created_at, finished_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('simulado_attempts')
      .select('id, simulado_id, subject, total_questions, correct_count, wrong_count, duration_seconds, points, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('question_feedback')
      .select('id, question_id, tipo, message, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('desafios_clinicos_historico')
      .select('id, desafio_id, acertos, total, duracao_segundos, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('medcoins_ledger')
      .select('id, tipo, valor, origem_tipo, origem_id, descricao, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  for (const result of [simulados, attempts, feedback, desafios, ledger]) {
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
  }

  const simuladosList = simulados.data ?? []
  const abandonados = simuladosList.filter((s) => !s.finished_at)

  return NextResponse.json({
    summary: {
      simulados_total: simuladosList.length,
      simulados_finalizados: simuladosList.length - abandonados.length,
      simulados_abandonados: abandonados.length,
      tentativas_total: attempts.data?.length ?? 0,
      feedback_total: feedback.data?.length ?? 0,
      desafios_total: desafios.data?.length ?? 0,
    },
    simulados: simuladosList,
    simulado_attempts: attempts.data ?? [],
    question_feedback: feedback.data ?? [],
    desafios_clinicos: desafios.data ?? [],
    medcoins_ledger: ledger.data ?? [],
  })
}
