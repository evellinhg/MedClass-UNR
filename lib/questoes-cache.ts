export interface QuestaoCacheada {
  id: string
  enunciado: string
  opcoes: string[]
  indice_correta: number
  materia: string | null
  parcial: string | null
  dificuldade: string | null
  ativo: boolean
  justificativa: string | null
  opcoes_comentario: string[] | null
  mecanismo_pergunta: string | null
  mecanismo_opcoes: string[] | null
  mecanismo_indice_correta: number | null
}

const TTL_MS = 10 * 60 * 1000 // 10 minutos (questões ativas mudam raramente)

const cache = new Map<string, { data: QuestaoCacheada[]; ts: number }>()

export function getCachedQuestoesAtivas(): QuestaoCacheada[] | null {
  const entry = cache.get("ativas")
  if (!entry) return null
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete("ativas")
    return null
  }
  return entry.data
}

export function setCachedQuestoesAtivas(data: QuestaoCacheada[]) {
  cache.set("ativas", { data, ts: Date.now() })
}

export function invalidateQuestoesCache() {
  cache.clear()
}

export function filtrarPoolIds(
  pool: QuestaoCacheada[],
  filtros: { materias?: string[]; dificuldade?: string; parcial?: string }
): string[] {
  return pool
    .filter((q) => !filtros.materias || filtros.materias.includes(q.materia ?? ""))
    .filter((q) => !filtros.dificuldade || filtros.dificuldade === "aleatorio" || q.dificuldade === filtros.dificuldade)
    .filter((q) => !filtros.parcial || q.parcial === filtros.parcial)
    .map((q) => q.id)
}
