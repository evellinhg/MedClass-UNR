export interface HospitalSimulacaoCaso {
  id: string
  titulo: string
  descricao: string | null
  arquivo_html: string | null
  tipo: "iframe" | "perguntas"
  conteudo: HospitalSimulacaoConteudo | null
  ordem: number
  ativo: boolean
  created_at: string
}

export interface HospitalSimulacaoOpcao {
  texto: string
  impacto_bp: number
  feedback: string
}

export interface HospitalSimulacaoEtapa {
  numero: number
  fase: string
  descripcion_clinica: string
  opciones: Record<string, HospitalSimulacaoOpcao>
}

export interface HospitalSimulacaoDesenlace {
  rango: string
  titulo: string
  descripcion: string
}

export interface HospitalSimulacaoConteudo {
  caso_id: number
  titulo: string
  descripcion_general: string
  puntos_biologicos_iniciales: number
  etapas: HospitalSimulacaoEtapa[]
  desenlaces_finales: Record<string, HospitalSimulacaoDesenlace>
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
