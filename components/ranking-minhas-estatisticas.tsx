"use client"

import { useEffect, useState } from "react"
import { BookOpen, CheckCircle2, Clock3, Hourglass, ListChecks, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

interface AttemptRow {
  correct_count: number
  wrong_count: number
  total_questions: number
  duration_seconds: number | null
}

interface SessaoRow {
  questao_ids: string[]
  respostas: (number | null)[] | null
}

function formatDuracao(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h === 0 && m === 0) return "—"
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function RankingMinhasEstatisticas() {
  const { t } = useLanguage()
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [materiaCounts, setMateriaCounts] = useState<{ materia: string; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }

      const [{ data: attemptRows }, { data: sessaoRows }] = await Promise.all([
        supabase
          .from("simulado_attempts")
          .select("correct_count, wrong_count, total_questions, duration_seconds")
          .eq("user_id", data.user.id),
        supabase
          .from("simulados")
          .select("questao_ids, respostas")
          .eq("user_id", data.user.id)
          .not("finished_at", "is", null),
      ])

      setAttempts((attemptRows as AttemptRow[]) ?? [])

      const sessoes = (sessaoRows as SessaoRow[] | null) ?? []
      const questaoIds = Array.from(new Set(sessoes.flatMap((s) => s.questao_ids ?? [])))
      let infoPorQuestao = new Map<string, string | null>()
      if (questaoIds.length > 0) {
        const { data: questoesRows } = await supabase.from("questoes").select("id, materia").in("id", questaoIds)
        infoPorQuestao = new Map(
          ((questoesRows as { id: string; materia: string | null }[] | null) ?? []).map((q) => [q.id, q.materia])
        )
      }

      const contagem = new Map<string, number>()
      for (const sessao of sessoes) {
        const ids = sessao.questao_ids ?? []
        const respostas = sessao.respostas ?? []
        ids.forEach((id, i) => {
          if (respostas[i] === null || respostas[i] === undefined) return
          const materia = infoPorQuestao.get(id)
          if (!materia) return
          contagem.set(materia, (contagem.get(materia) ?? 0) + 1)
        })
      }
      setMateriaCounts(
        Array.from(contagem.entries())
          .map(([materia, total]) => ({ materia, total }))
          .sort((a, b) => b.total - a.total)
      )
      setLoading(false)
    })
  }, [])

  const totalQuestoes = attempts.reduce((s, a) => s + a.total_questions, 0)
  const totalCorretas = attempts.reduce((s, a) => s + a.correct_count, 0)
  const totalErradas = attempts.reduce((s, a) => s + a.wrong_count, 0)
  const totalTempo = attempts.reduce((s, a) => s + (a.duration_seconds ?? 0), 0)
  const tempoMedio = attempts.length > 0 ? Math.round(totalTempo / attempts.length) : 0

  const stats = [
    { label: t.ranking.minhasEstatisticas.questoesRespondidas, value: String(totalQuestoes), icon: BookOpen, bg: "bg-blue-500/10", color: "text-blue-500" },
    { label: t.ranking.minhasEstatisticas.acertos, value: String(totalCorretas), icon: CheckCircle2, bg: "bg-emerald-500/10", color: "text-emerald-500" },
    { label: t.ranking.minhasEstatisticas.erros, value: String(totalErradas), icon: XCircle, bg: "bg-red-500/10", color: "text-red-500" },
    { label: t.ranking.minhasEstatisticas.treinamentosRealizados, value: String(attempts.length), icon: ListChecks, bg: "bg-purple-500/10", color: "text-purple-500" },
    { label: t.ranking.minhasEstatisticas.tempoMedioTreino, value: formatDuracao(tempoMedio), icon: Clock3, bg: "bg-amber-500/10", color: "text-amber-500" },
    { label: t.ranking.minhasEstatisticas.tempoTotalEstudo, value: formatDuracao(totalTempo), icon: Hourglass, bg: "bg-pink-500/10", color: "text-pink-500" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{t.ranking.minhasEstatisticas.titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.ranking.minhasEstatisticas.subtitulo}</p>
      </div>

      {loading ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t.ranking.minhasEstatisticas.carregando}
        </Card>
      ) : attempts.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t.ranking.minhasEstatisticas.vazio}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`shrink-0 rounded-lg ${stat.bg} p-2`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {materiaCounts.length > 0 && (
            <Card className="border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.ranking.minhasEstatisticas.materiasPraticadas}
              </p>
              <div className="space-y-2">
                {materiaCounts.map((m) => (
                  <div key={m.materia} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{t.cronograma.materiaLabel[m.materia] ?? m.materia}</span>
                    <span className="font-medium text-muted-foreground">
                      {t.ranking.minhasEstatisticas.questoesAbrev(m.total)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
