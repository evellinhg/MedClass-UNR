import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconChipProps {
  icon: LucideIcon
  size?: "sm" | "md" | "lg"
  className?: string
  iconClassName?: string
  glossy?: boolean
}

const SIZE_MAP = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-14 w-14" }
const ICON_SIZE_MAP = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }
const RADIUS_MAP = { sm: "rounded-[9px]", md: "rounded-[12px]", lg: "rounded-[16px]" }

/**
 * "App icon" style: squircle com gradiente, brilho no topo e sombra —
 * mesma linguagem visual em toda a plataforma (estatísticas, ranking,
 * cards de ação, banners). `className` define o fundo (gradiente/cor e
 * sombra); `iconClassName` sobrescreve a cor do glifo quando o fundo não
 * for um gradiente colorido (ex: chip translúcido sobre um card claro).
 */
export function IconChip({ icon: Icon, size = "md", className, iconClassName, glossy = true }: IconChipProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden shadow-lg ring-1 ring-black/5",
        SIZE_MAP[size],
        RADIUS_MAP[size],
        className
      )}
    >
      {glossy && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/0 to-black/10" />
      )}
      <Icon
        className={cn("relative shrink-0 text-white drop-shadow-sm", ICON_SIZE_MAP[size], iconClassName)}
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  )
}
