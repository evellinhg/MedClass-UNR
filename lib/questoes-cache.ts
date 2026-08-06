import { supabase } from "@/lib/supabase"

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

const PAGE_SIZE = 1000

// O REST do Supabase corta em 1000 linhas por padrão -- sem paginar aqui,
// qualquer matéria cujas questões caíssem fora das primeiras 1000 (ordem
// não garantida numa query sem order()) simplesmente sumia do pool pra
// todo mundo, plano pago ou grátis (bug real encontrado com "injuria": das
// 1288 questões ativas, 0 apareciam nas primeiras 1000 retornadas).
export async function buscarQuestoesAtivas(): Promise<QuestaoCacheada[]> {
  const cached = getCachedQuestoesAtivas()
  if (cached) return cached

  const todas: QuestaoCacheada[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("questoes")
      .select("*")
      .eq("ativo", true)
      .range(from, from + PAGE_SIZE - 1)
    if (error) break
    todas.push(...((data as QuestaoCacheada[] | null) ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }

  setCachedQuestoesAtivas(todas)
  return todas
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
