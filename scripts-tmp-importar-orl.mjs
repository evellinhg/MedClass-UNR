// Script de uso único: importa preguntas-orl-mayo-2026.json (30 questões de
// Otorrinolaringologia, 4º ano). O arquivo trazia "parcial": "Segundo Parcial"
// em todas, mas ORL só tem parcial1 na grade (confirmado com o usuário) --
// força parcial1 e ignora o rótulo de origem. Alternativas vêm em dict A-D
// (não na lista {letra,texto,...} que o importador padrão espera) e o campo
// de feedback se chama "feedbacks" (plural), diferente dos outros lotes.
//
// Uso: node scripts-tmp-importar-orl.mjs
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

const MATERIA_KEY = "otorrinolaringologia"
const PARCIAL_KEY = "parcial1" // ORL só tem 1 parcial na grade -- ignora "Segundo Parcial" do arquivo.

const DIFICULDADE_LABEL_TO_KEY = {
  "Fácil": "fácil", "Facil": "fácil",
  "Médio": "médio", "Medio": "médio",
  "Difícil": "difícil", "Dificil": "difícil",
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function converterItem(item) {
  const dificuldadeKey = DIFICULDADE_LABEL_TO_KEY[item.dificultad ?? item.dificuldade]
  if (!dificuldadeKey) throw new Error(`Dificuldade não reconhecida: "${item.dificultad}"`)

  const respostaRaw = String(item.respuesta_correcta ?? item.respuesta_correta ?? "")
  const feedbackSrc = item.feedback ?? item.feedbacks

  const alternativas = Object.entries(item.alternativas ?? {})
    .map(([letra, texto]) => {
      const correcta = letra.toLowerCase() === respostaRaw.toLowerCase()
      const entrada = Object.entries(feedbackSrc ?? {}).find(([k]) => k.toLowerCase() === letra.toLowerCase())
      return { letra: letra.toUpperCase(), texto, correcta, feedback: entrada ? entrada[1] : "" }
    })
    .sort((a, b) => a.letra.localeCompare(b.letra))

  if (!alternativas.some((a) => a.correcta)) {
    throw new Error(`Nenhuma alternativa correta em: "${item.enunciado}" (resposta="${respostaRaw}")`)
  }

  return {
    enunciado: item.enunciado,
    materia: MATERIA_KEY,
    parcial: PARCIAL_KEY,
    dificuldade: dificuldadeKey,
    opcoes: alternativas.map((a) => a.texto),
    indice_correta: alternativas.findIndex((a) => a.correcta),
    opcoes_comentario: alternativas.map((a) => a.feedback),
    tags: item.tags ?? [],
    ativo: true,
  }
}

const raw = JSON.parse(readFileSync(`${process.env.HOME}/Downloads/preguntas-orl-mayo-2026.json`, "utf-8"))
const mapeadas = raw.map(converterItem)
console.log(`Total convertido: ${mapeadas.length} questões`)

const existentes = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("questoes")
    .select("materia, enunciado, opcoes")
    .eq("materia", MATERIA_KEY)
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
  console.log(`${ignoradas.length} questão(ões) ignorada(s) por já existir(em) (duplicada):`)
  ignoradas.forEach((enunciado, i) => console.log(`  ${i + 1}. ${enunciado.slice(0, 70)}...`))
}

if (payload.length === 0) {
  console.log("Nenhuma questão nova para inserir.")
  process.exit(0)
}

const { data, error } = await supabase.from("questoes").insert(payload).select("id, enunciado")

if (error) {
  console.error("Erro ao inserir:", error.message)
  process.exit(1)
}

console.log(`${data.length} questões inseridas com sucesso.`)
