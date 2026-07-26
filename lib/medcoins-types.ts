export interface MedcoinsConfig {
  id: string
  nome_moeda: string
  simbolo: string
  icone: string
  cor_hex: string
  ativo: boolean
}

export interface MedcoinsWallet {
  id: string
  user_id: string
  saldo: number
  total_acumulado: number
  updated_at: string
}

export interface MedcoinsLedgerEntry {
  id: string
  wallet_id: string
  user_id: string
  tipo: "credito" | "debito" | "ajuste_admin"
  valor: number
  origem_tipo: string
  origem_id: string | null
  descricao: string | null
  created_at: string
}

export interface MedcoinsRegra {
  id: string
  chave: string
  nome: string
  ativo: boolean
  moeda_por_acerto: number
  moeda_por_questao: number
  bonus_perfeito: number
  minimo_questoes: number
  created_at: string
  updated_at: string
}

export type MedcoinsRewardTipo = "digital" | "fisico"

export interface MedcoinsReward {
  id: string
  nome: string
  descricao: string | null
  tipo: MedcoinsRewardTipo
  custo_medcoins: number
  estoque: number | null
  imagem_url: string | null
  ativo: boolean
  created_at: string
}

export type MedcoinsRedemptionStatus = "pendente" | "concluido" | "cancelado"

export interface MedcoinsRedemption {
  id: string
  user_id: string
  reward_id: string
  custo_pago: number
  status: MedcoinsRedemptionStatus
  observacao: string | null
  created_at: string
}
