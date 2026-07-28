"use client"

import { useEffect, useState } from "react"
import { Loader2, Medal, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination, PAGE_SIZE } from "@/components/pagination"

interface LeaderboardRow {
  user_id: string
  display_name: string
  total_points: number
  total_questions: number
  total_correct: number
  total_wrong: number
  total_simulados: number
}

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-700"]

export function RankingContent() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([
      supabase.from("leaderboard").select("*").order("total_points", { ascending: false }),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: userData }]) => {
      setRows((data as LeaderboardRow[]) ?? [])
      setCurrentUserId(userData.user?.id ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando ranking...
      </div>
    )
  }

  const ranked = rows.filter((r) => r.total_simulados > 0)
  const unranked = rows.filter((r) => r.total_simulados === 0)

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Como pontuar</p>
        <p className="mt-1">
          +10 pontos por acerto, -3 por erro, +1 por questão respondida, e um bônus de até 20 pontos por
          velocidade (responder rápido). Resolva simulados e questões para subir no ranking!
        </p>
      </Card>

      {ranked.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Ninguém pontuou ainda. Resolva um simulado para aparecer no ranking!
        </Card>
      ) : (() => {
        const totalPages = Math.ceil(ranked.length / PAGE_SIZE)
        const paginated = ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        return (
          <>
            <div className="space-y-2">
              {paginated.map((row, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx
                const isMe = row.user_id === currentUserId
                const accuracy =
                  row.total_correct + row.total_wrong > 0
                    ? Math.round((row.total_correct / (row.total_correct + row.total_wrong)) * 100)
                    : 0
                return (
                  <Card
                    key={row.user_id}
                    className={`flex items-center gap-4 border p-4 ${
                      isMe ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
                      {globalIdx < 3 ? <Medal className={`h-5 w-5 ${medalColors[globalIdx]}`} /> : globalIdx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {row.display_name} {isMe && <Badge variant="secondary" className="ml-1">Você</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.total_simulados} simulado(s) · {row.total_questions} questões · {accuracy}% de acerto
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-right">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-lg font-bold text-foreground">{row.total_points}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      })()}

      {unranked.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {unranked.length} usuário(s) ainda não resolveram nenhum simulado.
        </p>
      )}
    </div>
  )
}
