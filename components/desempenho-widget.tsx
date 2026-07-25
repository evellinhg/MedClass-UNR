"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BarChart3, Loader2, Target, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"

interface Attempt {
  correct_count: number
  wrong_count: number
  points: number
}

export function DesempenhoWidget() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase
        .from("simulado_attempts")
        .select("correct_count, wrong_count, points")
        .eq("user_id", data.user.id)
        .then(({ data: rows }) => {
          setAttempts((rows as Attempt[]) ?? [])
          setLoading(false)
        })
    })
  }, [])

  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_count, 0)
  const totalWrong = attempts.reduce((sum, a) => sum + a.wrong_count, 0)
  const totalPoints = attempts.reduce((sum, a) => sum + a.points, 0)
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          Seu Desempenho
        </h3>
        <Link
          href="/dashboard/desempenho/estatisticas"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver estatísticas
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : attempts.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Você ainda não resolveu nenhum simulado. Que tal começar agora?
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
            <Target className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1.5 text-lg font-bold text-foreground">{accuracy}%</p>
            <p className="text-[11px] text-muted-foreground">Aproveitamento</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-blue-500" />
            <p className="mt-1.5 text-lg font-bold text-foreground">{totalCorrect + totalWrong}</p>
            <p className="text-[11px] text-muted-foreground">Questões feitas</p>
          </div>
          <div className="rounded-lg bg-purple-500/10 p-3 text-center">
            <BarChart3 className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1.5 text-lg font-bold text-foreground">{totalPoints}</p>
            <p className="text-[11px] text-muted-foreground">Pontos</p>
          </div>
        </div>
      )}
    </Card>
  )
}
