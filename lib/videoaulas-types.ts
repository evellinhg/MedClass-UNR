export interface VideoaulaDB {
  id: string
  titulo: string
  especialidade: string
  duracao: string
  tags: string[]
  ordem: number
  ativo: boolean
  created_at: string
}
