export type MedalhaRaridade = "comum" | "rara" | "epica" | "lendaria"

export type MedalhaCriterioTipo =
  | "manual"
  | "primeira_sessao"
  | "contagem_total"
  | "nota_media_minima"
  | "streak_dias"
  | "medcoins_acumulados"
  | "perfeitos_seguidos"

export interface MedalhaCriterio {
  tipo: MedalhaCriterioTipo
  minimo?: number
  sessao?: "simulado" | "individual"
  sessoes_minimas?: number
}

export interface Medalha {
  id: string
  chave: string
  nome: string
  descricao: string | null
  categoria: string
  icone: string
  raridade: MedalhaRaridade
  criterio: MedalhaCriterio
  recompensa_medcoins: number
  ativo: boolean
  created_at: string
}

export interface UserMedalha {
  id: string
  user_id: string
  medalha_id: string
  conquistado_em: string
}

export const CATEGORIAS_MEDALHA = ["simulados", "precisao", "consistencia", "medcoins", "geral"]

export const ICONES_MEDALHA = [
  "award",
  "trophy",
  "star",
  "target",
  "flame",
  "coins",
  "book-open",
  "footprints",
  "medal",
  "crown",
  "zap",
  "brain",
]

export const RARIDADE_LABEL: Record<MedalhaRaridade, string> = {
  comum: "Comum",
  rara: "Rara",
  epica: "Épica",
  lendaria: "Lendária",
}

export const RARIDADE_COLORS: Record<MedalhaRaridade, { bg: string; ring: string; text: string }> = {
  comum: { bg: "from-slate-400 to-slate-500", ring: "ring-slate-400/40", text: "text-slate-300" },
  rara: { bg: "from-sky-400 to-blue-500", ring: "ring-sky-400/40", text: "text-sky-300" },
  epica: { bg: "from-purple-400 to-fuchsia-500", ring: "ring-purple-400/40", text: "text-purple-300" },
  lendaria: { bg: "from-amber-400 to-orange-500", ring: "ring-amber-400/40", text: "text-amber-300" },
}
