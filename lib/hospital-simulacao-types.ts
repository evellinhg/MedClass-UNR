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

// Estado do paciente -- cada campo e opcional porque cambio_estado_paciente
// so traz os campos que realmente mudaram naquela decisao (o motor faz
// merge sobre o estado anterior, nao substitui tudo).
export interface HospitalSimulacaoEstadoPaciente {
  frecuencia_cardiaca_lpm?: number
  presion_arterial_mmhg?: string // "140/90"
  saturacion_oxigeno_pct?: number
  frecuencia_respiratoria_rpm?: number
  escala_dolor?: number
  ritmo_monitoreo_ecg?: string
  puntos_actuales?: number
}

// Impreso (ECG, laboratorio, etc.) que se desbloquea solo si el alumno elige
// exactamente esta opcion -- no se desbloquea por acertar el nodo de otra
// forma, ni aparece antes de tiempo.
export interface HospitalSimulacaoImpreso {
  titulo: string
  imagem: string
}

export interface HospitalSimulacaoOpcao {
  texto: string
  destino: string
  es_correcta: boolean
  puntos_afectados: number
  cambio_estado_paciente: HospitalSimulacaoEstadoPaciente
  feedback_detallado: string
  impreso?: HospitalSimulacaoImpreso
}

export interface HospitalSimulacaoNodo {
  id: string
  etapa: string
  descripcion_situación: string
  opciones: HospitalSimulacaoOpcao[]
}

export interface HospitalSimulacaoSistemaPuntos {
  puntos_iniciales: number
  penalizacion_error_leve: number
  penalizacion_error_grave: number
  penalizacion_error_fatal: number
}

export interface HospitalSimulacaoConteudo {
  titulo_juego: string
  descripcion: string
  sistema_puntos: HospitalSimulacaoSistemaPuntos
  estado_inicial: Required<HospitalSimulacaoEstadoPaciente>
  nodos: Record<string, HospitalSimulacaoNodo>
}

export const HOSPITAL_SIMULACAO_NODO_INICIAL = "fase_1_admissao"
export const HOSPITAL_SIMULACAO_NODO_EXITO = "sucesso_conclusao"

// Protocolo do modo "iframe" (simulador vendor autocontido, postMessage ao
// finalizar) -- mantido pro tipo HospitalSimulacaoCaso.tipo === "iframe",
// independente do formato de conteudo do modo "perguntas" acima.
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
