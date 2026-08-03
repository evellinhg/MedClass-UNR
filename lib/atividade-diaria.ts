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

export async function getStreakAtual(userId: string): Promise<StreakInfo> {
  const hoje = getPlataformaHoje()

  const { data: rows } = await supabase
    .from("atividade_diaria_log")
    .select("dia")
    .eq("user_id", userId)
    .order("dia", { ascending: false })
    .limit(60)

  const diasFeitos = new Set((rows ?? []).map((r) => r.dia as string))

  let streakAtual = 0
  let cursor = diasFeitos.has(hoje) ? hoje : diaAnterior(hoje)
  while (diasFeitos.has(cursor)) {
    streakAtual += 1
    cursor = diaAnterior(cursor)
  }

  const totalSlots = Math.max(streakAtual, 7) + 3
  const dias: DiaAtividade[] = Array.from({ length: totalSlots }, (_, i) => ({
    dia: String(i + 1),
    feito: i < streakAtual,
  }))

  return { streakAtual, dias }
}
