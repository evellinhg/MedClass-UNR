"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"

interface StatDef {
  label: string
  table: string
  icon: typeof BookOpen
  bgColor: string
}

const STATS: StatDef[] = [
  { label: "Questões cadastradas", table: "questoes", icon: BookOpen, bgColor: "bg-purple-500/10" },
  { label: "Usuários", table: "profiles", icon: Users2, bgColor: "bg-blue-500/10" },
  { label: "Tentativas", table: "simulado_attempts", icon: ClipboardList, bgColor: "bg-emerald-500/10" },
  { label: "Simulados", table: "simulados", icon: Target, bgColor: "bg-amber-500/10" },
]

const CONTENT_STATS: StatDef[] = [
  { label: "Decks de flashcards", table: "materiais_flashcard_decks", icon: Layers, bgColor: "bg-violet-500/10" },
  { label: "Cartões de flashcards", table: "materiais_flashcards", icon: Sparkles, bgColor: "bg-pink-500/10" },
  { label: "Videoaulas / playlists", table: "materiais_videoaulas", icon: PlayCircle, bgColor: "bg-red-500/10" },
  { label: "Resumos", table: "materiais_resumos", icon: FileText, bgColor: "bg-cyan-500/10" },
  { label: "Desafios clínicos", table: "desafios_clinicos", icon: Stethoscope, bgColor: "bg-teal-500/10" },
]

export function AdminOverviewContent() {
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [recentQuestoes, setRecentQuestoes] = useState<any[]>([])
  const [depoimentosPendentes, setDepoimentosPendentes] = useState<number | null>(null)

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
  }, [])

  function renderStatCard(stat: StatDef) {
    const Icon = stat.icon
    const value = counts[stat.table]
    return (
      <Card key={stat.table} className="border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {value === undefined ? "…" : value === null ? "—" : value}
            </p>
            {value === null && <p className="mt-1 text-[11px] text-muted-foreground">tabela não encontrada</p>}
          </div>
          <div className={`rounded-lg ${stat.bgColor} p-3`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">{STATS.map(renderStatCard)}</div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Conteúdo da plataforma
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">{CONTENT_STATS.map(renderStatCard)}</div>
      </div>

      {depoimentosPendentes !== null && depoimentosPendentes > 0 && (
        <Link href="/admin/depoimentos">
          <Card className="flex items-center justify-between border border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
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
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
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
