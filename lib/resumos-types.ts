export interface ResumoSecao {
  titulo: string
  corpo: string
}

export interface Resumo {
  id: string
  titulo: string
  especialidade: string
  secoes: ResumoSecao[]
  bibliografia: string[]
  tags: string[]
  ordem: number
  ativo: boolean
  created_at: string
}

export interface ResumoAnotacao {
  id: string
  resumo_id: string
  user_id: string
  secao: string
  texto: string
  created_at: string
}
