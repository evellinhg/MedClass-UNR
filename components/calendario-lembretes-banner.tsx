"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR, es } from "date-fns/locale"
import { BellRing } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { buscarLembretesAtivos } from "@/lib/calendario-lembretes"
import { useLanguage } from "@/lib/i18n"
import type { CalendarioLembreteAtivo } from "@/lib/calendario-types"

export function CalendarioLembretesBanner() {
  const { t, lang } = useLanguage()
  const localeDf = lang === "es" ? es : ptBR
  const [lembretes, setLembretes] = useState<CalendarioLembreteAtivo[]>([])

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const ativos = await buscarLembretesAtivos(data.user.id)
      if (active) setLembretes(ativos)
    })
    return () => {
      active = false
    }
  }, [])

  if (lembretes.length === 0) return null

  return (
    <div className="mx-4 mt-4 space-y-2 sm:mx-6 lg:mx-8">
      {lembretes.map((lembrete) => (
        <div
          key={lembrete.id}
          className="flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {t.calendario.bannerLembrete(
                lembrete.evento.titulo,
                format(new Date(`${lembrete.evento.data}T00:00:00`), "d 'de' MMMM", { locale: localeDf })
              )}
            </p>
          </div>
          <Link
            href="/dashboard/calendario"
            className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.calendario.verNoCalendario}
          </Link>
        </div>
      ))}
    </div>
  )
}
