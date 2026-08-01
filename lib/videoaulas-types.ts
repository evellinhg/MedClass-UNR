export const VIDEOAULA_FONTE_KEYS = ["unr", "alde", "propria"] as const
export type VideoaulaFonteKey = (typeof VIDEOAULA_FONTE_KEYS)[number]

export interface VideoaulaDB {
  id: string
  titulo: string
  titulo_es: string | null
  especialidade: string
  especialidade_es: string | null
  duracao: string
  tags: string[]
  ordem: number
  ativo: boolean
  created_at: string
  youtube_url: string | null
  cor_hex: string | null
  fonte: string
}

export interface VideoaulaArquivoDB {
  id: string
  videoaula_id: string
  titulo: string
  arquivo_path: string
  ordem: number
  created_at: string
}
