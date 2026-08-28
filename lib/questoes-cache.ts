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

// Formato enxuto usado por toda tela que só precisa filtrar o pool pra
// chegar numa lista de ids (materia/dificuldade/parcial/inéditas) -- a
// grande maioria dos consumidores. Buscar só essas colunas em vez de
// select("*") evita transferir enunciado/opcoes/opcoes_comentario/
// justificativa (o grosso do payload, ainda mais agora com >900 questões
// só de Cirurgia do 5º ano) quando ninguém vai ler esse texto.
export interface QuestaoPoolLeve {
  id: string
  materia: string | null
  dificuldade: string | null
  parcial: string | null
}

const TTL_MS = 10 * 60 * 1000 // 10 minutos (questões ativas mudam raramente)

const cache = new Map<string, { data: unknown[]; ts: number }>()

function getCached<T>(chave: string): T[] | null {
  const entry = cache.get(chave)
  if (!entry) return null
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete(chave)
    return null
  }
  return entry.data as T[]
}

function setCached<T>(chave: string, data: T[]) {
  cache.set(chave, { data, ts: Date.now() })
}

export function getCachedQuestoesAtivas(): QuestaoCacheada[] | null {
  return getCached<QuestaoCacheada>("ativas-completo")
}

export function setCachedQuestoesAtivas(data: QuestaoCacheada[]) {
  setCached("ativas-completo", data)
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
//
// Descobre o total com um HEAD request (barato, sem baixar linha nenhuma)
// e dispara todas as páginas necessárias em paralelo -- bem mais rápido
// que buscar 1000 em 1000 em série quando o banco passa de poucos mil.
async function buscarPaginado<T>(selectCols: string): Promise<T[]> {
  const { count, error: countError } = await supabase
    .from("questoes")
    .select("id", { count: "exact", head: true })
    .eq("ativo", true)
  if (countError || !count) return []

  const totalPaginas = Math.ceil(count / PAGE_SIZE)
  const paginas = await Promise.all(
    Array.from({ length: totalPaginas }, (_, i) =>
      supabase
        .from("questoes")
        .select(selectCols)
        .eq("ativo", true)
        .range(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE - 1)
    )
  )

  const todas: T[] = []
  for (const p of paginas) {
    if (p.error) continue
    todas.push(...((p.data as T[] | null) ?? []))
  }
  return todas
}

export async function buscarQuestoesAtivas(): Promise<QuestaoCacheada[]> {
  const cached = getCachedQuestoesAtivas()
  if (cached) return cached

  const selectCols =
    "id, enunciado, opcoes, indice_correta, materia, parcial, dificuldade, ativo, justificativa, opcoes_comentario, mecanismo_pergunta, mecanismo_opcoes, mecanismo_indice_correta"
  const todas = await buscarPaginado<QuestaoCacheada>(selectCols)

  setCachedQuestoesAtivas(todas)
  return todas
}

// Versão leve: use esta em qualquer tela que só vai chamar filtrarPoolIds/
// filtrarPoolGratis pra montar uma lista de ids (criar simulado, trilha,
// cronograma, treino livre) -- não use se o código depois for ler
// enunciado/opcoes/opcoes_comentario direto do pool (nesse caso use
// buscarQuestoesAtivas mesmo, como o player já faz pra tocar sem
// pré-seleção de ids).
export async function buscarQuestoesAtivasLeve(): Promise<QuestaoPoolLeve[]> {
  const cached = getCached<QuestaoPoolLeve>("ativas-leve")
  if (cached) return cached

  const todas = await buscarPaginado<QuestaoPoolLeve>("id, materia, dificuldade, parcial, ativo")

  setCached("ativas-leve", todas)
  return todas
}

export function filtrarPoolIds(
  pool: QuestaoPoolLeve[],
  filtros: { materias?: string[]; dificuldade?: string; parcial?: string }
): string[] {
  return pool
    .filter((q) => !filtros.materias || filtros.materias.includes(q.materia ?? ""))
    .filter((q) => !filtros.dificuldade || filtros.dificuldade === "aleatorio" || q.dificuldade === filtros.dificuldade)
    .filter((q) => !filtros.parcial || q.parcial === filtros.parcial)
    .map((q) => q.id)
}
