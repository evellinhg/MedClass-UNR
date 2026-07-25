export interface AreaColorConfig {
  hex: string
  dot: string
  text: string
  border: string
  borderSoft: string
  hoverBorder: string
  hoverGlow: string
  bgSoft: string
  activeBg: string
}

const FALLBACK: AreaColorConfig = {
  hex: "#8b5cf6",
  dot: "bg-muted-foreground",
  text: "text-muted-foreground",
  border: "border-border",
  borderSoft: "border-border",
  hoverBorder: "hover:border-primary/50",
  hoverGlow: "hover:shadow-[0_0_18px_rgba(139,92,246,0.45)]",
  bgSoft: "bg-muted",
  activeBg: "bg-muted-foreground",
}

export const AREA_COLORS: Record<string, AreaColorConfig> = {
  Pediatria: {
    hex: "#10b981",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500",
    borderSoft: "border-emerald-500/40",
    hoverBorder: "hover:border-emerald-500",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(16,185,129,0.5)]",
    bgSoft: "bg-emerald-500/10",
    activeBg: "bg-emerald-500",
  },
  "Ginecologia e Obstetrícia": {
    hex: "#f43f5e",
    dot: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500",
    borderSoft: "border-rose-500/40",
    hoverBorder: "hover:border-rose-500",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(244,63,94,0.5)]",
    bgSoft: "bg-rose-500/10",
    activeBg: "bg-rose-500",
  },
  Cirurgia: {
    hex: "#8b5cf6",
    dot: "bg-violet-500",
    text: "text-violet-500",
    border: "border-violet-500",
    borderSoft: "border-violet-500/40",
    hoverBorder: "hover:border-violet-500",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(139,92,246,0.5)]",
    bgSoft: "bg-violet-500/10",
    activeBg: "bg-violet-500",
  },
  "Clínica Médica": {
    hex: "#3b82f6",
    dot: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500",
    borderSoft: "border-blue-500/40",
    hoverBorder: "hover:border-blue-500",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(59,130,246,0.5)]",
    bgSoft: "bg-blue-500/10",
    activeBg: "bg-blue-500",
  },
  "Medicina da Família e Comunidade": {
    hex: "#f59e0b",
    dot: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500",
    borderSoft: "border-amber-500/40",
    hoverBorder: "hover:border-amber-500",
    hoverGlow: "hover:shadow-[0_0_18px_rgba(245,158,11,0.5)]",
    bgSoft: "bg-amber-500/10",
    activeBg: "bg-amber-500",
  },
}

export function getAreaColor(area: string): AreaColorConfig {
  return AREA_COLORS[area] ?? FALLBACK
}
