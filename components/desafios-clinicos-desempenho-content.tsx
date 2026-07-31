"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Target, Trophy, Clock, ListChecks, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDesafioIcon, coverGradientFor } from "@/lib/desafio-icons"
import { useLanguage } from "@/lib/i18n"

interface HistoricoRow {
  id: string
  acertos: number
  total: number
  duracao_segundos: number | null
  created_at: string
  desafio: { id: string; titulo: string; icone: string } | null
}

function formatDuracao(seconds: number | null): string {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function DesafiosClinicosDesempenhoContent() {
  const { t } = useLanguage()
  const [historico, setHistorico] = useState<HistoricoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      if (!userId) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from("desafios_clinicos_historico")
        .select("id, acertos, total, duracao_segundos, created_at, desafio:desafios_clinicos(id, titulo, icone)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      setHistorico((data as unknown as HistoricoRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    if (historico.length === 0) {
      return { estudados: 0, mediaPct: 0, melhorPct: 0, tempoTotal: 0 }
    }
    const totalAcertos = historico.reduce((acc, h) => acc + h.acertos, 0)
    const totalPerguntas = historico.reduce((acc, h) => acc + h.total, 0)
    const melhorPct = Math.max(...historico.map((h) => (h.total > 0 ? h.acertos / h.total : 0)))
    const tempoTotal = historico.reduce((acc, h) => acc + (h.duracao_segundos ?? 0), 0)
    return {
      estudados: historico.length,
      mediaPct: totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0,
      melhorPct: Math.round(melhorPct * 100),
      tempoTotal,
    }
  }, [historico])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.desafiosClinicos.carregandoDesempenho}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient-brand">{t.desafiosClinicos.desempenhoTitulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.desafiosClinicos.desempenhoDescricao}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs">{t.desafiosClinicos.desafiosEstudados}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.estudados}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs">{t.desafiosClinicos.aproveitamentoMedio}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.mediaPct}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">{t.desafiosClinicos.melhorResultado}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.melhorPct}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs">{t.desafiosClinicos.tempoTotalEstudado}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatDuracao(stats.tempoTotal)}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">{t.desafiosClinicos.historicoEstudos}</h3>
        {historico.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">{t.desafiosClinicos.semHistoricoEstudos}</p>
            <Link href="/dashboard/desafios-clinicos" className="mt-2 inline-block text-sm text-primary">
              {t.desafiosClinicos.verDesafiosDisponiveis}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {historico.map((item) => {
              const Icon = getDesafioIcon(item.desafio?.icone ?? "")
              const pct = item.total > 0 ? item.acertos / item.total : 0
              const passou = pct >= 0.6
              return (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${coverGradientFor(
                      item.desafio?.id ?? item.id
                    )}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.desafio?.titulo ?? t.desafiosClinicos.desafioRemovido}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString(t.desafiosClinicos.localeData)} · {formatDuracao(item.duracao_segundos)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {passou ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {item.acertos}/{item.total}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
