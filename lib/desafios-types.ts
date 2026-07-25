export type DesafioCategoria = "anamnese" | "exame_fisico" | "exames_complementares" | "diagnostico" | "conduta"

export interface DesafioBibliografia {
  titulo: string
  url: string | null
}

export interface DesafioClinico {
  id: string
  titulo: string
  icone: string
  descricao_caso: string
  area: string | null
  bibliografia: DesafioBibliografia[]
  ativo: boolean
  created_at: string
}

export interface DesafioAlternativa {
  id: string
  texto: string
  correta: boolean
}

export interface DesafioClinicoPergunta {
  id: string
  desafio_id: string
  ordem: number
  categoria: DesafioCategoria
  enunciado: string
  alternativas: DesafioAlternativa[]
  explicacao: string | null
}

export interface DesafioClinicoHistorico {
  id: string
  user_id: string
  desafio_id: string
  acertos: number
  total: number
  duracao_segundos: number | null
  created_at: string
}
