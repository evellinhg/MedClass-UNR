// Importa um bloco de Pediatria do 5o ano a partir de um arquivo em
// Downloads, no padrao medclass_up*_bloco*.json.
// Uso: node scripts-tmp-importar-pediatria-5-bloco.mjs <nome-do-arquivo>

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

const nomeArquivo = process.argv[2]
if (!nomeArquivo) {
  console.error("Uso: node scripts-tmp-importar-pediatria-5-bloco.mjs <nome-do-arquivo.json>")
  process.exit(1)
}
const ARQUIVO = `${process.env.HOME}/Downloads/${nomeArquivo}`

const DISCIPLINA_MAP = {
  "fisiología": "fisiologia",
  fisiologia: "fisiologia",
  patologia: "patologia",
  "patología": "patologia",
  "farmacología": "farmacologia_base",
  farmacologia: "farmacologia_base",
  microbiologia: "microbiologia",
  "microbiología": "microbiologia",
  "bioquímica": "bioquimica",
  "genética": "genetica",
  genetica: "genetica",
  inmunologia: "imunologia",
  imunologia: "imunologia",
  "inmunología": "imunologia",
  parasitologia: "parasitologia",
  "biofísica": "biofisica",
  "anatomía": "anatomia",
  anatomia: "anatomia",
  histologia: "histologia",
  "histología": "histologia",
  embriologia: "embriologia",
  "embriología": "embriologia",
}

function normalizarDisciplina(valor) {
  if (!valor) return null
  const chave = valor.trim().toLowerCase()
  return DISCIPLINA_MAP[chave] || chave.replace(/\s+/g, "_")
}

function normalizarParcial(valor) {
  const v = (valor || "").toLowerCase()
  if (v.includes("segundo") || v.includes("segund")) return "parcial2"
  return "parcial1"
}

function mapQuestao(raw) {
  const enunciado = (raw.enunciado || "").trim()
  const opcoesObj = raw.alternativas || {}
  const feedbackObj = raw.feedbacks || {}
  const correta = raw.respuesta_correcta

  const letras = Object.keys(opcoesObj).sort()
  const opcoes = letras.map((l) => opcoesObj[l])
  const opcoes_comentario = letras.map((l) => feedbackObj[l] ?? null)
  const indice_correta = letras.indexOf(correta)

  const tagsRaw = raw.tags
  const tags = Array.isArray(tagsRaw) ? tagsRaw : []

  return {
    enunciado,
    materia: "pediatria_5",
    dificuldade: (raw.dificultad || "").trim().toLowerCase() || null,
    disciplina_base: normalizarDisciplina(raw.disciplina_base),
    tags,
    opcoes,
    indice_correta,
    opcoes_comentario,
    parcial: normalizarParcial(raw.parcial),
    ativo: true,
  }
}

const raw = JSON.parse(readFileSync(ARQUIVO, "utf-8"))
const todas = raw.map(mapQuestao)

console.log(`Lidas ${todas.length} questoes de ${nomeArquivo}.`)

const problemas = []
for (const q of todas) {
  if (!q.enunciado) problemas.push("enunciado vazio")
  if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) problemas.push(`opcoes invalidas: ${q.enunciado?.slice(0, 40)}`)
  if (q.indice_correta < 0) problemas.push(`indice_correta invalido: ${q.enunciado?.slice(0, 40)}`)
  if (q.opcoes.length !== q.opcoes_comentario.length) problemas.push(`opcoes/comentarios desalinhados: ${q.enunciado?.slice(0, 40)}`)
}
if (problemas.length > 0) {
  console.error("Problemas estruturais encontrados, abortando:")
  for (const p of problemas) console.error(" ", p)
  process.exit(1)
}

const vistos = new Set()
const unicas = []
let dupInterna = 0
for (const q of todas) {
  const chave = `${q.enunciado}|${q.opcoes.join("~")}`
  if (vistos.has(chave)) { dupInterna++; continue }
  vistos.add(chave)
  unicas.push(q)
}
console.log(`Duplicadas internamente: ${dupInterna}`)

const { data: existentes, error: errExistentes } = await supabase
  .from("questoes")
  .select("enunciado, opcoes")
  .eq("materia", "pediatria_5")

if (errExistentes) {
  console.error("Erro ao checar existentes:", errExistentes.message)
  process.exit(1)
}

const chavesExistentes = new Set((existentes ?? []).map((e) => `${e.enunciado}|${(e.opcoes ?? []).join("~")}`))
const novas = unicas.filter((q) => !chavesExistentes.has(`${q.enunciado}|${q.opcoes.join("~")}`))

console.log(`Ja existentes no banco (pediatria_5): ${chavesExistentes.size}`)
console.log(`Novas a importar: ${novas.length}`)

if (novas.length > 0) {
  const { error } = await supabase.from("questoes").insert(novas)
  if (error) {
    console.error("Erro ao inserir:", error.message)
    process.exit(1)
  }
}

console.log(`Importacao concluida: ${novas.length} questoes novas de Pediatria do 5o ano.`)
