import { supabase } from "@/lib/supabase"

export async function getMinhaPosicaoRanking(userId: string): Promise<number | null> {
  const { data } = await supabase
    .from("leaderboard")
    .select("user_id, total_points, total_simulados")
    .order("total_points", { ascending: false })

  const ranked = ((data as { user_id: string; total_points: number; total_simulados: number }[]) ?? []).filter(
    (r) => r.total_simulados > 0
  )
  const idx = ranked.findIndex((r) => r.user_id === userId)
  return idx === -1 ? null : idx + 1
}
