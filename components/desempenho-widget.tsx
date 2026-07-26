"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { ArrowUpRight, BarChart3, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { MiniDonut } from "@/components/ui/mini-donut"

interface Attempt {
  correct_count: number
  wrong_count: number
  total_questions: number
  points: number
  created_at: string
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
        .select("correct_count, wrong_count, total_questions, points, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: true })
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

  const sparklineData = useMemo(() => {
    let cumulative = 0
    const points = attempts.map((a) => {
      cumulative += a.total_questions
      return { total: cumulative }
    })
    return points.slice(-10)
  }, [attempts])

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
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 p-3 text-center">
            <MiniDonut percentage={accuracy} color="#22c55e" size={52} strokeWidth={5} />
            <p className="text-[11px] text-muted-foreground">Aproveitamento</p>
          </div>
          <div className="flex flex-col items-center justify-between gap-1.5 rounded-lg bg-blue-500/10 p-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{totalCorrect + totalWrong}</p>
              <p className="text-[11px] text-muted-foreground">Questões feitas</p>
            </div>
            {sparklineData.length >= 2 ? (
              <div className="h-8 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-8" />
            )}
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-purple-500/10 p-3 text-center">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{totalPoints}</p>
              <p className="text-[11px] text-muted-foreground">Pontos</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
