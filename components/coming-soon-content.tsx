"use client"

import { Hospital, Mic, Sparkles } from "lucide-react"
import { IconChip } from "@/components/ui/icon-chip"
import { useLanguage } from "@/lib/i18n"

const FEATURES = {
  hospitalSimulacao: {
    icon: Hospital,
    gradient: "from-rose-400 to-red-600",
    shadow: "shadow-red-900/30",
    tituloKey: "hospitalSimulacaoTitulo",
    descricaoKey: "hospitalSimulacaoDescricao",
  },
  mesaOral: {
    icon: Mic,
    gradient: "from-indigo-400 to-violet-600",
    shadow: "shadow-indigo-900/30",
    tituloKey: "mesaOralTitulo",
    descricaoKey: "mesaOralDescricao",
  },
} as const

interface ComingSoonContentProps {
  feature: keyof typeof FEATURES
}

export function ComingSoonContent({ feature }: ComingSoonContentProps) {
  const { t } = useLanguage()
  const { icon, gradient, shadow, tituloKey, descricaoKey } = FEATURES[feature]

  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-border bg-card/50 px-6 py-24 text-center">
      <IconChip icon={icon} size="lg" className={`bg-gradient-to-br ${gradient} ${shadow}`} />
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {t.comingSoon.badge}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{t.comingSoon[tituloKey]}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t.comingSoon[descricaoKey]}</p>
      </div>
      <p className="text-xs text-muted-foreground/70">{t.comingSoon.aviso}</p>
    </div>
  )
}
