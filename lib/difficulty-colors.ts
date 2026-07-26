export interface DifficultyColorConfig {
  dot: string
  text: string
  borderSoft: string
  hoverGlow: string
  activeBg: string
}

const FALLBACK: DifficultyColorConfig = {
  dot: "bg-muted-foreground",
  text: "text-muted-foreground",
  borderSoft: "border-border",
  hoverGlow: "hover:shadow-[0_0_18px_rgba(139,92,246,0.45)]",
  activeBg: "bg-muted-foreground",
}

export const DIFFICULTY_COLORS: Record<string, DifficultyColorConfig> = {
  "fácil": {
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    borderSoft: "border-emerald-500/40",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(16,185,129,0.5)]",
    activeBg: "bg-emerald-500",
  },
  "médio": {
    dot: "bg-amber-500",
    text: "text-amber-500",
    borderSoft: "border-amber-500/40",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(245,158,11,0.5)]",
    activeBg: "bg-amber-500",
  },
  "difícil": {
    dot: "bg-rose-500",
    text: "text-rose-500",
    borderSoft: "border-rose-500/40",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(244,63,94,0.5)]",
    activeBg: "bg-rose-500",
  },
}

export function getDifficultyColor(dificuldade: string): DifficultyColorConfig {
  return DIFFICULTY_COLORS[dificuldade] ?? FALLBACK
}
