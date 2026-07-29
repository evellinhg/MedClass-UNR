"use client"

import { useLanguage } from "@/lib/i18n"

export function DesempenhoHistoricoHeader() {
  const { t } = useLanguage()
  return (
    <div>
      <h1 className="text-3xl font-bold text-gradient-brand">{t.desempenhoHistorico.tituloPagina}</h1>
      <p className="mt-1 text-muted-foreground">{t.desempenhoHistorico.subtituloPagina}</p>
    </div>
  )
}
