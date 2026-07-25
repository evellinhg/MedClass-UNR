"use client"

import { useEffect, useState } from "react"
import { BookOpen, ClipboardList, Target, Users2 } from "lucide-react"
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
  { label: "Tentativas", table: "attempts", icon: ClipboardList, bgColor: "bg-emerald-500/10" },
  { label: "Simulados", table: "simulados", icon: Target, bgColor: "bg-amber-500/10" },
]

export function AdminOverviewContent() {
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [recentQuestoes, setRecentQuestoes] = useState<any[]>([])

  useEffect(() => {
    STATS.forEach(async (stat) => {
      const { count, error } = await supabase.from(stat.table).select("*", { count: "exact", head: true })
      setCounts((prev) => ({ ...prev, [stat.table]: error ? null : count ?? 0 }))
    })

    supabase
      .from("questoes")
      .select("id, enunciado, materia, dificuldade, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentQuestoes(data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          const value = counts[stat.table]
          return (
            <Card key={stat.table} className="border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-foreground">
                    {value === undefined ? "…" : value === null ? "—" : value}
                  </p>
                  {value === null && (
                    <p className="mt-1 text-[11px] text-muted-foreground">tabela não encontrada</p>
                  )}
                </div>
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

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
