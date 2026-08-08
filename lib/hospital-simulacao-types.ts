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

export interface HospitalSimulacaoVitalDelta {
  fc: number
  pas: number
  spo2: number
}

export interface HospitalSimulacaoOpcao {
  texto: string
  impacto_bp: number
  deltas_vitais: HospitalSimulacaoVitalDelta
  feedback: string
  proxima_etapa: string
}

export interface HospitalSimulacaoEtapa {
  numero: number
  fase: string
  titulo: string
  descripcion_clinica: string
  opciones: Record<string, HospitalSimulacaoOpcao>
}

export interface HospitalSimulacaoDesenlaceInfo {
  titulo: string
  descricao_detalhada: string
  bp_faixa: [number, number]
  sucesso: boolean
  camino?: number
}

export interface HospitalSimulacaoDesenlaces {
  desenlace_obito: HospitalSimulacaoDesenlaceInfo
  desenlace_vivo: Record<string, HospitalSimulacaoDesenlaceInfo>
}

export interface HospitalSimulacaoRegrasGlobais {
  custo_tempo_segundo: HospitalSimulacaoVitalDelta
  gatilho_alarme_critico: {
    pas_menor_que: number
    spo2_menor_que: number
    fc_maior_que: number
    fc_menor_que: number
    bp_menor_ou_igual_a: number
  }
}

export interface HospitalSimulacaoConteudo {
  caso_id: string
  titulo: string
  descricao_general: string
  puntos_biologicos_iniciales: number
  vitais_base: HospitalSimulacaoVitalDelta & { st_inicial: number }
  regras_globais: HospitalSimulacaoRegrasGlobais
  etapas: Record<string, HospitalSimulacaoEtapa>
  desenlaces_finales: HospitalSimulacaoDesenlaces
}

export const HOSPITAL_SIMULACAO_ETAPA_INICIAL = "triagem"

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
