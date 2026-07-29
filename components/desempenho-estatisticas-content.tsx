"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  BarChart3,
  Loader2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"

const GREEN = "#22c55e" // Acertos / concluído
const RED = "#ef4444" // Erros / atenção
const ORANGE = "#f97316" // Pendentes / em andamento

const GLOW = {
  [GREEN]: "url(#glow-green)",
  [RED]: "url(#glow-red)",
  [ORANGE]: "url(#glow-orange)",
} as const

type ChartType = "line" | "bar" | "pie"
type GroupBy = "tentativa" | "semana" | "mes"

interface Attempt {
  id: string
  subject: string | null
  total_questions: number
  correct_count: number
  wrong_count: number
  points: number
  created_at: string
}

function GlowDefs() {
  return (
    <svg width={0} height={0} className="absolute">
      <defs>
        {[
          ["glow-green", GREEN],
          ["glow-red", RED],
          ["glow-orange", ORANGE],
        ].map(([id]) => (
          <filter key={id} id={id} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
    </svg>
  )
}

function AttemptTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  const total = row.acertos + row.erros + row.pendentes
  const pct = total > 0 ? Math.round((row.acertos / total) * 100) : 0
  return (
    <div className="min-w-[10rem] rounded-lg border border-[#c6ff3a]/30 bg-[#170f2e] p-3 text-xs shadow-[0_0_20px_rgba(198,255,58,0.25)]">
      <p className="mb-2 font-semibold text-white">{label}</p>
      <div className="space-y-1">
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Acertos
          </span>
          <span className="font-mono font-medium text-white">{row.acertos}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Erros
          </span>
          <span className="font-mono font-medium text-white">{row.erros}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-400" /> Pendentes
          </span>
          <span className="font-mono font-medium text-white">{row.pendentes}</span>
        </p>
      </div>
      <div className="mt-2 border-t border-white/10 pt-2 text-white/70">
        {row.pontos} pts · {pct}% de aproveitamento
      </div>
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-[#c6ff3a]/30 bg-[#170f2e] px-3 py-2 text-xs shadow-[0_0_20px_rgba(198,255,58,0.25)]">
      <p className="flex items-center gap-1.5 font-medium text-white">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        {item.name}
      </p>
      <p className="mt-1 text-white/70">
        {item.value} questões · {item.payload.pct}%
      </p>
    </div>
  )
}

function renderActivePieShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter={GLOW[fill as keyof typeof GLOW]}
      />
    </g>
  )
}

export function DesempenhoEstatisticasContent() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>("line")
  const [groupBy, setGroupBy] = useState<GroupBy>("tentativa")
  const [activePieIndex, setActivePieIndex] = useState(0)

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

  const chartData = useMemo(() => {
    if (groupBy === "tentativa") {
      return attempts.map((a, i) => ({
        label: `Treinamento ${i + 1}`,
        acertos: a.correct_count,
        erros: a.wrong_count,
        pendentes: Math.max(0, a.total_questions - a.correct_count - a.wrong_count),
        pontos: a.points,
      }))
    }

    const startOfWeek = (d: Date) => {
      const date = new Date(d)
      const day = date.getDay()
      const diff = (day === 0 ? -6 : 1) - day
      date.setDate(date.getDate() + diff)
      date.setHours(0, 0, 0, 0)
      return date
    }

    const groups = new Map<
      string,
      { label: string; sortKey: number; acertos: number; erros: number; pendentes: number; pontos: number }
    >()

    for (const a of attempts) {
      const date = new Date(a.created_at)
      let key: string
      let label: string
      let sortKey: number

      if (groupBy === "semana") {
        const start = startOfWeek(date)
        key = start.toISOString().slice(0, 10)
        label = `Sem ${start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`
        sortKey = start.getTime()
      } else {
        key = `${date.getFullYear()}-${date.getMonth()}`
        label = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
        sortKey = date.getFullYear() * 12 + date.getMonth()
      }

      const existing = groups.get(key) ?? { label, sortKey, acertos: 0, erros: 0, pendentes: 0, pontos: 0 }
      existing.acertos += a.correct_count
      existing.erros += a.wrong_count
      existing.pendentes += Math.max(0, a.total_questions - a.correct_count - a.wrong_count)
      existing.pontos += a.points
      groups.set(key, existing)
    }

    return Array.from(groups.values()).sort((a, b) => a.sortKey - b.sortKey)
  }, [attempts, groupBy])

  const pieData = useMemo(() => {
    const totalAcertos = attempts.reduce((s, a) => s + a.correct_count, 0)
    const totalErros = attempts.reduce((s, a) => s + a.wrong_count, 0)
    const totalQuestoes = attempts.reduce((s, a) => s + a.total_questions, 0)
    const totalPendentes = Math.max(0, totalQuestoes - totalAcertos - totalErros)
    const total = totalAcertos + totalErros + totalPendentes || 1
    return [
      { name: "Acertos", value: totalAcertos, fill: GREEN, pct: Math.round((totalAcertos / total) * 100) },
      { name: "Erros", value: totalErros, fill: RED, pct: Math.round((totalErros / total) * 100) },
      { name: "Pendentes", value: totalPendentes, fill: ORANGE, pct: Math.round((totalPendentes / total) * 100) },
    ]
  }, [attempts])

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

  const TOGGLES: { type: ChartType; label: string; icon: typeof LineChartIcon; color: string }[] = [
    { type: "line", label: "Linhas", icon: LineChartIcon, color: GREEN },
    { type: "bar", label: "Barras", icon: BarChart3, color: ORANGE },
    { type: "pie", label: "Pizza", icon: PieChartIcon, color: RED },
  ]

  const GROUP_TOGGLES: { value: GroupBy; label: string }[] = [
    { value: "tentativa", label: "Por treinamento" },
    { value: "semana", label: "Semanal" },
    { value: "mes", label: "Mensal" },
  ]

  return (
    <div className="space-y-6">
      {/* Super chart: desempenho por tentativa */}
      <Card className="relative overflow-hidden border border-[#c6ff3a]/20 bg-gradient-to-br from-[#0f1a06] via-[#16260a] to-[#080c04] p-6">
        <GlowDefs />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c6ff3a]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#84cc16]/10 blur-3xl" />

        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Desempenho por Tentativa</h3>
            <p className="text-xs text-white/60">Acertos, erros e pendências — a mesma informação, três visões.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
            {TOGGLES.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                style={
                  {
                    "--glow": `${color}80`,
                  } as CSSProperties
                }
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:shadow-[0_0_16px_var(--glow)] ${
                  chartType === type ? "text-white" : "text-white/60 hover:text-white"
                }`}
                >
                <Icon className="h-3.5 w-3.5" style={{ color: chartType === type ? color : undefined }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {chartType !== "pie" && (
          <div className="relative mb-4 flex items-center gap-2">
            {GROUP_TOGGLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setGroupBy(value)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all hover:shadow-[0_0_14px_rgba(198,255,58,0.5)] ${
                  groupBy === value
                    ? "border-primary bg-primary/20 text-[#bef264]"
                    : "border-white/10 text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div key={`${chartType}-${groupBy}`} className="relative h-80 w-full animate-in fade-in zoom-in-95 duration-500">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} fontSize={11} angle={-20} textAnchor="end" height={50} interval={0} />
                <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} width={28} fontSize={12} />
                <Line
                  type="monotone"
                  dataKey="acertos"
                  name="Acertos"
                  stroke={GREEN}
                  strokeWidth={3}
                  dot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: GREEN, style: { filter: GLOW[GREEN] } }}
                  isAnimationActive
                  animationDuration={700}
                />
                <Line
                  type="monotone"
                  dataKey="erros"
                  name="Erros"
                  stroke={RED}
                  strokeWidth={3}
                  dot={{ r: 4, fill: RED, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: RED, style: { filter: GLOW[RED] } }}
                  isAnimationActive
                  animationDuration={700}
                />
                <Line
                  type="monotone"
                  dataKey="pendentes"
                  name="Pendentes"
                  stroke={ORANGE}
                  strokeWidth={3}
                  dot={{ r: 4, fill: ORANGE, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: ORANGE, style: { filter: GLOW[ORANGE] } }}
                  isAnimationActive
                  animationDuration={700}
                />
                
                <Tooltip content={<AttemptTooltip />} />
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} fontSize={11} angle={-20} textAnchor="end" height={50} interval={0} />
                <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} width={28} fontSize={12} />
                <Bar
                  dataKey="acertos"
                  name="Acertos"
                  fill={GREEN}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[GREEN], stroke: GREEN, strokeWidth: 1 }}
                />
                <Bar
                  dataKey="erros"
                  name="Erros"
                  fill={RED}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[RED], stroke: RED, strokeWidth: 1 }}
                />
                <Bar
                  dataKey="pendentes"
                  name="Pendentes"
                  fill={ORANGE}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[ORANGE], stroke: ORANGE, strokeWidth: 1 }}
                />
                
                <Tooltip content={<AttemptTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={104}
                  paddingAngle={4}
                  isAnimationActive
                  animationDuration={700}
                  activeIndex={activePieIndex}
                  activeShape={renderActivePieShape}
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            Acertos / Concluído
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RED, boxShadow: `0 0 8px ${RED}` }} />
            Erros / Atenção
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ORANGE, boxShadow: `0 0 8px ${ORANGE}` }} />
            Pendentes / Em andamento
          </span>
        </div>
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
                    style={{ width: `${subject.percentage}%`, backgroundColor: GREEN }}
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
