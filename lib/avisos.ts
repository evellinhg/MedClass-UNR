import { supabase } from "@/lib/supabase"

export interface AvisoConteudo {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  link: string | null
  status: "pendente" | "enviado" | "descartado"
  created_at: string
  enviado_em: string | null
}

export async function enfileirarAviso(tipo: string, titulo: string, mensagem: string, link?: string) {
  await supabase.from("avisos_conteudo").insert({ tipo, titulo, mensagem, link: link ?? null })
}
