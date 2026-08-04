"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TimerOff } from "lucide-react"
import { getPlanStatus } from "@/lib/plan-status"
import { useLanguage } from "@/lib/i18n"

export function PlanExpiredBanner() {
  const { t } = useLanguage()
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    let active = true
    getPlanStatus().then((status) => {
      if (active && status) setExpired(status.accessExpired)
    })
    return () => {
      active = false
    }
  }, [])

  if (!expired) return null

  return (
    <div className="mx-4 mt-4 flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-8">
      <div className="flex items-start gap-3">
        <TimerOff className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{t.planBanner.expiredText}</p>
      </div>
      <Link
        href="/#pricing"
        className="shrink-0 whitespace-nowrap rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t.planBanner.cta}
      </Link>
    </div>
  )
}
