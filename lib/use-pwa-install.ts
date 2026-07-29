"use client"

import { useCallback, useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent))

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setIsStandalone(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setIsStandalone(true)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return {
    canPromptNatively: !!deferredPrompt,
    isStandalone,
    isIos,
    promptInstall,
  }
}
