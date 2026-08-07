// Importa 3 lotes de 150 flashcards de Otorrinolaringologia (oído, nariz,
// faringe/laringe) como cartões novos DENTRO dos 3 baralhos existentes
// (criados por scripts-tmp-importar-flashcards-orl.mjs, ordem 167-169) --
// não cria baralhos novos, só continua a ordem dos cartões.
//
// Cada arquivo usa nomes de campo diferentes para frente/verso:
//   oido:    frente / dorso   (+ fuente string)
//   faringe: frente / verso
//   nariz:   pregunta / respuesta  (sem ano/parcial/disciplina_base por card)
//
// Uso: node scripts-tmp-importar-flashcards-orl-150.mjs
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
const HOME = process.env.HOME

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

const LOTES = [
  {
    nome: "Otología (oído)",
    deckId: "9781112a-d9d1-48f0-807b-2a84db3d6139",
    arquivo: `${HOME}/Downloads/preguntas_examen.oido._orl_150_flashcards.json`,
    map: (c) => ({
      frente: c.frente,
      verso: c.dorso,
      fontes: c.fuente ? [c.fuente] : [],
      tags: c.tags ?? [],
    }),
  },
  {
    nome: "Faringo-Laringología",
    deckId: "74dbf5bb-cc24-4b60-9d24-d3cabdb955e6",
    arquivo: `${HOME}/Downloads/flashcards_orl_faringe.json`,
    map: (c) => ({
      frente: c.frente,
      verso: c.verso,
      fontes: [],
      tags: c.tags ?? [],
    }),
  },
  {
    nome: "Rinología (nariz)",
    deckId: "dca30c3c-90bc-46c7-9282-10bfb8932566",
    arquivo: `${HOME}/Downloads/flashcards_nariz.orl_150.json`,
    map: (c) => ({
      frente: c.pregunta,
      verso: c.respuesta,
      fontes: [],
      tags: c.tags ?? [],
    }),
  },
]

for (const lote of LOTES) {
  const raw = JSON.parse(readFileSync(lote.arquivo, "utf-8"))
  const mapeadas = raw.map(lote.map)

  const vazias = mapeadas.filter((c) => !c.frente?.trim() || !c.verso?.trim())
  if (vazias.length > 0) {
    console.error(`[${lote.nome}] ${vazias.length} cartão(ões) com frente/verso vazio -- abortando este lote.`)
    continue
  }

  const { data: deckAtual, error: deckError } = await supabase
    .from("materiais_flashcard_decks")
    .select("id, titulo, tags")
    .eq("id", lote.deckId)
    .single()
  if (deckError || !deckAtual) {
    console.error(`[${lote.nome}] baralho não encontrado:`, deckError?.message)
    continue
  }

  const { data: existentes, error: existentesError } = await supabase
    .from("materiais_flashcards")
    .select("frente, ordem")
    .eq("deck_id", lote.deckId)
  if (existentesError) {
    console.error(`[${lote.nome}] erro ao buscar cartões existentes:`, existentesError.message)
    continue
  }

  const frentesExistentes = new Set(existentes.map((c) => normalizar(c.frente)))
  let proximaOrdem = Math.max(0, ...existentes.map((c) => c.ordem)) + 1

  const payload = []
  const ignoradas = []
  for (const c of mapeadas) {
    const chave = normalizar(c.frente)
    if (frentesExistentes.has(chave)) {
      ignoradas.push(c.frente)
      continue
    }
    frentesExistentes.add(chave)
    payload.push({
      deck_id: lote.deckId,
      ordem: proximaOrdem++,
      frente: c.frente,
      verso: c.verso,
      fontes: c.fontes,
    })
  }

  if (ignoradas.length > 0) {
    console.log(`[${lote.nome}] ${ignoradas.length} cartão(ões) ignorado(s) por já existir(em).`)
  }

  if (payload.length === 0) {
    console.log(`[${lote.nome}] nenhum cartão novo para inserir.`)
    continue
  }

  const { data: inseridos, error: insertError } = await supabase
    .from("materiais_flashcards")
    .insert(payload)
    .select("id")
  if (insertError) {
    console.error(`[${lote.nome}] erro ao inserir cartões:`, insertError.message)
    continue
  }

  const tagsUnicas = [...new Set([...(deckAtual.tags ?? []), ...mapeadas.flatMap((c) => c.tags)])]
  const { error: tagsError } = await supabase
    .from("materiais_flashcard_decks")
    .update({ tags: tagsUnicas })
    .eq("id", lote.deckId)
  if (tagsError) {
    console.error(`[${lote.nome}] erro ao atualizar tags do baralho:`, tagsError.message)
  }

  console.log(`[${lote.nome}] "${deckAtual.titulo}": ${inseridos.length} cartões novos inseridos.`)
}
