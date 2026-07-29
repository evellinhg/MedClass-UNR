export interface CronogramaRotina {
  id: string
  user_id: string
  area: string
  parcial: string
  horario: string
  dias_semana: string[]
  quantidade_questoes: number
  created_at: string
}

export type TrilhaEtapaTipo = "simulado" | "desafio_clinico"

export interface CronogramaTrilha {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  created_at: string
}

export interface CronogramaTrilhaUnidade {
  id: string
  trilha_id: string
  titulo: string
  descricao: string | null
  ordem: number
}

export interface CronogramaTrilhaEtapa {
  id: string
  unidade_id: string
  ordem: number
  tipo: TrilhaEtapaTipo
  area: string | null
  dificuldade: string | null
  prova: string | null
  quantidade_questoes: number | null
  desafio_clinico_id: string | null
}
