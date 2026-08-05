"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import {
  BookOpen,
  ClipboardList,
  Target,
  Users2,
  Layers,
  Sparkles,
  PlayCircle,
  FileText,
  Stethoscope,
  MessageSquareText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { IconChip } from "@/components/ui/icon-chip"

const DIAS_TENDENCIA = 30
const DIAS_SPARKLINE = 14

interface StatDef {
  label: string
  table: string
  icon: typeof BookOpen
  gradient: string
  shadow: string
  stroke: string
  fill: string
}

const STATS: StatDef[] = [
  { label: "Questões cadastradas", table: "questoes", icon: BookOpen, gradient: "from-violet-400 to-purple-600", shadow: "shadow-purple-900/30", stroke: "#a78bfa", fill: "#a78bfa" },
  { label: "Usuários", table: "profiles", icon: Users2, gradient: "from-sky-400 to-blue-600", shadow: "shadow-blue-900/30", stroke: "#60a5fa", fill: "#60a5fa" },
  { label: "Tentativas", table: "simulado_attempts", icon: ClipboardList, gradient: "from-emerald-400 to-green-600", shadow: "shadow-emerald-900/30", stroke: "#34d399", fill: "#34d399" },
  { label: "Simulados", table: "simulados", icon: Target, gradient: "from-amber-400 to-orange-600", shadow: "shadow-amber-900/30", stroke: "#fbbf24", fill: "#fbbf24" },
]

const CONTENT_STATS: { label: string; table: string; icon: typeof BookOpen; gradient: string; shadow: string }[] = [
  { label: "Decks de flashcards", table: "materiais_flashcard_decks", icon: Layers, gradient: "from-violet-400 to-purple-600", shadow: "shadow-purple-900/30" },
  { label: "Cartões de flashcards", table: "materiais_flashcards", icon: Sparkles, gradient: "from-fuchsia-400 to-pink-600", shadow: "shadow-pink-900/30" },
  { label: "Videoaulas / playlists", table: "materiais_videoaulas", icon: PlayCircle, gradient: "from-red-400 to-rose-600", shadow: "shadow-red-900/30" },
  { label: "Resumos", table: "materiais_resumos", icon: FileText, gradient: "from-cyan-400 to-teal-600", shadow: "shadow-teal-900/30" },
  { label: "Desafios clínicos", table: "desafios_clinicos", icon: Stethoscope, gradient: "from-teal-400 to-emerald-600", shadow: "shadow-emerald-900/30" },
]

const PLANO_LABEL: Record<string, string> = { gratis: "Gratuito", mensal: "Mensal", trimestral: "Trimestral", vip: "VIP" }
const PLANO_COR: Record<string, string> = { gratis: "#64748b", mensal: "#60a5fa", trimestral: "#a78bfa", vip: "#fbbf24" }

const DIFICULDADE_LABEL: Record<string, string> = { "fácil": "Fácil", "médio": "Médio", "difícil": "Difícil" }
const DIFICULDADE_COR: Record<string, string> = { "fácil": "#10b981", "médio": "#f59e0b", "difícil": "#f43f5e" }

function diaKey(iso: string) {
  return iso.slice(0, 10)
}

function bucketPorDia(rows: { created_at: string }[], dias: number) {
  const buckets = new Map<string, number>()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }
  for (const r of rows) {
    const key = diaKey(r.created_at)
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return Array.from(buckets.entries()).map(([data, total]) => ({ data, total }))
}

function variacaoPercentual(serie: { total: number }[]) {
  const metade = Math.floor(serie.length / 2)
  const anterior = serie.slice(0, metade).reduce((s, x) => s + x.total, 0)
  const recente = serie.slice(metade).reduce((s, x) => s + x.total, 0)
  if (anterior === 0) return recente > 0 ? 100 : 0
  return Math.round(((recente - anterior) / anterior) * 100)
}

function SparklineTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md">
      {new Date(`${row.data}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · {row.total}
    </div>
  )
}

export function AdminOverviewContent() {
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [recentQuestoes, setRecentQuestoes] = useState<any[]>([])
  const [depoimentosPendentes, setDepoimentosPendentes] = useState<number | null>(null)
  const [seriesPorTabela, setSeriesPorTabela] = useState<Record<string, { data: string; total: number }[]>>({})
  const [planoDist, setPlanoDist] = useState<{ chave: string; total: number }[]>([])
  const [dificuldadeDist, setDificuldadeDist] = useState<{ chave: string; total: number }[]>([])
  const [loadingCharts, setLoadingCharts] = useState(true)

  useEffect(() => {
    supabase
      .from("questoes")
      .select("id, enunciado, materia, dificuldade, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentQuestoes(data ?? []))

    const statsParaBuscar = [...STATS, ...CONTENT_STATS]
    statsParaBuscar.forEach(async (stat) => {
      const { count, error } = await supabase.from(stat.table).select("*", { count: "exact", head: true })
      setCounts((prev) => ({ ...prev, [stat.table]: error ? null : count ?? 0 }))
    })

    supabase
      .from("depoimentos")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente")
      .then(({ count, error }) => setDepoimentosPendentes(error ? null : count ?? 0))

    const desde = new Date()
    desde.setDate(desde.getDate() - DIAS_TENDENCIA)
    const desdeIso = desde.toISOString()

    Promise.all(STATS.map((s) => supabase.from(s.table).select("created_at").gte("created_at", desdeIso))).then(
      (resultados) => {
        const series: Record<string, { data: string; total: number }[]> = {}
        resultados.forEach((res, i) => {
          series[STATS[i].table] = bucketPorDia((res.data as { created_at: string }[]) ?? [], DIAS_TENDENCIA)
        })
        setSeriesPorTabela(series)
        setLoadingCharts(false)
      }
    )

    supabase
      .from("profiles")
      .select("plan")
      .then(({ data }) => {
        const contagem = new Map<string, number>()
        for (const row of (data as { plan: string | null }[] | null) ?? []) {
          const chave = row.plan ?? "gratis"
          contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
        }
        setPlanoDist(Array.from(contagem.entries()).map(([chave, total]) => ({ chave, total })))
      })

    supabase
      .from("questoes")
      .select("dificuldade")
      .then(({ data }) => {
        const contagem = new Map<string, number>()
        for (const row of (data as { dificuldade: string | null }[] | null) ?? []) {
          const chave = row.dificuldade ?? "—"
          contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
        }
        setDificuldadeDist(Array.from(contagem.entries()).map(([chave, total]) => ({ chave, total })))
      })
  }, [])

  const tendenciaCombinada = useMemo(() => {
    const usuarios = seriesPorTabela["profiles"]
    const tentativas = seriesPorTabela["simulado_attempts"]
    if (!usuarios || !tentativas) return []
    return usuarios.map((u, i) => ({
      data: u.data,
      novosAlunos: u.total,
      treinosRealizados: tentativas[i]?.total ?? 0,
    }))
  }, [seriesPorTabela])

  function renderStatCard(stat: StatDef) {
    const Icon = stat.icon
    const value = counts[stat.table]
    const serieCompleta = seriesPorTabela[stat.table]
    const sparkline = serieCompleta?.slice(-DIAS_SPARKLINE)
    const variacao = serieCompleta ? variacaoPercentual(serieCompleta) : 0
    const subiu = variacao >= 0

    return (
      <Card key={stat.table} className="overflow-hidden border border-border bg-card p-0">
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {value === undefined ? "…" : value === null ? "—" : value.toLocaleString("pt-BR")}
            </p>
            {value === null && <p className="mt-1 text-[11px] text-muted-foreground">tabela não encontrada</p>}
            {serieCompleta && (
              <p className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${subiu ? "text-success" : "text-destructive"}`}>
                {subiu ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(variacao)}% nos últimos {DIAS_TENDENCIA} dias
              </p>
            )}
          </div>
          <IconChip icon={Icon} className={`bg-gradient-to-br ${stat.gradient} ${stat.shadow}`} />
        </div>
        <div className="h-12 w-full">
          {sparkline && sparkline.some((s) => s.total > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${stat.table}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stat.fill} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={stat.fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={stat.stroke}
                  strokeWidth={2}
                  fill={`url(#spark-${stat.table})`}
                  isAnimationActive={false}
                />
                <Tooltip content={<SparklineTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-muted/20" />
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">{STATS.map(renderStatCard)}</div>

      {/* Tendência da plataforma */}
      <Card className="relative overflow-hidden border border-[#c6ff3a]/20 bg-gradient-to-br from-[#0f1a06] via-[#16260a] to-[#080c04] p-6">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c6ff3a]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#84cc16]/10 blur-3xl" />
        <div className="relative mb-5 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#c6ff3a]" />
          <h3 className="font-semibold text-white">Atividade da plataforma</h3>
          <span className="text-xs text-white/50">últimos {DIAS_TENDENCIA} dias</span>
        </div>
        <div className="relative h-72 w-full">
          {loadingCharts ? (
            <div className="flex h-full items-center justify-center text-sm text-white/40">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendenciaCombinada} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="data"
                  stroke="rgba(255,255,255,0.5)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => new Date(`${v}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  interval={4}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="min-w-[9rem] rounded-lg border border-[#c6ff3a]/30 bg-[#170f2e] p-3 text-xs shadow-[0_0_20px_rgba(198,255,58,0.25)]">
                        <p className="mb-2 font-semibold text-white">
                          {new Date(`${label}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </p>
                        {payload.map((p: any) => (
                          <p key={p.dataKey} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5" style={{ color: p.stroke }}>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                              {p.dataKey === "novosAlunos" ? "Novos alunos" : "Treinos realizados"}
                            </span>
                            <span className="font-mono font-medium text-white">{p.value}</span>
                          </p>
                        ))}
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="novosAlunos" name="Novos alunos" stroke="#60a5fa" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="treinosRealizados" name="Treinos realizados" stroke="#c6ff3a" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="relative mt-4 flex items-center justify-center gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#60a5fa", boxShadow: "0 0 8px #60a5fa" }} />
            Novos alunos
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#c6ff3a", boxShadow: "0 0 8px #c6ff3a" }} />
            Treinos realizados
          </span>
        </div>
      </Card>

      {/* Distribuições */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Questões por dificuldade</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dificuldadeDist} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="chave"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => DIFICULDADE_LABEL[v] ?? v}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, _name, item: any) => [value, DIFICULDADE_LABEL[item.payload.chave] ?? item.payload.chave]}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={64}>
                  {dificuldadeDist.map((d) => (
                    <Cell key={d.chave} fill={DIFICULDADE_COR[d.chave] ?? "var(--muted-foreground)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Alunos por plano</h3>
          <div className="flex h-56 w-full items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planoDist} dataKey="total" nameKey="chave" innerRadius={56} outerRadius={90} paddingAngle={3}>
                  {planoDist.map((p) => (
                    <Cell key={p.chave} fill={PLANO_COR[p.chave] ?? "#64748b"} stroke="rgba(0,0,0,0.2)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, _name, item: any) => [value, PLANO_LABEL[item.payload.chave] ?? item.payload.chave]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-2 space-y-2">
              {planoDist.map((p) => (
                <span key={p.chave} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PLANO_COR[p.chave] ?? "#64748b" }} />
                  {PLANO_LABEL[p.chave] ?? p.chave}
                  <span className="font-medium text-foreground">{p.total}</span>
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Conteúdo da plataforma
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_STATS.map((stat) => {
            const Icon = stat.icon
            const value = counts[stat.table]
            return (
              <Card key={stat.table} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    <p className="mt-3 text-2xl font-bold text-foreground">
                      {value === undefined ? "…" : value === null ? "—" : value.toLocaleString("pt-BR")}
                    </p>
                    {value === null && <p className="mt-1 text-[11px] text-muted-foreground">tabela não encontrada</p>}
                  </div>
                  <IconChip icon={Icon} className={`bg-gradient-to-br ${stat.gradient} ${stat.shadow}`} />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {depoimentosPendentes !== null && depoimentosPendentes > 0 && (
        <Link href="/admin/depoimentos">
          <Card className="flex items-center justify-between border border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <IconChip icon={MessageSquareText} size="sm" className="bg-gradient-to-br from-lime-400 to-green-600 shadow-green-900/30" />
              <p className="text-sm font-medium text-foreground">
                {depoimentosPendentes} depoimento{depoimentosPendentes > 1 ? "s" : ""} aguardando moderação
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        </Link>
      )}

      <Card className="border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground">Questões recentes</h3>
        {recentQuestoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma questão cadastrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentQuestoes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{q.enunciado}</p>
                  <p className="text-xs text-muted-foreground">{q.materia}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${DIFICULDADE_COR[q.dificuldade] ?? "var(--muted-foreground)"}22`,
                    color: DIFICULDADE_COR[q.dificuldade] ?? "var(--muted-foreground)",
                  }}
                >
                  {q.dificuldade}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
