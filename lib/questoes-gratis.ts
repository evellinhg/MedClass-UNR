import type { QuestaoCacheada } from "@/lib/questoes-cache"

// Conta gratuita: até 50 perguntas fixas por matéria, sempre as mesmas pra
// todo mundo (ordenação determinística por id -- não é sorteio nem depende
// de quando a conta foi criada, então nunca muda entre sessões/usuários).
export const FREE_QUESTOES_POR_MATERIA = 50

// Recebe o pool completo de questões ativas e uma lista de ids já filtrada
// (por matéria/dificuldade/parcial/inéditas) e devolve só os ids que caem
// dentro do conjunto fixo gratuito de cada matéria presente na lista.
export function filtrarPoolGratis(pool: QuestaoCacheada[], poolIds: string[]): string[] {
  const idsCandidatos = new Set(poolIds)
  const porMateria = new Map<string, string[]>()

  for (const q of pool) {
    if (!idsCandidatos.has(q.id)) continue
    const chave = q.materia ?? ""
    if (!porMateria.has(chave)) porMateria.set(chave, [])
    porMateria.get(chave)!.push(q.id)
  }

  const liberados: string[] = []
  for (const ids of porMateria.values()) {
    liberados.push(...[...ids].sort().slice(0, FREE_QUESTOES_POR_MATERIA))
  }
  return liberados
}
