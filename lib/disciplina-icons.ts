import {
  Bone,
  Microscope,
  Egg,
  Activity,
  FlaskConical,
  Waves,
  Dna,
  ShieldCheck,
  Bug,
  HeartCrack,
  Pill,
  Stethoscope,
  type LucideIcon,
} from "lucide-react"

const DISCIPLINA_ICONS: Record<string, LucideIcon> = {
  anatomia: Bone,
  histologia: Microscope,
  embriologia: Egg,
  fisiologia: Activity,
  bioquimica: FlaskConical,
  biofisica: Waves,
  genetica: Dna,
  imunologia: ShieldCheck,
  microbiologia: Bug,
  parasitologia: Bug,
  patologia: HeartCrack,
  farmacologia_base: Pill,
}

export function getDisciplinaIcon(disciplina: string | null | undefined): LucideIcon {
  if (!disciplina) return Stethoscope
  return DISCIPLINA_ICONS[disciplina] ?? Stethoscope
}
