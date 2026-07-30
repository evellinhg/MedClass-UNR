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
  ChevronDown,
  ChevronUp,
  Loader2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

const SEM_CATEGORIA = "sem_categoria"
const NOTA_CORTE = 60

interface DisciplinaStat {
  disciplina: string
  correct: number
  total: number
}

interface MateriaStat {
  materia: string
  correct: number
  total: number
  porDisciplina: Map<string, { correct: number; total: number }>
}

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

function AttemptTooltip({ active, payload, label, t }: any) {
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
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t.desempenhoEstatisticas.acertos}
          </span>
          <span className="font-mono font-medium text-white">{row.acertos}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-400" /> {t.desempenhoEstatisticas.erros}
          </span>
          <span className="font-mono font-medium text-white">{row.erros}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-400" /> {t.desempenhoEstatisticas.pendentes}
          </span>
          <span className="font-mono font-medium text-white">{row.pendentes}</span>
        </p>
      </div>
      <div className="mt-2 border-t border-white/10 pt-2 text-white/70">
        {row.pontos} pts · {pct}% {t.desempenhoEstatisticas.aproveitamento}
      </div>
    </div>
  )
}

function PieTooltip({ active, payload, t }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-[#c6ff3a]/30 bg-[#170f2e] px-3 py-2 text-xs shadow-[0_0_20px_rgba(198,255,58,0.25)]">
      <p className="flex items-center gap-1.5 font-medium text-white">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        {item.name}
      </p>
      <p className="mt-1 text-white/70">
        {item.value} {t.desempenhoEstatisticas.questoes} · {item.payload.pct}%
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

function SubjectRow({
  subject,
  expanded,
  onToggle,
  alwaysOpen = false,
  t,
}: {
  subject: ReturnType<typeof buildBySubject>[number]
  expanded: boolean
  onToggle: () => void
  alwaysOpen?: boolean
  t: ReturnType<typeof useLanguage>["t"]
}) {
  const aprovado = subject.percentage >= NOTA_CORTE
  const barClass = aprovado ? "bg-success" : "bg-destructive"
  const textClass = aprovado ? "text-success" : "text-destructive"
  const isOpen = alwaysOpen || expanded

  const headerContent = (
    <>
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {!alwaysOpen &&
          subject.disciplinas.length > 0 &&
          (expanded ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ))}
        {subject.name}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t.desempenhoEstatisticas.acertosDeTotal(subject.correct, subject.total)}
        </span>
        <span className={`text-sm font-bold ${textClass}`}>{subject.percentage}%</span>
      </span>
    </>
  )

  return (
    <div>
      {alwaysOpen ? (
        <div className="flex w-full items-center justify-between gap-2 text-left">{headerContent}</div>
      ) : (
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-2 text-left">
          {headerContent}
        </button>
      )}
      <div className="mb-2 mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all ${barClass}`} style={{ width: `${subject.percentage}%` }} />
      </div>

      {isOpen && subject.disciplinas.length > 0 && (
        <div className="ml-5 mt-1 space-y-2 border-l border-border pl-4">
          {subject.disciplinas.map((d) => {
            const label =
              d.disciplina === SEM_CATEGORIA
                ? t.desempenhoEstatisticas.semCategoria
                : t.cronograma.disciplinaBaseLabel[d.disciplina] ?? d.disciplina
            const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
            const disciplinaAprovada = pct >= NOTA_CORTE
            const dBarClass = disciplinaAprovada ? "bg-success" : "bg-destructive"
            const dTextClass = disciplinaAprovada ? "text-success" : "text-destructive"
            return (
              <div key={d.disciplina}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground">{label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {t.desempenhoEstatisticas.acertosDeTotal(d.correct, d.total)}
                    </span>
                    <span className={`text-xs font-semibold ${dTextClass}`}>{pct}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all opacity-70 ${dBarClass}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function buildBySubject(materiaStats: MateriaStat[], t: ReturnType<typeof useLanguage>["t"]) {
  return materiaStats
    .map((m) => {
      const disciplinas: DisciplinaStat[] = Array.from(m.porDisciplina.entries())
        .map(([disciplina, v]) => ({ disciplina, ...v }))
        .sort((a, b) => b.correct / b.total - a.correct / a.total || b.total - a.total)
      return {
        materia: m.materia,
        name: t.cronograma.materiaLabel[m.materia] ?? m.materia,
        percentage: m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0,
        correct: m.correct,
        total: m.total,
        disciplinas,
      }
    })
    .sort((a, b) => b.percentage - a.percentage || b.total - a.total)
}

function disciplinaPct(d: DisciplinaStat) {
  return d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
}

// Uma mesma matéria pode aparecer nos dois lados: em "manda bem" só entram
// as disciplinas com >=60% de acertos (e o percentual do cabeçalho reflete
// só essas), em "precisa melhorar" só as com <60%. Matérias sem disciplina
// própria (sem_categoria) usam o percentual geral da matéria para decidir
// o lado, já que não há o que separar.
function splitBySide(bySubject: ReturnType<typeof buildBySubject>, side: "good" | "bad") {
  return bySubject.flatMap((subject) => {
    if (subject.disciplinas.length === 0) {
      const belongs = side === "good" ? subject.percentage >= NOTA_CORTE : subject.percentage < NOTA_CORTE
      return belongs ? [subject] : []
    }

    const filtered = subject.disciplinas.filter((d) =>
      side === "good" ? disciplinaPct(d) >= NOTA_CORTE : disciplinaPct(d) < NOTA_CORTE
    )
    if (filtered.length === 0) return []

    const correct = filtered.reduce((s, d) => s + d.correct, 0)
    const total = filtered.reduce((s, d) => s + d.total, 0)
    return [
      {
        ...subject,
        disciplinas: filtered,
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    ]
  })
}

export function DesempenhoEstatisticasContent() {
  const { t } = useLanguage()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [materiaStats, setMateriaStats] = useState<MateriaStat[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>("line")
  const [groupBy, setGroupBy] = useState<GroupBy>("tentativa")
  const [activePieIndex, setActivePieIndex] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }

      const [{ data: attemptRows }, { data: simuladoRows }] = await Promise.all([
        supabase
          .from("simulado_attempts")
          .select("id, subject, total_questions, correct_count, wrong_count, points, created_at")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("simulados")
          .select("questao_ids, respostas")
          .eq("user_id", data.user.id)
          .not("finished_at", "is", null),
      ])
      setAttempts((attemptRows as Attempt[]) ?? [])

      // Estatística por matéria é calculada questão a questão (join com a matéria real
      // de cada questão), em vez de usar o campo "subject" da tentativa — esse campo
      // costuma vir com um rótulo único/misturado por sessão, o que fazia "manda bem"
      // e "precisa melhorar" mostrarem os mesmos poucos grupos com o mesmo valor.
      const sessoes = (simuladoRows as { questao_ids: string[]; respostas: (number | null)[] | null }[] | null) ?? []
      const questaoIds = Array.from(new Set(sessoes.flatMap((s) => s.questao_ids ?? [])))

      let infoPorQuestao = new Map<
        string,
        { materia: string | null; disciplina_base: string | null; indice_correta: number }
      >()
      if (questaoIds.length > 0) {
        const { data: questoesRows } = await supabase
          .from("questoes")
          .select("id, materia, disciplina_base, indice_correta")
          .in("id", questaoIds)
        infoPorQuestao = new Map(
          (
            (questoesRows as
              | { id: string; materia: string | null; disciplina_base: string | null; indice_correta: number }[]
              | null) ?? []
          ).map((q) => [q.id, { materia: q.materia, disciplina_base: q.disciplina_base, indice_correta: q.indice_correta }])
        )
      }

      const acumulado = new Map<string, { correct: number; total: number; porDisciplina: Map<string, { correct: number; total: number }> }>()
      for (const sessao of sessoes) {
        const ids = sessao.questao_ids ?? []
        const respostas = sessao.respostas ?? []
        ids.forEach((id, i) => {
          const resposta = respostas[i]
          if (resposta === null || resposta === undefined) return
          const info = infoPorQuestao.get(id)
          if (!info || !info.materia) return
          const acerto = resposta === info.indice_correta

          const atual = acumulado.get(info.materia) ?? { correct: 0, total: 0, porDisciplina: new Map() }
          atual.total += 1
          if (acerto) atual.correct += 1

          const disciplinaKey = info.disciplina_base ?? SEM_CATEGORIA
          const atualDisciplina = atual.porDisciplina.get(disciplinaKey) ?? { correct: 0, total: 0 }
          atualDisciplina.total += 1
          if (acerto) atualDisciplina.correct += 1
          atual.porDisciplina.set(disciplinaKey, atualDisciplina)

          acumulado.set(info.materia, atual)
        })
      }
      setMateriaStats(Array.from(acumulado.entries()).map(([materia, v]) => ({ materia, ...v })))
      setLoading(false)
    })
  }, [])

  const chartData = useMemo(() => {
    if (groupBy === "tentativa") {
      return attempts.map((a, i) => ({
        label: `${t.desempenhoEstatisticas.tentativaLabel} ${i + 1}`,
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
        label = `${t.desempenhoEstatisticas.semanaLabel} ${start.toLocaleDateString(t.desempenhoEstatisticas.localeData, { day: "2-digit", month: "2-digit" })}`
        sortKey = start.getTime()
      } else {
        key = `${date.getFullYear()}-${date.getMonth()}`
        label = date.toLocaleDateString(t.desempenhoEstatisticas.localeData, { month: "short", year: "numeric" })
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
  }, [attempts, groupBy, t])

  const pieData = useMemo(() => {
    const totalAcertos = attempts.reduce((s, a) => s + a.correct_count, 0)
    const totalErros = attempts.reduce((s, a) => s + a.wrong_count, 0)
    const totalQuestoes = attempts.reduce((s, a) => s + a.total_questions, 0)
    const totalPendentes = Math.max(0, totalQuestoes - totalAcertos - totalErros)
    const total = totalAcertos + totalErros + totalPendentes || 1
    return [
      { name: t.desempenhoEstatisticas.acertos, value: totalAcertos, fill: GREEN, pct: Math.round((totalAcertos / total) * 100) },
      { name: t.desempenhoEstatisticas.erros, value: totalErros, fill: RED, pct: Math.round((totalErros / total) * 100) },
      { name: t.desempenhoEstatisticas.pendentes, value: totalPendentes, fill: ORANGE, pct: Math.round((totalPendentes / total) * 100) },
    ]
  }, [attempts, t])

  const bySubject = useMemo(() => buildBySubject(materiaStats, t), [materiaStats, t])

  const topSubjects = splitBySide(bySubject, "good")
  const weakestSubjects = splitBySide(bySubject, "bad")

  const [expandedMaterias, setExpandedMaterias] = useState<Set<string>>(new Set())
  const toggleMateria = (materia: string) =>
    setExpandedMaterias((prev) => {
      const next = new Set(prev)
      if (next.has(materia)) next.delete(materia)
      else next.add(materia)
      return next
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.desempenhoEstatisticas.carregando}
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        {t.desempenhoEstatisticas.vazio}
      </Card>
    )
  }

  const TOGGLES: { type: ChartType; label: string; icon: typeof LineChartIcon; color: string }[] = [
    { type: "line", label: t.desempenhoEstatisticas.linhas, icon: LineChartIcon, color: GREEN },
    { type: "bar", label: t.desempenhoEstatisticas.barras, icon: BarChart3, color: ORANGE },
    { type: "pie", label: t.desempenhoEstatisticas.pizza, icon: PieChartIcon, color: RED },
  ]

  const GROUP_TOGGLES: { value: GroupBy; label: string }[] = [
    { value: "tentativa", label: t.desempenhoEstatisticas.porTreinamento },
    { value: "semana", label: t.desempenhoEstatisticas.semanal },
    { value: "mes", label: t.desempenhoEstatisticas.mensal },
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
            <h3 className="font-semibold text-white">{t.desempenhoEstatisticas.tituloGrafico}</h3>
            <p className="text-xs text-white/60">{t.desempenhoEstatisticas.subtituloGrafico}</p>
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
                  name={t.desempenhoEstatisticas.acertos}
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
                  name={t.desempenhoEstatisticas.erros}
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
                  name={t.desempenhoEstatisticas.pendentes}
                  stroke={ORANGE}
                  strokeWidth={3}
                  dot={{ r: 4, fill: ORANGE, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: ORANGE, style: { filter: GLOW[ORANGE] } }}
                  isAnimationActive
                  animationDuration={700}
                />

                <Tooltip content={<AttemptTooltip t={t} />} />
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} fontSize={11} angle={-20} textAnchor="end" height={50} interval={0} />
                <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} width={28} fontSize={12} />
                <Bar
                  dataKey="acertos"
                  name={t.desempenhoEstatisticas.acertos}
                  fill={GREEN}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[GREEN], stroke: GREEN, strokeWidth: 1 }}
                />
                <Bar
                  dataKey="erros"
                  name={t.desempenhoEstatisticas.erros}
                  fill={RED}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[RED], stroke: RED, strokeWidth: 1 }}
                />
                <Bar
                  dataKey="pendentes"
                  name={t.desempenhoEstatisticas.pendentes}
                  fill={ORANGE}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive
                  animationDuration={700}
                  activeBar={{ filter: GLOW[ORANGE], stroke: ORANGE, strokeWidth: 1 }}
                />

                <Tooltip content={<AttemptTooltip t={t} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
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

                <Tooltip content={<PieTooltip t={t} />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            {t.desempenhoEstatisticas.legendaAcertos}
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RED, boxShadow: `0 0 8px ${RED}` }} />
            {t.desempenhoEstatisticas.legendaErros}
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ORANGE, boxShadow: `0 0 8px ${ORANGE}` }} />
            {t.desempenhoEstatisticas.legendaPendentes}
          </span>
        </div>
      </Card>

      {/* Top vs weak areas */}
      {bySubject.length === 0 ? (
        <Card className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t.desempenhoEstatisticas.semDadosPorMateria}
        </Card>
      ) : (
        <>
          <p className="text-center text-xs text-muted-foreground">{t.desempenhoEstatisticas.notaCorte}</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-success/30 bg-success/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <TrendingUp className="h-5 w-5 text-success" />
                {t.desempenhoEstatisticas.mandaBem}
              </h3>
              {topSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.desempenhoEstatisticas.semAprovadas}</p>
              ) : (
                <div className="space-y-4">
                  {topSubjects.map((subject) => (
                    <SubjectRow
                      key={subject.materia}
                      subject={subject}
                      expanded={expandedMaterias.has(subject.materia)}
                      onToggle={() => toggleMateria(subject.materia)}
                      alwaysOpen
                      t={t}
                    />
                  ))}
                </div>
              )}
            </Card>

            <Card className="border border-destructive/30 bg-destructive/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <TrendingDown className="h-5 w-5 text-destructive" />
                {t.desempenhoEstatisticas.precisaMelhorar}
              </h3>
              {weakestSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.desempenhoEstatisticas.semPendencias}</p>
              ) : (
                <div className="space-y-4">
                  {weakestSubjects.map((subject) => (
                    <SubjectRow
                      key={subject.materia}
                      subject={subject}
                      expanded={expandedMaterias.has(subject.materia)}
                      onToggle={() => toggleMateria(subject.materia)}
                      alwaysOpen
                      t={t}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
