import { supabase } from "@/lib/supabase"

export async function getQuestoesJaRespondidas(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from("simulados").select("questao_ids").eq("user_id", userId)
  const ids = new Set<string>()
  for (const row of (data as { questao_ids: string[] }[] | null) ?? []) {
    for (const id of row.questao_ids ?? []) ids.add(id)
  }
  return ids
}
