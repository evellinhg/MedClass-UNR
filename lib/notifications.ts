import { supabase } from "@/lib/supabase"

export interface Notificacao {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  tipo: "info" | "sucesso" | "alerta"
  lida: boolean
  link: string | null
  created_at: string
}

export async function criarNotificacao(
  userId: string,
  titulo: string,
  mensagem: string,
  tipo: Notificacao["tipo"] = "info",
  link?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    titulo,
    mensagem,
    tipo,
    link: link ?? null,
  })
}

export async function buscarNotificacoes(userId: string, limit = 20) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data as Notificacao[]) ?? []
}

export async function contarNaoLidas(userId: string) {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("lida", false)
  return count ?? 0
}

export async function marcarComoLida(notificationId: string) {
  await supabase.from("notifications").update({ lida: true }).eq("id", notificationId)
}

export async function marcarTodasComoLidas(userId: string) {
  await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("user_id", userId)
    .eq("lida", false)
}
