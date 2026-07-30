"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { getPlanStatus } from "@/lib/plan-status"

export function FreePlanBanner() {
  const [showFree, setShowFree] = useState(false)

  useEffect(() => {
    let active = true
    getPlanStatus().then((status) => {
      if (active && status) setShowFree(!status.hasFullAccess && !status.isTrialExpired && !status.accessExpired)
    })
    return () => {
      active = false
    }
  }, [])

  if (!showFree) return null

  return (
    <div className="mx-4 mt-4 flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Você está em uma conta gratuita e por isso tem acesso a apenas 10 questões de teste. Para treinar sem
          limites, escolha um dos nossos planos disponíveis.
        </p>
      </div>
      <Link
        href="/#pricing"
        className="shrink-0 whitespace-nowrap rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Ver planos e continuar estudando
      </Link>
    </div>
  )
}
