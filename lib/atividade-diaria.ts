import { supabase } from "@/lib/supabase"

const FUSO_PLATAFORMA = "America/Argentina/Buenos_Aires"

export function getPlataformaHoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_PLATAFORMA }).format(new Date())
}

function diaAnterior(dia: string): string {
  const [ano, mes, diaNum] = dia.split("-").map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, diaNum))
  data.setUTCDate(data.getUTCDate() - 1)
  return data.toISOString().slice(0, 10)
}

export async function registrarAtividadeHoje(): Promise<void> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return

  supabase
    .from("atividade_diaria_log")
    .upsert({ user_id: data.user.id, dia: getPlataformaHoje() }, { onConflict: "user_id,dia", ignoreDuplicates: true })
    .then(() => {})
}

export interface DiaAtividade {
  dia: string
  feito: boolean
}

export interface StreakInfo {
  streakAtual: number
  dias: DiaAtividade[]
}

function calcularStreak(diasFeitos: Set<string>): StreakInfo {
  const hoje = getPlataformaHoje()

  let streakAtual = 0
  let cursor = diasFeitos.has(hoje) ? hoje : diaAnterior(hoje)
  while (diasFeitos.has(cursor)) {
    streakAtual += 1
    cursor = diaAnterior(cursor)
  }

  const totalSlots = Math.min(Math.max(streakAtual + 3, 10), 60)
  const dias: DiaAtividade[] = Array.from({ length: totalSlots }, (_, i) => ({
    dia: String(i + 1),
    feito: i < streakAtual,
  }))

  return { streakAtual, dias }
}

async function buscarDiasFeitos(userId: string): Promise<Set<string>> {
  const { data: rows } = await supabase
    .from("atividade_diaria_log")
    .select("dia")
    .eq("user_id", userId)
    .order("dia", { ascending: false })
    .limit(60)

  return new Set((rows ?? []).map((r) => r.dia as string))
}

export async function getStreakAtual(userId: string): Promise<StreakInfo> {
  return calcularStreak(await buscarDiasFeitos(userId))
}

// Se a sequência estiver zerada (nunca treinou ou quebrou a sequência), o
// dia 1 acende sozinho quando o aluno entra no dashboard -- convite pra ele
// treinar hoje e continuar. Não dá dias de graça além do 1: com a sequência
// já ativa, só treinar de verdade (registrarAtividadeHoje, chamado ao
// concluir simulado/desafio/deck de flashcards) acende o próximo dia.
export async function garantirStreakAtivo(userId: string): Promise<StreakInfo> {
  const diasFeitos = await buscarDiasFeitos(userId)
  const streak = calcularStreak(diasFeitos)
  if (streak.streakAtual > 0) return streak

  await supabase
    .from("atividade_diaria_log")
    .upsert({ user_id: userId, dia: getPlataformaHoje() }, { onConflict: "user_id,dia", ignoreDuplicates: true })

  diasFeitos.add(getPlataformaHoje())
  return calcularStreak(diasFeitos)
}
