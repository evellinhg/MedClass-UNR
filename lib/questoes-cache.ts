export interface QuestaoCacheada {
  id: string
  enunciado: string
  opcoes: string[]
  indice_correta: number
  materia: string | null
  area: string | null
  dificuldade: string | null
  prova: string | null
  edicao: string | null
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
  filtros: { areas?: string[]; dificuldade?: string; prova?: string; edicao?: string }
): string[] {
  return pool
    .filter((q) => !filtros.areas || filtros.areas.includes(q.area ?? ""))
    .filter((q) => !filtros.dificuldade || filtros.dificuldade === "aleatorio" || q.dificuldade === filtros.dificuldade)
    .filter((q) => !filtros.prova || q.prova === filtros.prova)
    .filter((q) => !filtros.edicao || q.edicao === filtros.edicao)
    .map((q) => q.id)
}
