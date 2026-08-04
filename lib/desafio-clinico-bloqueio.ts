export const NOTA_CORTE_DESBLOQUEIO = 60

export interface DesafioParaBloqueio {
  id: string
  titulo: string
  secao: string | null
  area: string | null
}

export interface HistoricoParaBloqueio {
  acertos: number
  total: number
  desafio: { id: string } | null
}

function extrairNumeroCaso(titulo: string): number | null {
  const m = titulo.match(/^Caso (\d+)/i)
  return m ? Number(m[1]) : null
}

function chaveSecao(desafio: DesafioParaBloqueio): string {
  return desafio.secao || desafio.area || ""
}

export function foiAprovado(desafioId: string, historico: HistoricoParaBloqueio[]): boolean {
  return historico.some(
    (h) => h.desafio?.id === desafioId && h.total > 0 && (h.acertos / h.total) * 100 >= NOTA_CORTE_DESBLOQUEIO
  )
}

/**
 * Retorna o caso anterior (mesma seção, numeração "Caso N" na frente) que precisa
 * ser aprovado com >= 60% antes de liberar `desafio`, ou null se não há bloqueio
 * (primeiro caso da seção, seção "Clínica Médica" ou título fora do padrão "Caso N").
 */
export function desafioAnteriorObrigatorio(
  desafio: DesafioParaBloqueio,
  todosDesafios: DesafioParaBloqueio[]
): DesafioParaBloqueio | null {
  if (desafio.area === "Clínica Médica") return null

  const numeroAtual = extrairNumeroCaso(desafio.titulo)
  if (numeroAtual === null || numeroAtual <= 1) return null

  const daMesmaSecao = todosDesafios
    .filter((d) => d.area !== "Clínica Médica" && chaveSecao(d) === chaveSecao(desafio))
    .map((d) => ({ d, numero: extrairNumeroCaso(d.titulo) }))
    .filter((x): x is { d: DesafioParaBloqueio; numero: number } => x.numero !== null)
    .sort((a, b) => a.numero - b.numero)

  const idx = daMesmaSecao.findIndex((x) => x.d.id === desafio.id)
  if (idx <= 0) return null
  return daMesmaSecao[idx - 1].d
}
