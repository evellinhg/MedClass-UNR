"use client"

import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

export function PersonagemContent() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient-brand">{t.personagem.titulo}</h1>
        <p className="mt-1 text-muted-foreground">{t.personagem.subtitulo}</p>
      </div>

      <Card className="border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">{t.personagem.emDesenvolvimento}</p>
      </Card>
    </div>
  )
}
