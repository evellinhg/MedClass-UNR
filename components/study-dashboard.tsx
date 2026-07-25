"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Stethoscope,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Trophy,
  ListChecks,
  Timer,
  Layers,
  Crown,
  Medal,
  ArrowRight,
} from "lucide-react"

const subjects = [
  { name: "Clínica Médica", score: 82, questions: 320 },
  { name: "Cirurgia", score: 74, questions: 260 },
  { name: "Pediatria", score: 91, questions: 210 },
  { name: "Ginecologia", score: 68, questions: 180 },
  { name: "Preventiva", score: 88, questions: 270 },
]

const evolution = [
  { label: "Sim. 1", score: 58 },
  { label: "Sim. 2", score: 63 },
  { label: "Sim. 3", score: 61 },
  { label: "Sim. 4", score: 72 },
  { label: "Sim. 5", score: 76 },
  { label: "Sim. 6", score: 74 },
  { label: "Sim. 7", score: 81 },
]

const META = 70

const simuladoAreas = [
  { name: "Clínica Médica", selected: true },
  { name: "Cirurgia", selected: true },
  { name: "Pediatria", selected: true },
  { name: "Ginecologia", selected: false },
  { name: "Preventiva", selected: false },
]

const ranking = [
  { rank: 1, name: "Leonardo A.", area: "Clínica Médica", points: 1420 },
  { rank: 2, name: "Mariana S.", area: "Pediatria", points: 1305 },
  { rank: 3, name: "Gabriel O.", area: "Cirurgia", points: 1240 },
  { rank: 4, name: "Camila R.", area: "Ginecologia", points: 1120 },
  { rank: 5, name: "Rafael M.", area: "Preventiva", points: 1080 },
]

const rankStyles: Record<number, { bg: string; text: string; icon?: typeof Crown }> = {
  1: { bg: "bg-amber-400/15", text: "text-amber-300", icon: Crown },
  2: { bg: "bg-slate-300/15", text: "text-slate-200", icon: Medal },
  3: { bg: "bg-orange-400/15", text: "text-orange-300", icon: Medal },
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 shadow-xl">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-xs font-semibold text-white">{payload[0].value}% de acerto</p>
    </div>
  )
}

function PerformancePanel() {
  return (
    <>
      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Target className="h-3.5 w-3.5" />
            <span className="text-[11px]">Aproveit.</span>
          </div>
          <p className="text-xl font-bold text-white">81%</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">Resolvidas</span>
          </div>
          <p className="text-xl font-bold text-white">1.240</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[11px]">Tempo/questão</span>
          </div>
          <p className="text-xl font-bold text-white">1m18s</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-[11px]">Ranking</span>
          </div>
          <p className="text-xl font-bold text-white">Top 8%</p>
        </div>
      </div>

      {/* Evolution area chart */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-white/40">Evolução por simulado</p>
          <span className="text-[11px] text-indigo-300/70">Meta: {META}%</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[40, 100]}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(139,92,246,0.3)" }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#scoreFill)"
                dot={{ r: 2.5, fill: "#a78bfa", strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "#c4b5fd" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart by subject */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/40">Desempenho por área</p>
        {subjects.slice(0, 4).map((subject, i) => {
          const aboveTarget = subject.score >= META
          return (
            <div key={subject.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">{subject.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{subject.questions}q</span>
                  <span className={`font-medium ${aboveTarget ? "text-green-400/80" : "text-amber-400/80"}`}>
                    {subject.score}%
                  </span>
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="absolute inset-y-0 z-10 w-px bg-white/25"
                  style={{ left: `${META}%` }}
                  aria-hidden="true"
                />
                <motion.div
                  className={`h-full rounded-full ${
                    aboveTarget
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                      : "bg-gradient-to-r from-amber-500/80 to-orange-500/80"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.score}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function SimuladoPanel() {
  return (
    <>
      {/* Config summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-[11px]">Nível</span>
          </div>
          <p className="text-sm font-bold text-white">Aleatório</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <ListChecks className="h-3.5 w-3.5" />
            <span className="text-[11px]">Prova</span>
          </div>
          <p className="text-sm font-bold text-white">ENAMED</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Target className="h-3.5 w-3.5" />
            <span className="text-[11px]">Questões</span>
          </div>
          <p className="text-sm font-bold text-white">30</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Timer className="h-3.5 w-3.5" />
            <span className="text-[11px]">Cronômetro</span>
          </div>
          <p className="text-sm font-bold text-white">Ativado</p>
        </div>
      </div>

      {/* Area selection chips */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-white/40">Áreas selecionadas</p>
        <div className="flex flex-wrap gap-2">
          {simuladoAreas.map((area) => (
            <span
              key={area.name}
              className={
                area.selected
                  ? "rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-200"
                  : "rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/30"
              }
            >
              {area.name}
            </span>
          ))}
        </div>
      </div>

      {/* Generating progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-white/40">Montando seu simulado</span>
          <span className="text-indigo-300/70">3 áreas · 30 questões</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
        Iniciar Simulado
        <ArrowRight className="h-4 w-4" />
      </button>
    </>
  )
}

function RankingPanel() {
  const top = ranking[0].points
  return (
    <div className="space-y-3">
      {ranking.map((student) => {
        const style = rankStyles[student.rank]
        const RankIcon = style?.icon
        return (
          <div
            key={student.rank}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                style ? `${style.bg} ${style.text}` : "bg-white/5 text-white/40"
              }`}
            >
              {RankIcon ? <RankIcon className="h-4 w-4" /> : student.rank}
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white">
              {student.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/80">{student.name}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(student.points / top) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            <p className="shrink-0 text-sm font-bold text-white">{student.points}</p>
          </div>
        )
      })}
    </div>
  )
}

const slides = [
  {
    key: "performance",
    icon: Stethoscope,
    title: "Análise de Desempenho",
    subtitle: "Enamed · Ciclo 2025",
    badge: "+12%",
    Panel: PerformancePanel,
  },
  {
    key: "simulado",
    icon: ListChecks,
    title: "Crie seu Simulado",
    subtitle: "Personalizado para você",
    badge: "Novo",
    Panel: SimuladoPanel,
  },
  {
    key: "ranking",
    icon: Trophy,
    title: "Ranking dos Aprovados",
    subtitle: "Melhores da semana",
    badge: "Ao vivo",
    Panel: RankingPanel,
  },
]

export function StudyDashboard() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(id)
  }, [paused])

  const slide = slides[index]
  const Icon = slide.icon
  const Panel = slide.Panel

  return (
    <motion.div
      layout
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{slide.title}</p>
                <p className="text-xs text-white/40">{slide.subtitle}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
              <TrendingUp className="h-3 w-3" />
              {slide.badge}
            </span>
          </div>

          <Panel />
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.key}
            aria-label={s.title}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-indigo-400" : "w-1.5 bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
