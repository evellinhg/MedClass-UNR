"use client"

import { useLanguage } from "@/lib/i18n"

export function MateriaisHeader() {
  const { t } = useLanguage()
  return (
    <div>
      <h1 className="text-3xl font-bold text-gradient-brand">{t.materiais.tituloPagina}</h1>
      <p className="mt-1 text-muted-foreground">{t.materiais.subtituloPagina}</p>
    </div>
  )
}
