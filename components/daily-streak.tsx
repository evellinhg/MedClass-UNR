"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/i18n"
import { getStreakAtual, type DiaAtividade } from "@/lib/atividade-diaria"

const COR_FOGO = "#F97316"

export function DailyStreak() {
  const { t } = useLanguage()
  const [streakAtual, setStreakAtual] = useState(0)
  const [dias, setDias] = useState<DiaAtividade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      getStreakAtual(data.user.id).then((info) => {
        setStreakAtual(info.streakAtual)
        setDias(info.dias)
        setLoading(false)
      })
    })
  }, [])

  if (loading) return null

  const frase =
    streakAtual > 0
      ? t.atividadeDiaria.frase.replace("{count}", String(streakAtual))
      : t.atividadeDiaria.fraseZerado

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6" style={{ color: COR_FOGO }} />
          <h3 className="text-lg font-bold text-foreground">{t.atividadeDiaria.titulo}</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{frase}</p>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {dias.map((d, i) => {
          const isUltimoFeito = d.feito && i === streakAtual - 1
          return (
            <div
              key={i}
              className={
                d.feito
                  ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-semibold"
                  : "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold text-muted-foreground"
              }
              style={
                d.feito
                  ? { borderColor: COR_FOGO, backgroundColor: `${COR_FOGO}1A`, color: COR_FOGO }
                  : undefined
              }
            >
              {isUltimoFeito ? <Flame className="h-6 w-6" style={{ color: COR_FOGO }} /> : d.dia}
            </div>
          )
        })}
      </div>
    </div>
  )
}
