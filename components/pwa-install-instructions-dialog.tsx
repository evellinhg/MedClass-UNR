"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"

interface PwaInstallInstructionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isIos: boolean
}

export function PwaInstallInstructionsDialog({ open, onOpenChange, isIos }: PwaInstallInstructionsDialogProps) {
  const { t } = useLanguage()
  const steps = isIos ? t.pwaInstall.instructionsIosSteps : t.pwaInstall.instructionsAndroidSteps
  const title = isIos ? t.pwaInstall.instructionsIosTitle : t.pwaInstall.instructionsAndroidTitle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#c6ff3a]/20">
        <DialogHeader>
          <DialogTitle>{t.pwaInstall.instructionsTitle}</DialogTitle>
        </DialogHeader>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <ol className="mt-1 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c6ff3a]/15 text-xs font-bold text-[#c6ff3a]">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
