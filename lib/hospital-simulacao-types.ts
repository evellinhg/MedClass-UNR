export interface HospitalSimulacaoCaso {
  id: string
  titulo: string
  descricao: string | null
  arquivo_html: string
  ordem: number
  ativo: boolean
  created_at: string
}

export interface SimuladorResultado {
  caso: string
  version: string
  desenlace: string
  camino: number
  bpFinal: number
  reservaExcelencia: number
  omisiones: number
  iatrogenias: number
  isquemiaTotalMin: number
  puertaBalonMin: number
  miocardioSalvable: number
  vdIdentificado: boolean
  reperfundido: boolean
  soporteVentilatorio: string
  tiempoPerdidoMin: number
  fallecido: boolean
  dificultad: number
  registro: { h: string; t: string; c: string }[]
  finalizadoEn: string
}
