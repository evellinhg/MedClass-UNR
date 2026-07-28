import { supabase } from "@/lib/supabase"

type Evento =
  | "simulado_iniciado"
  | "simulado_finalizado"
  | "questao_respondida"
  | "treino_iniciado"
  | "treino_finalizado"
  | "desafio_iniciado"
  | "desafio_finalizado"
  | "flashcard_revisado"
  | "videoaula_assistida"
  | "pagina_visitada"

export async function trackEvent(evento: Evento, dados?: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return

  supabase.from("user_analytics").insert({
    user_id: data.user.id,
    evento,
    dados: dados ?? {},
  }).then(() => {})
}

export async function getAnalytics(userId: string, evento?: string, limit = 100) {
  let query = supabase
    .from("user_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (evento) query = query.eq("evento", evento)

  const { data } = await query
  return data ?? []
}

export async function getResumoAnalytics(userId: string) {
  const { data } = await supabase
    .from("user_analytics")
    .select("evento, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(500)

  if (!data) return null

  const counts: Record<string, number> = {}
  data.forEach((row) => {
    counts[row.evento] = (counts[row.evento] || 0) + 1
  })

  const primeiroAcesso = data.length > 0 ? data[data.length - 1].created_at : null
  const ultimoAcesso = data.length > 0 ? data[0].created_at : null

  return {
    totalSimulados: (counts["simulado_finalizado"] || 0),
    totalTreinos: (counts["treino_finalizado"] || 0),
    totalQuestoes: (counts["questao_respondida"] || 0),
    totalDesafios: (counts["desafio_finalizado"] || 0),
    primeiroAcesso,
    ultimoAcesso,
  }
}
