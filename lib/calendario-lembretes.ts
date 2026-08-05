import { addDays, format } from "date-fns"
import { supabase } from "@/lib/supabase"
import type { CalendarioLembreteAtivo } from "@/lib/calendario-types"

/** Lembretes do usuário cujo evento cai entre hoje e daqui a 2 dias (inclusive). */
export async function buscarLembretesAtivos(userId: string): Promise<CalendarioLembreteAtivo[]> {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = addDays(hoje, 2)

  const { data, error } = await supabase
    .from("calendario_lembretes")
    .select("id, evento:calendario_eventos!inner(id, titulo, data, hora, tipo)")
    .eq("user_id", userId)
    .gte("evento.data", format(hoje, "yyyy-MM-dd"))
    .lte("evento.data", format(limite, "yyyy-MM-dd"))

  if (error || !data) return []
  return data as unknown as CalendarioLembreteAtivo[]
}

/** Mapa evento_id -> id do lembrete, pra saber quais eventos o usuário já marcou (qualquer data, não só as ativas). */
export async function buscarMeusLembretes(userId: string): Promise<Map<string, string>> {
  const { data, error } = await supabase.from("calendario_lembretes").select("id, evento_id").eq("user_id", userId)
  if (error || !data) return new Map()
  return new Map(data.map((l) => [l.evento_id, l.id]))
}

export async function criarLembrete(userId: string, eventoId: string) {
  return supabase.from("calendario_lembretes").insert({ user_id: userId, evento_id: eventoId }).select("id").single()
}

export async function removerLembrete(lembreteId: string) {
  return supabase.from("calendario_lembretes").delete().eq("id", lembreteId)
}
