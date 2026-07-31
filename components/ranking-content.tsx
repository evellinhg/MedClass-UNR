"use client"

import { useEffect, useState } from "react"
import { Loader2, Medal, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n"
import { ANO_KEYS, MATERIA_KEYS_BY_ANO } from "@/lib/unr-curriculum"

const TODAS_MATERIAS = "__todas__"
const TOP_N = 5

const MATERIA_KEYS = ANO_KEYS.flatMap((ano) => MATERIA_KEYS_BY_ANO[ano])

const medalColors = ["text-yellow-500", "text-slate-400", "text-amber-700"]

interface RankingRow {
  posicao: number
  user_id: string
  display_name: string
  correct: number
  total: number
  points: number
}

interface MinhaPosicao {
  posicao: number
  correct: number
  total: number
  points: number
  total_participantes: number
}

export function RankingContent() {
  const { t } = useLanguage()
  const [materiaFiltro, setMateriaFiltro] = useState(TODAS_MATERIAS)
  const [rows, setRows] = useState<RankingRow[]>([])
  const [minhaPosicao, setMinhaPosicao] = useState<MinhaPosicao | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const materiaParam = materiaFiltro === TODAS_MATERIAS ? null : materiaFiltro

    supabase.auth.getUser().then(async ({ data: userData }) => {
      const userId = userData.user?.id ?? null

      const [{ data: rankingData }, posicaoResult] = await Promise.all([
        supabase.rpc("get_ranking_por_materia", { materia_filtro: materiaParam, limite: TOP_N }),
        userId
          ? supabase.rpc("get_minha_posicao_ranking", { materia_filtro: materiaParam, alvo_user_id: userId })
          : Promise.resolve({ data: null }),
      ])

      if (cancelled) return
      setCurrentUserId(userId)
      setRows((rankingData as RankingRow[]) ?? [])
      const posicaoData = (posicaoResult.data as MinhaPosicao[] | null) ?? []
      setMinhaPosicao(posicaoData[0] ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [materiaFiltro])

  const estouNoTop = currentUserId ? rows.some((r) => r.user_id === currentUserId) : false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{t.ranking.titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.ranking.subtitulo}</p>
      </div>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t.ranking.filtroMateria}</label>
        <Select value={materiaFiltro} onValueChange={setMateriaFiltro}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_MATERIAS}>{t.ranking.todasAsMaterias}</SelectItem>
            {MATERIA_KEYS.map((m) => (
              <SelectItem key={m} value={m}>
                {t.cronograma.materiaLabel[m] ?? m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t.ranking.comoPontuarTitulo}</p>
        <p className="mt-1">{t.ranking.comoPontuarTexto}</p>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t.ranking.carregando}
        </div>
      ) : rows.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t.ranking.vazio}
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const isMe = row.user_id === currentUserId
            return (
              <Card
                key={row.user_id}
                className={`flex items-center gap-4 border p-4 ${
                  isMe ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
                  {row.posicao <= 3 ? (
                    <Medal className={`h-5 w-5 ${medalColors[row.posicao - 1]}`} />
                  ) : (
                    row.posicao
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.display_name} {isMe && <Badge variant="secondary" className="ml-1">{t.ranking.voce}</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ranking.acertos(row.correct, row.total)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-right">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{row.points}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && currentUserId && !estouNoTop && (
        <Card className="border border-primary/40 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.ranking.suaPosicaoTitulo}
          </p>
          {minhaPosicao ? (
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">
                  {t.ranking.suaPosicaoFora(minhaPosicao.posicao, minhaPosicao.total_participantes)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.ranking.acertos(minhaPosicao.correct, minhaPosicao.total)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-right">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-foreground">{minhaPosicao.points}</span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{t.ranking.aindaNaoRespondeu}</p>
          )}
        </Card>
      )}
    </div>
  )
}
