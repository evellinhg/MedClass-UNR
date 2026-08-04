// Script de uso único: importa flashcards-orl-mayo-2026.json (3 baralhos,
// 10 cartões cada, de Otorrinolaringologia) como novos baralhos em
// materiais_flashcard_decks/materiais_flashcards. O arquivo trazia
// "parcial": "parcial2", mas ORL só tem parcial1 na grade e os baralhos de
// flashcard não têm campo de parcial de qualquer forma -- irrelevante aqui.
//
// Uso: node scripts-tmp-importar-flashcards-orl.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=")
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const raw = JSON.parse(readFileSync(`${process.env.HOME}/Downloads/flashcards-orl-mayo-2026.json`, "utf-8"))

let ordem = 167
let totalCards = 0

for (const deck of raw) {
  if (deck.materia !== "otorrinolaringologia") {
    console.error(`Matéria inesperada: "${deck.materia}"`)
    process.exit(1)
  }

  const tagsUnicas = [...new Set(deck.cards.flatMap((c) => c.tags ?? []))]

  const deckPayload = {
    titulo: `Otorrinolaringología - ${deck.tema_general}`,
    materia: deck.materia,
    subsecao: null,
    disciplina_base: deck.disciplina_base ?? null,
    descricao: null,
    cor_hex: "#8b5cf6",
    ordem: ordem++,
    ativo: true,
    tags: tagsUnicas,
  }

  const { data: novoDeck, error: deckError } = await supabase
    .from("materiais_flashcard_decks")
    .insert(deckPayload)
    .select("id")
    .single()

  if (deckError || !novoDeck) {
    console.error("Erro ao criar baralho:", deckError?.message)
    process.exit(1)
  }

  const cardsPayload = deck.cards.map((c, idx) => ({
    deck_id: novoDeck.id,
    ordem: idx + 1,
    frente: c.frente,
    verso: c.verso,
    fontes: c.fuente ? [c.fuente] : [],
  }))

  const { data: cards, error: cardsError } = await supabase
    .from("materiais_flashcards")
    .insert(cardsPayload)
    .select("id")

  if (cardsError) {
    console.error("Erro ao inserir cartões:", cardsError.message)
    process.exit(1)
  }

  console.log(`Baralho "${deckPayload.titulo}" criado (id ${novoDeck.id}) com ${cards.length} cartões.`)
  totalCards += cards.length
}

console.log(`Total: ${raw.length} baralhos, ${totalCards} cartões.`)
