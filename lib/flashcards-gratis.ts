// Conta gratuita: 1 baralho inteiro liberado por matéria (o de menor
// `ordem`, sempre o mesmo baralho pra todo mundo). Os demais baralhos da
// mesma matéria ficam bloqueados por completo -- diferente do modelo antigo
// que liberava as 2 primeiras cartas de cada baralho.
export function decksLiberadosGratis<T extends { id: string; materia: string | null; ordem: number }>(
  decks: T[]
): Set<string> {
  const porMateria = new Map<string, T>()
  for (const deck of decks) {
    const chave = deck.materia ?? ""
    const atual = porMateria.get(chave)
    if (!atual || deck.ordem < atual.ordem) porMateria.set(chave, deck)
  }
  return new Set([...porMateria.values()].map((d) => d.id))
}
