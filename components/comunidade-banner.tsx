"use client"

import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function ComunidadeBanner() {
  const { t } = useLanguage()

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t.comunidadeBanner.titulo}</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.comunidadeBanner.corpo}</p>
          </div>
        </div>
        <Link
          href="/dashboard/feedback"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-4 py-2.5 text-sm font-semibold text-[#0a1f00] shadow-sm transition-opacity hover:opacity-90"
        >
          {t.comunidadeBanner.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
