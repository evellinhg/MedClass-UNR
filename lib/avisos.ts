import { supabase } from "@/lib/supabase"

// Público-alvo ao enviar: quem recebe a notificação em public.notifications.
// "premium" agrupa mensal + trimestral (ver filtro no /api/admin/avisos/[id]/enviar).
export type AvisoDestino = "todas" | "premium" | "vip" | "colaboradores" | "gratis"

export const AVISO_DESTINO_LABEL: Record<AvisoDestino, string> = {
  todas: "Todas as contas",
  premium: "Contas premium (mensal/trimestral)",
  vip: "Contas VIP",
  colaboradores: "Colaboradores",
  gratis: "Contas gratuitas",
}

export interface AvisoConteudo {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  link: string | null
  status: "pendente" | "enviado" | "descartado"
  destino: AvisoDestino
  created_at: string
  enviado_em: string | null
}

export async function enfileirarAviso(tipo: string, titulo: string, mensagem: string, link?: string) {
  await supabase.from("avisos_conteudo").insert({ tipo, titulo, mensagem, link: link ?? null })
}

export async function criarAvisoManual(titulo: string, mensagem: string) {
  return supabase.from("avisos_conteudo").insert({ tipo: "manual", titulo, mensagem }).select().single()
}
