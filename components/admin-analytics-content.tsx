"use client"

import { useEffect, useState } from "react"
import { Loader2, BarChart3, Users, Brain, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"

interface AnalyticsSummary {
  totalUsuarios: number
  totalSimulados: number
  totalQuestoes: number
  usuariosAtivosSemana: number
  eventosRecentes: { evento: string; total: number }[]
}

export function AdminAnalyticsContent() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [
        { count: totalUsuarios },
        { data: eventos },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_analytics").select("evento").order("created_at", { ascending: false }).limit(500),
      ])

      const eventList = eventos ?? []
      const counts: Record<string, number> = {}
      eventList.forEach((e) => { counts[e.evento] = (counts[e.evento] || 0) + 1 })

      const semanaAtras = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data: activeUsers } = await supabase
        .from("user_analytics")
        .select("user_id")
        .gte("created_at", semanaAtras)
      const usuariosAtivosSemana = new Set((activeUsers ?? []).map((u) => u.user_id)).size

      setSummary({
        totalUsuarios: totalUsuarios ?? 0,
        totalSimulados: (counts["simulado_finalizado"] || 0) + (counts["simulado_iniciado"] || 0),
        totalQuestoes: counts["questao_respondida"] || 0,
        usuariosAtivosSemana: usuariosAtivosSemana ?? 0,
        eventosRecentes: Object.entries(counts)
          .map(([evento, total]) => ({ evento, total }))
          .sort((a, b) => b.total - a.total),
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!summary) return <p className="text-muted-foreground py-8 text-center">Erro ao carregar analytics.</p>

  const stats = [
    { label: "Total de usuários", value: summary.totalUsuarios, icon: Users },
    { label: "Usuários ativos (7d)", value: summary.usuariosAtivosSemana, icon: Users },
    { label: "Simulados (total)", value: summary.totalSimulados, icon: BarChart3 },
    { label: "Questões respondidas", value: summary.totalQuestoes, icon: Brain },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 space-y-2">
            <s.icon className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-3">Eventos mais frequentes</h3>
        <div className="space-y-2">
          {summary.eventosRecentes.slice(0, 10).map((e) => (
            <div key={e.evento} className="flex items-center justify-between text-sm">
              <span className="font-mono text-muted-foreground">{e.evento}</span>
              <span className="font-medium">{e.total}</span>
            </div>
          ))}
          {summary.eventosRecentes.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum evento registrado ainda.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
