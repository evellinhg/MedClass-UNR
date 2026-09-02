// Importa os 7 lotes de flashcards de Urologia (~/Downloads/URO), 1050 cartões
// no total (7 arquivos x 3 baralhos x 50 cartões cada, sempre nessa ordem
// posicional -- os cards não têm campo deck_id, mas cada bloco de 50
// corresponde exatamente ao baralho descrito em decks[i]). Cada bloco de 50
// é dividido em baralhos balanceados de até 20 cartões (mesmo padrão do ORL,
// scripts-tmp-reorganizar-flashcards-orl-150.mjs).
//
// materia "urologia" é nova -- foi adicionada em lib/unr-curriculum.ts
// (MATERIA_KEYS_BY_ANO.ano5) e lib/i18n.tsx (materiaLabel pt/es) antes deste
// import, senão os baralhos ficariam invisíveis na UI.
//
// Uso: node scripts-tmp-importar-flashcards-urologia.mjs --dry-run
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const HOME = process.env.HOME
const MAX_POR_BARALHO = 20
const DRY_RUN = process.argv.includes("--dry-run")

function dividirEmPartes(lista, tamanhoMax) {
  const nPartes = Math.ceil(lista.length / tamanhoMax)
  const base = Math.floor(lista.length / nPartes)
  let resto = lista.length % nPartes
  const partes = []
  let i = 0
  for (let p = 0; p < nPartes; p++) {
    const tamanho = base + (resto > 0 ? 1 : 0)
    if (resto > 0) resto--
    partes.push(lista.slice(i, i + tamanho))
    i += tamanho
  }
  return partes
}

const ARQUIVOS = [
  "flashcards_urologia_medclass.json",
  "flashcards_urologia_medclass_v2.json",
  "flashcards_urologia_medclass_v3.json",
  "flashcards_urologia_medclass_v4.json",
  "flashcards_urologia_medclass_v5.json",
  "flashcards_urologia_medclass_v6.json",
  "flashcards_urologia_medclass_v7.json",
]

let ordemGlobal = 1000
let totalDecks = 0
let totalCards = 0

for (const nomeArquivo of ARQUIVOS) {
  const raw = JSON.parse(readFileSync(`${HOME}/Downloads/URO/${nomeArquivo}`, "utf-8"))
  const decks = raw.decks
  const cards = raw.cards
  if (decks.length * 50 !== cards.length) {
    console.error(`[${nomeArquivo}] esperava ${decks.length * 50} cartões (${decks.length} baralhos x 50), achou ${cards.length} -- abortando arquivo.`)
    continue
  }

  console.log(`\n[${nomeArquivo}] ${cards.length} cartões, ${decks.length} baralhos-fonte`)
  for (let d = 0; d < decks.length; d++) {
    const tituloBase = decks[d].titulo ?? decks[d].nombre
    const bloco = cards.slice(d * 50, d * 50 + 50)
    const vazias = bloco.filter((c) => !c.frente?.trim() || !c.verso?.trim())
    if (vazias.length > 0) {
      console.error(`  [${tituloBase}] ${vazias.length} cartão(ões) vazio(s) -- pulando este baralho-fonte.`)
      continue
    }

    const partes = dividirEmPartes(bloco, MAX_POR_BARALHO)
    for (let p = 0; p < partes.length; p++) {
      const titulo = `Urología - ${tituloBase}${partes.length > 1 ? ` - Parte ${p + 1}` : ""}`
      console.log(`  "${titulo}": ${partes[p].length} cartões`)
      totalDecks++
      totalCards += partes[p].length
      if (DRY_RUN) continue

      const tagsUnicas = [...new Set(partes[p].flatMap((c) => c.tags ?? []))]
      const { data: novoDeck, error: deckError } = await supabase
        .from("materiais_flashcard_decks")
        .insert({ titulo, materia: "urologia", subsecao: null, disciplina_base: "patologia", descricao: null, cor_hex: "#8b5cf6", ordem: ordemGlobal++, ativo: true, tags: tagsUnicas })
        .select("id").single()
      if (deckError || !novoDeck) { console.error(`  ERRO ao criar baralho:`, deckError?.message); process.exit(1) }

      const payload = partes[p].map((c, idx) => ({ deck_id: novoDeck.id, ordem: idx + 1, frente: c.frente, verso: c.verso, fontes: c.fuente ? [c.fuente] : [] }))
      const { error: cardsError } = await supabase.from("materiais_flashcards").insert(payload)
      if (cardsError) { console.error(`  ERRO ao inserir cartões:`, cardsError.message); process.exit(1) }
    }
  }
}

console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Total: ${totalDecks} baralhos, ${totalCards} cartões.`)
