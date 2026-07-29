"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { usePwaInstall } from "@/lib/use-pwa-install"
import { PwaInstallInstructionsDialog } from "@/components/pwa-install-instructions-dialog"

const DISMISS_KEY = "medclass-unr-pwa-banner-dismissed-until"
const DISMISS_DAYS = 7

export function PwaInstallBanner() {
  const { t } = useLanguage()
  const { canPromptNatively, isStandalone, isIos, promptInstall } = usePwaInstall()
  const [dismissed, setDismissed] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0)
    setDismissed(Date.now() < until)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000))
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (canPromptNatively) {
      await promptInstall()
    } else {
      setShowInstructions(true)
    }
  }

  if (isStandalone || dismissed) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:hidden">
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-[#c6ff3a]/25 bg-[#1a1e15]/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c6ff3a] to-[#84cc16]">
            <Download className="h-5 w-5 text-[#0a1f00]" />
          </div>
          <p className="flex-1 text-xs font-medium leading-snug text-white">{t.pwaInstall.bannerTitle}</p>
          <button
            type="button"
            onClick={handleInstall}
            className="animate-pwa-pulse shrink-0 rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-4 py-2 text-xs font-bold text-[#0a1f00]"
          >
            {t.pwaInstall.bannerCta}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t.pwaInstall.dismiss}
            className="shrink-0 text-white/40 transition-colors hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PwaInstallInstructionsDialog open={showInstructions} onOpenChange={setShowInstructions} isIos={isIos} />
    </>
  )
}
