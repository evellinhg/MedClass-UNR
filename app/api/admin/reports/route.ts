import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

function startOfWeek(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // Monday as first day
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

function pct(numerator: number, denominator: number) {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const [simuladosRes, attemptsRes, desafiosRes, desafiosHistRes, feedbackRes] = await Promise.all([
    supabase.from('simulados').select('id, areas, modo, created_at, finished_at'),
    supabase.from('simulado_attempts').select('id, simulado_id, subject, correct_count, wrong_count, total_questions, user_id, created_at'),
    supabase.from('desafios_clinicos').select('id, titulo, area'),
    supabase.from('desafios_clinicos_historico').select('id, desafio_id, acertos, total, user_id, created_at'),
    supabase.from('question_feedback').select('id, question_id, tipo, status, created_at'),
  ])

  for (const r of [simuladosRes, attemptsRes, desafiosRes, desafiosHistRes, feedbackRes]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
  }

  const simulados = simuladosRes.data ?? []
  const attempts = attemptsRes.data ?? []
  const desafios = desafiosRes.data ?? []
  const desafiosHist = desafiosHistRes.data ?? []
  const feedback = feedbackRes.data ?? []

  // --- Resumo geral ---
  const simuladosFinalizados = simulados.filter((s) => s.finished_at).length
  const simuladosAbandonados = simulados.length - simuladosFinalizados

  // --- Dificuldade por área (simulados com area definida, casadas com tentativas pelo simulado_id) ---
  const attemptBySimuladoId = new Map(attempts.filter((a) => a.simulado_id).map((a) => [a.simulado_id as string, a]))
  const areaStats = new Map<string, { tentativas: number; acertos: number; total: number; abandonos: number }>()
  for (const s of simulados) {
    const areas = (s.areas as string[] | null) ?? []
    if (areas.length === 0) continue
    const attempt = attemptBySimuladoId.get(s.id)
    for (const area of areas) {
      const entry = areaStats.get(area) ?? { tentativas: 0, acertos: 0, total: 0, abandonos: 0 }
      entry.tentativas += 1
      if (!s.finished_at) entry.abandonos += 1
      if (attempt) {
        entry.acertos += attempt.correct_count
        entry.total += attempt.correct_count + attempt.wrong_count
      }
      areaStats.set(area, entry)
    }
  }
  const dificuldadePorArea = [...areaStats.entries()]
    .map(([area, s]) => ({
      area,
      tentativas: s.tentativas,
      acerto_medio_pct: pct(s.acertos, s.total),
      abandono_pct: pct(s.abandonos, s.tentativas),
    }))
    .sort((a, b) => b.tentativas - a.tentativas)

  // --- Tentativas avulsas (sem simulado vinculado), agrupadas pelo texto livre "subject" ---
  const avulsas = attempts.filter((a) => !a.simulado_id)
  const subjectStats = new Map<string, { tentativas: number; acertos: number; total: number }>()
  for (const a of avulsas) {
    const key = a.subject ?? 'Sem assunto'
    const entry = subjectStats.get(key) ?? { tentativas: 0, acertos: 0, total: 0 }
    entry.tentativas += 1
    entry.acertos += a.correct_count
    entry.total += a.correct_count + a.wrong_count
    subjectStats.set(key, entry)
  }
  const desempenhoPorAssunto = [...subjectStats.entries()]
    .map(([assunto, s]) => ({ assunto, tentativas: s.tentativas, acerto_medio_pct: pct(s.acertos, s.total) }))
    .sort((a, b) => b.tentativas - a.tentativas)

  // --- Desafios clínicos por área ---
  const desafioAreaById = new Map(desafios.map((d) => [d.id, d.area]))
  const desafioAreaStats = new Map<string, { tentativas: number; acertos: number; total: number }>()
  for (const h of desafiosHist) {
    const area = desafioAreaById.get(h.desafio_id) ?? 'Sem área'
    const entry = desafioAreaStats.get(area) ?? { tentativas: 0, acertos: 0, total: 0 }
    entry.tentativas += 1
    entry.acertos += h.acertos
    entry.total += h.total
    desafioAreaStats.set(area, entry)
  }
  const dificuldadeDesafiosPorArea = [...desafioAreaStats.entries()]
    .map(([area, s]) => ({ area, tentativas: s.tentativas, acerto_medio_pct: pct(s.acertos, s.total) }))
    .sort((a, b) => b.tentativas - a.tentativas)

  // --- Feedback / erros reportados, agrupado por questão (top 10) ---
  const feedbackByQuestion = new Map<string, { total: number; pendentes: number }>()
  for (const f of feedback) {
    const entry = feedbackByQuestion.get(f.question_id) ?? { total: 0, pendentes: 0 }
    entry.total += 1
    if (f.status === 'pending') entry.pendentes += 1
    feedbackByQuestion.set(f.question_id, entry)
  }
  const questoesMaisReportadas = [...feedbackByQuestion.entries()]
    .map(([question_id, s]) => ({ question_id, ...s }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // --- Progresso semanal (últimas 12 semanas), acerto médio agregado de todas as tentativas ---
  const now = new Date()
  const weekKeys: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i * 7)
    weekKeys.push(startOfWeek(d))
  }
  const weekStats = new Map(weekKeys.map((w) => [w, { acertos: 0, total: 0, tentativas: 0 }]))
  for (const a of attempts) {
    const week = startOfWeek(new Date(a.created_at))
    const entry = weekStats.get(week)
    if (!entry) continue
    entry.acertos += a.correct_count
    entry.total += a.correct_count + a.wrong_count
    entry.tentativas += 1
  }
  const progressoSemanal = weekKeys.map((week) => {
    const s = weekStats.get(week)!
    return { semana: week, acerto_medio_pct: pct(s.acertos, s.total), tentativas: s.tentativas }
  })

  // --- Engajamento: usuários distintos com atividade recente ---
  const activeUsersInWindow = (days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const ids = new Set<string>()
    for (const a of attempts) if (new Date(a.created_at).getTime() >= cutoff) ids.add(a.user_id)
    for (const h of desafiosHist) if (new Date(h.created_at).getTime() >= cutoff) ids.add(h.user_id)
    return ids.size
  }

  return NextResponse.json({
    resumo: {
      simulados_total: simulados.length,
      simulados_finalizados: simuladosFinalizados,
      simulados_abandonados: simuladosAbandonados,
      taxa_abandono_simulados_pct: pct(simuladosAbandonados, simulados.length),
      tentativas_total: attempts.length,
      desafios_total: desafiosHist.length,
      feedback_total: feedback.length,
      feedback_pendente: feedback.filter((f) => f.status === 'pending').length,
      ativos_7d: activeUsersInWindow(7),
      ativos_30d: activeUsersInWindow(30),
    },
    dificuldade_por_area: dificuldadePorArea,
    desempenho_por_assunto: desempenhoPorAssunto,
    dificuldade_desafios_por_area: dificuldadeDesafiosPorArea,
    questoes_mais_reportadas: questoesMaisReportadas,
    progresso_semanal: progressoSemanal,
  })
}
