"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, Loader2, LineChart as LineChartIcon, TrendingDown, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const CORRECT_COLOR = "#10b981"
const WRONG_COLOR = "#f43f5e"
const POINTS_FROM = "#8b5cf6"
const POINTS_TO = "#6366f1"

interface Attempt {
  id: string
  subject: string | null
  total_questions: number
  correct_count: number
  wrong_count: number
  points: number
  created_at: string
}

export function DesempenhoEstatisticasContent() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase
        .from("simulado_attempts")
        .select("id, subject, total_questions, correct_count, wrong_count, points, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: true })
        .then(({ data: rows }) => {
          setAttempts((rows as Attempt[]) ?? [])
          setLoading(false)
        })
    })
  }, [])

  const chartData = useMemo(
    () =>
      attempts.map((a, i) => ({
        label: `#${i + 1}`,
        date: new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        acertos: a.correct_count,
        erros: a.wrong_count,
        pontos: a.points,
      })),
    [attempts]
  )

  const bySubject = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>()
    for (const a of attempts) {
      const key = a.subject ?? "Geral"
      const current = map.get(key) ?? { correct: 0, total: 0 }
      current.correct += a.correct_count
      current.total += a.total_questions
      map.set(key, current)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, percentage: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 }))
      .sort((a, b) => b.percentage - a.percentage)
  }, [attempts])

  const topSubjects = bySubject.slice(0, 3)
  const weakestSubjects = [...bySubject].reverse().slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando estatísticas...
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Você ainda não resolveu nenhum simulado ou questão. Resolva alguns para ver suas estatísticas aqui!
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Acertos x Erros */}
      <Card className="border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Acertos x Erros por Tentativa</h3>
        <ChartContainer config={{ acertos: { label: "Acertos" }, erros: { label: "Erros" } }} className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--accent)" }} />
              <Bar dataKey="acertos" name="Acertos" fill={CORRECT_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="erros" name="Erros" fill={WRONG_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORRECT_COLOR }} />
            Acertos
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: WRONG_COLOR }} />
            Erros
          </span>
        </div>
      </Card>

      {/* Evolução de pontos */}
      <Card className="border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">Evolução de Pontos</h3>
          <div className="flex items-center gap-2 rounded-lg border border-border p-1">
            <Button
              size="sm"
              variant={chartType === "line" ? "gradient" : "ghost"}
              onClick={() => setChartType("line")}
              className="gap-1.5"
            >
              <LineChartIcon className="h-4 w-4" />
              Linha
            </Button>
            <Button
              size="sm"
              variant={chartType === "bar" ? "gradient" : "ghost"}
              onClick={() => setChartType("bar")}
              className="gap-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              Barras
            </Button>
          </div>
        </div>

        <ChartContainer config={{ pontos: { label: "Pontos" } }} className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="pointsGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={POINTS_FROM} />
                    <stop offset="100%" stopColor={POINTS_TO} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="pontos"
                  name="Pontos"
                  stroke="url(#pointsGradient)"
                  strokeWidth={3}
                  dot={{ fill: POINTS_TO, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: POINTS_FROM }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="pointsBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={POINTS_FROM} />
                    <stop offset="100%" stopColor={POINTS_TO} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="pontos" name="Pontos" fill="url(#pointsBarGradient)" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Top vs weak areas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-success/30 bg-success/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <TrendingUp className="h-5 w-5 text-success" />
            O que você manda bem
          </h3>
          <div className="space-y-4">
            {topSubjects.map((subject) => (
              <div key={subject.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{subject.name}</span>
                  <span className="text-sm font-bold text-success">{subject.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${subject.percentage}%`, backgroundColor: CORRECT_COLOR }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border border-warning/30 bg-warning/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <TrendingDown className="h-5 w-5 text-warning" />
            Precisa Melhorar
          </h3>
          <div className="space-y-4">
            {weakestSubjects.map((subject) => (
              <div key={subject.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{subject.name}</span>
                  <span className="text-sm font-bold text-warning">{subject.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
