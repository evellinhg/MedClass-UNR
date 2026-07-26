"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Crown, Loader2, Medal, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeaderboardRow {
  user_id: string
  display_name: string
  total_points: number
  total_simulados: number
}

const positionStyles = [
  { ring: "from-amber-400 to-yellow-500", icon: Crown, iconColor: "text-white" },
  { ring: "from-slate-300 to-slate-400", icon: Medal, iconColor: "text-white" },
  { ring: "from-amber-700 to-amber-800", icon: Medal, iconColor: "text-white" },
]

export function RankingWidget() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("leaderboard").select("*").order("total_points", { ascending: false }),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: userData }]) => {
      setRows(((data as LeaderboardRow[]) ?? []).filter((r) => r.total_simulados > 0))
      setCurrentUserId(userData.user?.id ?? null)
      setLoading(false)
    })
  }, [])

  const top3 = rows.slice(0, 3)
  const myPosition = rows.findIndex((r) => r.user_id === currentUserId)
  const me = myPosition >= 3 ? rows[myPosition] : null

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking
        </h3>
        <Link
          href="/dashboard/ranking"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver completo
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : top3.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Ninguém pontuou ainda. Resolva um simulado para aparecer aqui!
        </p>
      ) : (
        <div className="space-y-1.5">
          {top3.map((row, idx) => {
            const style = positionStyles[idx]
            const PositionIcon = style.icon
            return (
              <div
                key={row.user_id}
                className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                  row.user_id === currentUserId ? "bg-primary/10" : "hover:bg-accent"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm ${style.ring}`}
                >
                  <PositionIcon className={`h-4 w-4 ${style.iconColor}`} strokeWidth={2.25} />
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{row.display_name}</p>
                <span className="text-sm font-bold text-foreground">{row.total_points}</span>
              </div>
            )
          })}
          {me && (
            <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-semibold text-primary">
                {myPosition + 1}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                Você <Badge variant="secondary" className="ml-1 text-[10px]">Sua posição</Badge>
              </p>
              <span className="text-sm font-bold text-foreground">{me.total_points}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
