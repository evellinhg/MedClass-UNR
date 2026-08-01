export const VIDEOAULA_FONTE_KEYS = ["unr", "alde"] as const
export type VideoaulaFonteKey = (typeof VIDEOAULA_FONTE_KEYS)[number]

export interface VideoaulaDB {
  id: string
  titulo: string
  especialidade: string
  duracao: string
  tags: string[]
  ordem: number
  ativo: boolean
  created_at: string
  youtube_url: string | null
  cor_hex: string | null
  fonte: string
}
