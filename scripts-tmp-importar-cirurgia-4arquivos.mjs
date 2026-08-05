// Script de uso único: importa 4 arquivos de Cirurgia (2do_parcial_cirugia_2017,
// 1er_parcial_cirugia_5to_ano, 2do_parcial_cirugia_temas_variados,
// 2do_parcial_cirugia_2020), 20 questões cada, já em formato canônico.
//
// Uso: node scripts-tmp-importar-cirurgia-4arquivos.mjs
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

const MATERIA_KEY = "cirurgia_5"

const PARCIAL_LABEL_TO_KEY = {
  "Primeiro Parcial": "parcial1", "Primeira Parcial": "parcial1", "Primer Parcial": "parcial1",
  "Segundo Parcial": "parcial2",
}

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
  const parcialKey = PARCIAL_LABEL_TO_KEY[item.parcial]
  if (!parcialKey) throw new Error(`Parcial não reconhecido: "${item.parcial}"`)

  const dificuldadeKey = DIFICULDADE_LABEL_TO_KEY[item.dificultad]
  if (!dificuldadeKey) throw new Error(`Dificuldade não reconhecida: "${item.dificultad}"`)

  const respostaRaw = String(item.respuesta_correcta ?? "")
  const alternativas = Object.entries(item.alternativas ?? {})
    .map(([letra, texto]) => {
      const correcta = letra.toLowerCase() === respostaRaw.toLowerCase()
      const entrada = Object.entries(item.feedbacks ?? {}).find(([k]) => k.toLowerCase() === letra.toLowerCase())
      return { letra: letra.toUpperCase(), texto, correcta, feedback: entrada ? entrada[1] : "" }
    })
    .sort((a, b) => a.letra.localeCompare(b.letra))

  if (!alternativas.some((a) => a.correcta)) {
    throw new Error(`Nenhuma alternativa correta em: "${item.enunciado}" (resposta="${respostaRaw}")`)
  }

  return {
    enunciado: item.enunciado,
    materia: MATERIA_KEY,
    parcial: parcialKey,
    dificuldade: dificuldadeKey,
    opcoes: alternativas.map((a) => a.texto),
    indice_correta: alternativas.findIndex((a) => a.correcta),
    opcoes_comentario: alternativas.map((a) => a.feedback),
    tags: item.tags ?? [],
    ativo: true,
  }
}

const ARQUIVOS = [
  "2do_parcial_cirugia_2017.json",
  "1er_parcial_cirugia_5to_ano.json",
  "2do_parcial_cirugia_temas_variados.json",
  "2do_parcial_cirugia_2020.json",
]

const downloadsDir = `${process.env.HOME}/Downloads`
let mapeadas = []
for (const nome of ARQUIVOS) {
  const raw = JSON.parse(readFileSync(`${downloadsDir}/${nome}`, "utf-8"))
  console.log(`${nome}: ${raw.length} questão(ões)`)
  mapeadas.push(...raw.map(converterItem))
}
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

const { data, error } = await supabase.from("questoes").insert(payload).select("id, enunciado, parcial")

if (error) {
  console.error("Erro ao inserir:", error.message)
  process.exit(1)
}

const p1Count = data.filter((d) => d.parcial === "parcial1").length
const p2Count = data.filter((d) => d.parcial === "parcial2").length
console.log(`${data.length} questões inseridas com sucesso (${p1Count} parcial1 + ${p2Count} parcial2).`)
