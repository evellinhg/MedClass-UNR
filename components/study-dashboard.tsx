"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  ListChecks,
  Timer,
  Layers,
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleDot,
  Circle,
  Trophy,
  Crown,
  Medal,
  Stethoscope,
  ScanLine,
} from "lucide-react"
import { useLanguage } from "@/lib/i18n"

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

function ChartTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 shadow-xl">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-xs font-semibold text-white">{payload[0].value}{suffix}</p>
    </div>
  )
}

type DashboardT = ReturnType<typeof useLanguage>["t"]["studyDashboard"]

function PerformancePanel({ dt }: { dt: DashboardT }) {
  return (
    <>
      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Target className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.statAproveitamento}</span>
          </div>
          <p className="text-xl font-bold text-white">81%</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.statResolvidas}</span>
          </div>
          <p className="text-xl font-bold text-white">1.240</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.statTempo}</span>
          </div>
          <p className="text-xl font-bold text-white">1m18s</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.statSequencia}</span>
          </div>
          <p className="text-xl font-bold text-white">{dt.statSequenciaValor}</p>
        </div>
      </div>

      {/* Evolution area chart */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-white/40">{dt.evolucaoTitulo}</p>
          <span className="text-[11px] text-[#bef264]/70">{dt.metaLabel}: {META}%</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c6ff3a" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
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
              <Tooltip content={<ChartTooltip suffix={dt.tooltipSufixo} />} cursor={{ stroke: "rgba(198,255,58,0.3)" }} />
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
        <p className="text-xs font-medium text-white/40">{dt.desempenhoPorArea}</p>
        {dt.subjects.slice(0, 4).map((subject, i) => {
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
                      ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16]"
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

function CronogramaPanel({ dt }: { dt: DashboardT }) {
  const items = dt.slides.cronograma.items

  const statusStyle: Record<string, { icon: typeof Circle; className: string }> = {
    "Concluído": { icon: CircleCheck, className: "text-green-400/80" },
    "Completado": { icon: CircleCheck, className: "text-green-400/80" },
    "Hoje": { icon: CircleDot, className: "text-[#bef264]" },
    "Hoy": { icon: CircleDot, className: "text-[#bef264]" },
    "Pendente": { icon: Circle, className: "text-white/25" },
    "Pendiente": { icon: Circle, className: "text-white/25" },
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const style = statusStyle[item.status] ?? { icon: Circle, className: "text-white/25" }
        const StatusIcon = style.icon
        const isToday = item.status === "Hoje" || item.status === "Hoy"
        return (
          <div
            key={item.day}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              isToday ? "border-[#c6ff3a]/30 bg-[#c6ff3a]/10" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <StatusIcon className={`h-4 w-4 shrink-0 ${style.className}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white/80">{item.day}</p>
              <p className="truncate text-[11px] text-white/40">{item.subject}</p>
            </div>
            <span className={`shrink-0 text-[11px] font-medium ${style.className}`}>{item.status}</span>
          </div>
        )
      })}
    </div>
  )
}

function RankingPanel({ dt }: { dt: DashboardT }) {
  const items = dt.slides.ranking.items
  const medalStyles = [
    { ring: "from-amber-400 to-yellow-500", icon: Crown },
    { ring: "from-slate-300 to-slate-400", icon: Medal },
    { ring: "from-amber-700 to-amber-800", icon: Medal },
  ]

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const medal = medalStyles[i]
        const MedalIcon = medal?.icon
        return (
          <div
            key={item.nome}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
          >
            {medal ? (
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${medal.ring} text-[#0a1f00]`}
              >
                <MedalIcon className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-white/40">
                {i + 1}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/80">{item.nome}</span>
            <span className="shrink-0 text-xs font-semibold text-[#bef264]">{item.pontos} pts</span>
          </div>
        )
      })}
    </div>
  )
}

function DesafiosPanel({ dt }: { dt: DashboardT }) {
  const d = dt.slides.desafios

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="relative h-36 w-full">
        <Image src="/desafios-clinicos/caso-01.jpg" alt={d.tituloCaso} fill className="object-cover" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-[#c6ff3a] backdrop-blur-sm">
          <ScanLine className="h-3 w-3" />
          {d.secaoLabel}
        </span>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-white/80">{d.tituloCaso}</p>
        <p className="mt-0.5 text-[11px] text-white/40">{d.descricaoCaso}</p>
      </div>
    </div>
  )
}

function SimuladoPanel({ dt }: { dt: DashboardT }) {
  return (
    <>
      {/* Config summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.nivel}</span>
          </div>
          <p className="text-sm font-bold text-white">{dt.aleatorio}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <ListChecks className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.prova}</span>
          </div>
          <p className="text-sm font-bold text-white">UNR</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Target className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.questoesLabel}</span>
          </div>
          <p className="text-sm font-bold text-white">{dt.questoesValor}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-white/40">
            <Timer className="h-3.5 w-3.5" />
            <span className="text-[11px]">{dt.cronometro}</span>
          </div>
          <p className="text-sm font-bold text-white">{dt.ativado}</p>
        </div>
      </div>

      {/* Area selection chips */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-medium text-white/40">{dt.areasSelecionadas}</p>
        <div className="flex flex-wrap gap-2">
          {dt.simuladoAreas.map((area) => (
            <span
              key={area.name}
              className={
                area.selected
                  ? "rounded-full border border-[#c6ff3a]/40 bg-[#c6ff3a]/15 px-3 py-1.5 text-xs font-medium text-[#0a1f00]"
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
          <span className="text-white/40">{dt.montandoSimulado}</span>
          <span className="text-[#bef264]/70">{dt.resumoContagem}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] py-3 text-sm font-semibold text-[#0a1f00] shadow-lg shadow-[#c6ff3a]/20">
        {dt.iniciarSimulado}
        <ArrowRight className="h-4 w-4" />
      </button>
    </>
  )
}

export function StudyDashboard() {
  const { t } = useLanguage()
  const dt = t.studyDashboard

  const slides = [
    {
      key: "desempenho",
      icon: TrendingUp,
      title: t.dashboardNav.desempenho,
      subtitle: dt.slide1Subtitle,
      badge: dt.slide1Badge,
      Panel: () => <PerformancePanel dt={dt} />,
    },
    {
      key: "cronograma",
      icon: CalendarDays,
      title: t.dashboardNav.cronograma,
      subtitle: dt.slides.cronograma.subtitle,
      badge: dt.slides.cronograma.badge,
      Panel: () => <CronogramaPanel dt={dt} />,
    },
    {
      key: "treinamento",
      icon: ListChecks,
      title: t.dashboardNav.treinamentos,
      subtitle: dt.slide2Subtitle,
      badge: dt.slide2Badge,
      Panel: () => <SimuladoPanel dt={dt} />,
    },
    {
      key: "ranking",
      icon: Trophy,
      title: t.dashboardNav.ranking,
      subtitle: dt.slides.ranking.subtitle,
      badge: dt.slides.ranking.badge,
      Panel: () => <RankingPanel dt={dt} />,
    },
    {
      key: "desafios",
      icon: Stethoscope,
      title: t.dashboardNav.desafiosClinicos,
      subtitle: dt.slides.desafios.subtitle,
      badge: dt.slides.desafios.badge,
      Panel: () => <DesafiosPanel dt={dt} />,
    },
  ]

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    if (index >= slides.length) setIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length])

  const slide = slides[index]
  const Panel = slide.Panel

  return (
    <motion.div
      layout
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-sm"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        <div className="mx-auto flex h-1.5 w-40 items-center rounded-full bg-white/5">
          <span className="ml-1 h-1 w-1 rounded-full bg-[#c6ff3a]" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/5 bg-white/[0.015] py-4 sm:w-48 sm:items-stretch sm:px-3">
          {slides.map((s, i) => {
            const ItemIcon = s.icon
            const active = i === index
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-medium transition-colors sm:justify-start ${
                  active
                    ? "bg-[#c6ff3a]/15 text-[#c6ff3a]"
                    : "text-white/40 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate whitespace-nowrap sm:inline">{s.title}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 p-5 sm:p-6 min-h-[440px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.key}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{slide.title}</p>
                  <p className="text-xs text-white/40">{slide.subtitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#c6ff3a]/10 px-2.5 py-1 text-xs font-medium text-[#bef264]">
                  <TrendingUp className="h-3 w-3" />
                  {slide.badge}
                </span>
              </div>

              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
