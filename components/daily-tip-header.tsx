"use client"

import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"
import { STUDY_TIPS } from "@/lib/study-tips"

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function DailyTipHeader() {
  const [tip, setTip] = useState<string | null>(null)

  useEffect(() => {
    const index = dayOfYear(new Date()) % STUDY_TIPS.length
    setTip(STUDY_TIPS[index])
  }, [])

  if (!tip) return null

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 p-5 shadow-sm sm:p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Dica do dia</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-white sm:text-base">{tip}</p>
        </div>
      </div>
    </div>
  )
}
