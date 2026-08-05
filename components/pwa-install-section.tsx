"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Smartphone, Wifi, Bell, Zap } from "lucide-react"
import { IconChip } from "@/components/ui/icon-chip"
import { useLanguage } from "@/lib/i18n"
import { usePwaInstall } from "@/lib/use-pwa-install"
import { PwaInstallInstructionsDialog } from "@/components/pwa-install-instructions-dialog"

const perks = [
  { key: "offline", icon: Wifi },
  { key: "notifications", icon: Bell },
  { key: "fast", icon: Zap },
] as const

export function PwaInstallSection() {
  const { t } = useLanguage()
  const { canPromptNatively, isStandalone, isIos, promptInstall } = usePwaInstall()
  const [showInstructions, setShowInstructions] = useState(false)

  const handleInstall = async () => {
    if (canPromptNatively) {
      await promptInstall()
    } else {
      setShowInstructions(true)
    }
  }

  if (isStandalone) return null

  return (
    <section className="relative bg-[#12140f] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#c6ff3a]/25 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 shadow-[0_20px_70px_-20px_rgba(198,255,58,0.25)] sm:p-12"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72"
            style={{ backgroundImage: "radial-gradient(circle, rgba(198,255,58,0.1) 0%, rgba(198,255,58,0) 70%)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72"
            style={{ backgroundImage: "radial-gradient(circle, rgba(132,204,22,0.1) 0%, rgba(132,204,22,0) 70%)" }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
            <div className="mx-auto shrink-0 lg:mx-0">
              <IconChip
                icon={Smartphone}
                size="xl"
                className="bg-gradient-to-br from-[#c6ff3a] to-[#84cc16] shadow-[0_0_40px_rgba(198,255,58,0.35)]"
                iconClassName="text-[#0a1f00]"
              />
            </div>

            <div className="text-center lg:text-left">
              <span className="mb-3 inline-block rounded-full border border-[#c6ff3a]/30 bg-[#c6ff3a]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#c6ff3a]">
                {t.pwaInstall.sectionBadge}
              </span>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t.pwaInstall.sectionTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-white/60 lg:mx-0">{t.pwaInstall.sectionSubtitle}</p>

              <div className="mt-5 flex flex-wrap justify-center gap-4 lg:justify-start">
                {perks.map((perk) => {
                  const Icon = perk.icon
                  return (
                    <span key={perk.key} className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                      <Icon className="h-3.5 w-3.5 text-[#c6ff3a]" />
                      {t.pwaInstall.perks[perk.key]}
                    </span>
                  )
                })}
              </div>
            </div>

            <div className="mx-auto flex flex-col items-center gap-2 lg:mx-0">
              <button
                type="button"
                onClick={handleInstall}
                className="animate-pwa-pulse whitespace-nowrap rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 py-4 text-base font-bold text-[#0a1f00] transition-transform hover:scale-105"
              >
                {t.pwaInstall.ctaInstall}
              </button>
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="text-xs text-white/40 underline-offset-2 hover:text-white/70 hover:underline"
              >
                {t.pwaInstall.instructionsTitle}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <PwaInstallInstructionsDialog open={showInstructions} onOpenChange={setShowInstructions} isIos={isIos} />
    </section>
  )
}
