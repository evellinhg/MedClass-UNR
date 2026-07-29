import Link from "next/link"
import { AlertTriangle, Lock, TimerOff } from "lucide-react"

type Tone = "locked" | "expired" | "limit"

interface PlanRestrictedNoticeProps {
  tone: Tone
  title: string
  description: string
  className?: string
}

const TONE_STYLES: Record<Tone, { border: string; bg: string; text: string; icon: typeof Lock }> = {
  locked: {
    border: "border-[#c6ff3a]/30",
    bg: "bg-[#c6ff3a]/10",
    text: "text-[#bef264]",
    icon: Lock,
  },
  expired: {
    border: "border-destructive/30",
    bg: "bg-destructive/10",
    text: "text-destructive",
    icon: TimerOff,
  },
  limit: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    icon: AlertTriangle,
  },
}

export function PlanRestrictedNotice({ tone, title, description, className }: PlanRestrictedNoticeProps) {
  const style = TONE_STYLES[tone]
  const Icon = style.icon

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-6 text-center sm:p-8 ${className ?? ""}`}>
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className={`text-lg font-semibold ${style.text}`}>{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Link
        href="/#pricing"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-5 py-2.5 text-sm font-semibold text-[#0a1f00] transition-opacity hover:opacity-90"
      >
        Ver planos disponíveis
      </Link>
    </div>
  )
}
