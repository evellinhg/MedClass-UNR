import {
  Award,
  BookOpen,
  Brain,
  Coins,
  Crown,
  Flame,
  Footprints,
  Medal,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { RARIDADE_COLORS, type MedalhaRaridade } from "@/lib/conquistas-types"

const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  trophy: Trophy,
  star: Star,
  target: Target,
  flame: Flame,
  coins: Coins,
  "book-open": BookOpen,
  footprints: Footprints,
  medal: Medal,
  crown: Crown,
  zap: Zap,
  brain: Brain,
}

interface MedalIconProps {
  icone: string
  raridade: MedalhaRaridade
  conquistada: boolean
  size?: "sm" | "md" | "lg"
}

const SIZES = {
  sm: { wrapper: "h-10 w-10", icon: "h-5 w-5" },
  md: { wrapper: "h-14 w-14", icon: "h-7 w-7" },
  lg: { wrapper: "h-20 w-20", icon: "h-9 w-9" },
}

export function MedalIcon({ icone, raridade, conquistada, size = "md" }: MedalIconProps) {
  const Icon = ICON_MAP[icone] ?? Award
  const cores = RARIDADE_COLORS[raridade]
  const s = SIZES[size]

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${s.wrapper} ${
        conquistada
          ? `bg-gradient-to-br ${cores.bg} text-white ring-4 ${cores.ring}`
          : "bg-muted text-muted-foreground/40 grayscale"
      }`}
    >
      <Icon className={s.icon} />
    </div>
  )
}
