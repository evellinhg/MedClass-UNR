// Script de uso único: importa flashcards_cirugia.json (20 cartões de Cirurgia)
// como um baralho novo em materiais_flashcard_decks/materiais_flashcards.
// O arquivo trazia "parcial": "parcial2" no metadado geral, mas Cirurgia só
// tem um parcial na grade -- o baralho não guarda parcial (não existe essa
// coluna), então isso só afeta o título (removido "Segundo Parcial" dele).
//
// Uso: node scripts-tmp-importar-flashcards-cirurgia.mjs
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

const raw = JSON.parse(readFileSync(`${process.env.HOME}/Downloads/flashcards_cirugia.json`, "utf-8"))

if (raw.materia !== "cirurgia_5") {
  console.error(`Matéria inesperada no arquivo: "${raw.materia}" (esperado "cirurgia_5")`)
  process.exit(1)
}

const tagsUnicas = [...new Set(raw.flashcards.flatMap((fc) => fc.tags ?? []))]

const deckPayload = {
  titulo: "Cirugía - Clínica Quirúrgica",
  materia: raw.materia,
  subsecao: null,
  disciplina_base: null, // cartões vêm de disciplinas diferentes (anatomia/fisiologia/patologia)
  descricao: null,
  cor_hex: "#8b5cf6", // mesmo fallback que a UI usa quando disciplina_base é null
  ordem: 166,
  ativo: true,
  tags: tagsUnicas,
}

const { data: deck, error: deckError } = await supabase
  .from("materiais_flashcard_decks")
  .insert(deckPayload)
  .select("id")
  .single()

if (deckError || !deck) {
  console.error("Erro ao criar baralho:", deckError?.message)
  process.exit(1)
}

const cardsPayload = raw.flashcards.map((fc, idx) => ({
  deck_id: deck.id,
  ordem: idx + 1,
  frente: fc.frente,
  verso: fc.verso,
  fontes: fc.fonte ? [fc.fonte] : [],
}))

const { data: cards, error: cardsError } = await supabase
  .from("materiais_flashcards")
  .insert(cardsPayload)
  .select("id")

if (cardsError) {
  console.error("Erro ao inserir cartões:", cardsError.message)
  process.exit(1)
}

console.log(`Baralho "${deckPayload.titulo}" criado (id ${deck.id}) com ${cards.length} cartões.`)
