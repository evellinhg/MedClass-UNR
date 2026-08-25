import {
  HeartPulse,
  Thermometer,
  Baby,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Ear,
  Pill,
  Syringe,
  Activity,
  Microscope,
  type LucideIcon,
} from "lucide-react"
import type { AnoKey } from "@/lib/unr-curriculum"

const DESAFIO_ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Thermometer,
  Baby,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Ear,
  Pill,
  Syringe,
  Activity,
  Microscope,
}

export function getDesafioIcon(nome: string): LucideIcon {
  return DESAFIO_ICONS[nome] ?? Stethoscope
}

// Seções livres para agrupar desafios além da área médica (ex: formato do caso,
// não especialidade). Chave canônica salva no banco — rótulo bilíngue em
// lib/i18n.tsx (t.cronograma.desafioSecaoLabel). Cresce conforme novas seções
// forem criadas no admin.
export const DESAFIO_SECAO_KEYS = [
  "diagnostico_imagens",
  "ciclo_basico_dx",
  "historia_clinica_semiologia",
  "eletrocardiograma",
  "pediatria_5",
] as const
export type DesafioSecaoKey = (typeof DESAFIO_SECAO_KEYS)[number]

// Seções que pertencem a um ano letivo específico. Usadas só para agrupar a
// tela de Desafios Clínicos em abas "Ano > Matéria" — seções fora deste mapa
// (todo o conteúdo pré-existente) continuam na lista plana de sempre, sem
// nenhuma mudança de comportamento.
export const DESAFIO_SECAO_ANO: Partial<Record<DesafioSecaoKey, AnoKey>> = {
  pediatria_5: "ano5",
}

const COVER_GRADIENTS = [
  "from-rose-500 to-orange-400",
  "from-violet-500 to-indigo-500",
  "from-emerald-500 to-teal-400",
  "from-sky-500 to-cyan-400",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-yellow-400",
]

export function coverGradientFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length]
}
