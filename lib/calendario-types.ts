export type CalendarioEventoTipo = "inscricao" | "prova" | "comunidade"

export interface CalendarioEvento {
  id: string
  titulo: string
  descricao: string | null
  data: string // YYYY-MM-DD
  hora: string | null // HH:MM
  tipo: CalendarioEventoTipo
  link: string | null
  ativo: boolean
  created_at: string
}

export type CalendarioSugestaoStatus = "pendente" | "aprovado" | "rejeitado"

export interface CalendarioSugestao {
  id: string
  user_id: string
  nome: string
  email: string
  mensagem: string
  data_sugerida: string | null
  status: CalendarioSugestaoStatus
  created_at: string
  moderado_em: string | null
}
