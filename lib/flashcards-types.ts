export interface FlashcardDeck {
  id: string
  titulo: string
  especialidade: string | null
  materia: string | null
  subsecao: string | null
  disciplina_base: string | null
  descricao: string | null
  cor_hex: string
  tags: string[]
  ordem: number
  ativo: boolean
  created_at: string
}

export interface Flashcard {
  id: string
  deck_id: string
  frente: string
  verso: string
  fontes: string[]
  ordem: number
  created_at: string
}

export interface FlashcardProgresso {
  id: string
  user_id: string
  flashcard_id: string
  nivel: number
  respondido_em: string
}
