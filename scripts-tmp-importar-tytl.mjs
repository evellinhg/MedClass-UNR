// Importa o lote "TYTL 2" (Trabalho e Tempo Livre) de /Users/Evelllin/Downloads/TYTL 2
// Formato de origem difere do scripts-tmp-importar-questoes.mjs: alternativas e
// feedbacks vêm como dicionário {A: "...", B: "..."} + respuesta_correcta, não
// como array de {letra, texto, correcta, feedback}.
import { createClient } from "@supabase/supabase-js"
import { readFileSync, readdirSync } from "fs"
import { join } from "path"

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

const MATERIA_LABEL_TO_KEY = {
  "Trabalho e Tempo Livre": "trabalho_tempo_livre",
  "Trabajo y Tiempo Libre": "trabalho_tempo_livre",
  "Trabajo y Tiempo Livre": "trabalho_tempo_livre", // typo recorrente no lote (mistura PT/ES)
}

const PARCIAL_LABEL_TO_KEY = {
  "Primeira Parcial": "parcial1", "Primer Parcial": "parcial1", "Primeiro Parcial": "parcial1",
  "Segunda Parcial": "parcial2", "Segundo Parcial": "parcial2",
}

const DIFICULDADE_LABEL_TO_KEY = {
  "fácil": "fácil", "facil": "fácil",
  "médio": "médio", "medio": "médio", "media": "médio", "média": "médio",
  "difícil": "difícil", "dificil": "difícil",
}

function mapQuestao(q, origem) {
  const materiaKey = MATERIA_LABEL_TO_KEY[q.materia]
  const parcialKey = PARCIAL_LABEL_TO_KEY[q.parcial]
  const dificuldadeKey = DIFICULDADE_LABEL_TO_KEY[String(q.dificultad ?? q.dificuldade ?? "").toLowerCase()]
  if (!materiaKey) throw new Error(`[${origem}] Matéria não reconhecida: "${q.materia}"`)
  if (!parcialKey) throw new Error(`[${origem}] Parcial não reconhecido: "${q.parcial}"`)
  if (!dificuldadeKey) throw new Error(`[${origem}] Dificuldade não reconhecida: "${q.dificultad ?? q.dificuldade}"`)

  const respuestaCorrecta = q.respuesta_correcta ?? q.respuesta_corrector
  const letras = Object.keys(q.alternativas).sort()
  if (!letras.includes(respuestaCorrecta)) {
    throw new Error(`[${origem} #${q.numero}] resposta correta "${respuestaCorrecta}" não está entre as alternativas ${letras.join(",")}`)
  }
  for (const letra of letras) {
    const texto = q.alternativas[letra]
    const feedback = q.feedbacks?.[letra]
    if (!texto || !texto.trim()) throw new Error(`[${origem} #${q.numero}] alternativa ${letra} vazia`)
    if (!feedback || !feedback.trim()) throw new Error(`[${origem} #${q.numero}] feedback da alternativa ${letra} ausente`)
  }

  const opcoes = letras.map((l) => q.alternativas[l])
  const opcoesComentario = letras.map((l) => q.feedbacks[l])
  const indiceCorreta = letras.indexOf(respuestaCorrecta)

  return {
    enunciado: q.enunciado,
    materia: materiaKey,
    parcial: parcialKey,
    dificuldade: dificuldadeKey,
    opcoes,
    indice_correta: indiceCorreta,
    opcoes_comentario: opcoesComentario,
    tags: q.tags ?? [],
    ativo: true,
  }
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

const pastaOrigem = process.argv[2] ?? "/Users/Evelllin/Downloads/TYTL 2"
const arquivos = readdirSync(pastaOrigem).filter((f) => f.endsWith(".json")).sort()

const mapeadas = []
const erros = []
for (const arquivo of arquivos) {
  const raw = JSON.parse(readFileSync(join(pastaOrigem, arquivo), "utf-8"))
  const lista = raw.preguntas ?? raw.questoes ?? raw
  for (const q of lista) {
    try {
      mapeadas.push(mapQuestao(q, arquivo))
    } catch (e) {
      erros.push(e.message)
    }
  }
}

console.log(`Lidos ${arquivos.length} arquivos, ${mapeadas.length} questões mapeadas, ${erros.length} rejeitadas.`)
if (erros.length > 0) {
  console.log("Rejeitadas (não serão importadas):")
  erros.forEach((e) => console.log("  - " + e))
}

const materiasDoLote = [...new Set(mapeadas.map((q) => q.materia))]
const existentes = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("questoes")
    .select("materia, enunciado, opcoes")
    .in("materia", materiasDoLote)
    .range(from, from + 999)
  if (error) {
    console.error("Erro ao verificar questões existentes:", error.message)
    process.exit(1)
  }
  existentes.push(...data)
  if (data.length < 1000) break
}

function chaveQuestao(materia, enunciado, opcoes) {
  const opcoesNorm = [...opcoes].map(normalizar).sort().join("||")
  return `${materia}|${normalizar(enunciado)}|${opcoesNorm}`
}

const chavesExistentes = new Set(existentes.map((q) => chaveQuestao(q.materia, q.enunciado, q.opcoes)))
const payload = []
const ignoradas = []

for (const q of mapeadas) {
  const chave = chaveQuestao(q.materia, q.enunciado, q.opcoes)
  if (chavesExistentes.has(chave)) {
    ignoradas.push(q.enunciado)
    continue
  }
  chavesExistentes.add(chave)
  payload.push(q)
}

if (ignoradas.length > 0) {
  console.log(`\n${ignoradas.length} questão(ões) ignorada(s) por já existir(em) (duplicada):`)
  ignoradas.forEach((enunciado, i) => console.log(`  ${i + 1}. ${enunciado.slice(0, 70)}...`))
}

if (payload.length === 0) {
  console.log("\nNenhuma questão nova para inserir.")
  process.exit(0)
}

console.log(`\nInserindo ${payload.length} questões novas...`)

const CHUNK = 200
let totalInseridas = 0
for (let i = 0; i < payload.length; i += CHUNK) {
  const lote = payload.slice(i, i + CHUNK)
  const { data, error } = await supabase.from("questoes").insert(lote).select("id")
  if (error) {
    console.error(`Erro ao inserir lote ${i / CHUNK + 1}:`, error.message)
    process.exit(1)
  }
  totalInseridas += data.length
  console.log(`  lote ${i / CHUNK + 1}: ${data.length} inseridas`)
}

console.log(`\n${totalInseridas} questões inseridas com sucesso.`)
