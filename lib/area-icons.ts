import { Baby, Venus, Scissors, Stethoscope, HeartHandshake, type LucideIcon } from "lucide-react"

const AREA_ICONS: Record<string, LucideIcon> = {
  Pediatria: Baby,
  "Ginecologia e Obstetrícia": Venus,
  Cirurgia: Scissors,
  "Clínica Médica": Stethoscope,
  "Medicina da Família e Comunidade": HeartHandshake,
}

export function getAreaIcon(area: string | null | undefined): LucideIcon {
  if (!area) return Stethoscope
  return AREA_ICONS[area] ?? Stethoscope
}
