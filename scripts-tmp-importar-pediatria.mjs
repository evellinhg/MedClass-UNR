// Importa as questoes de Pediatria do 4o ano baixadas em Downloads.
//
// Decisoes tomadas (confirmadas com o usuario):
// - Ignora completamente os campos ANO/MATERIA de origem -- tudo vira
//   materia = "pediatria_4", inclusive itens rotulados como "Cirurgia do
//   5o ano" ou "Crescimento e Desenvolvimento / Nutricao" (contaminacao
//   de geracao, nao materia real).
// - preguntas_pediatria.json e preguntas_pediatria_v2.json sao descartados
//   por serem exportacoes duplicadas byte-a-byte (mesmo conteudo) do
//   preguntas_pediatria_v3.json, so com chaves em casing diferente.
// - parcial1/parcial2 vem do campo PARCIAL de cada questao (Primer/Primeiro
//   Parcial -> parcial1, Segundo Parcial -> parcial2) -- nao foi inventado
//   nenhum criterio de split por topico.
// - dedup por materia+enunciado+opcoes (nao so enunciado).

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

const DOWNLOADS = `${process.env.HOME}/Downloads`
const ARQUIVOS = [
  "preguntas_pediatria_v3.json",
  "preguntas_pediatria_emergencias_95.json",
  "preguntas_pediatria_fiebre_60_v2.json",
  "preguntas_pediatria_gastro_100_v2.json",
  "preguntas_pediatria_neuro_90_v3.json",
  "preguntas_pediatria_nutricion_95_v3.json",
  "preguntas_pediatria_respiratorio_95_v3.json",
  "preguntas_pediatria_unr_80_v3.json",
]

const DISCIPLINA_MAP = {
  anatomia: "anatomia",
  "biofísica": "biofisica",
  "bioquímica": "bioquimica",
  embriologia: "embriologia",
  farmacologia: "farmacologia",
  fisiologia: "fisiologia",
  "genética": "genetica",
  histologia: "histologia",
  imunologia: "imunologia",
  inmunologia: "imunologia",
  "medicina legal": "medicina_legal",
  microbiologia: "microbiologia",
  "neurología infantil": "neurologia",
  parasitologia: "parasitologia",
  patologia: "patologia",
}

function normalizarChaves(item) {
  const m = {}
  for (const [k, v] of Object.entries(item)) {
    m[k.toLowerCase().replace(/\s+/g, "_")] = v
  }
  return m
}

function normalizarParcial(valor) {
  const v = (valor || "").toLowerCase()
  if (v.includes("segundo") || v.includes("segund")) return "parcial2"
  return "parcial1"
}

function normalizarDisciplina(valor) {
  if (!valor) return null
  const chave = valor.trim().toLowerCase()
  return DISCIPLINA_MAP[chave] || chave.replace(/\s+/g, "_")
}

function mapQuestao(raw, arquivo) {
  const m = normalizarChaves(raw)
  const enunciado = (m.enunciado || "").trim()
  const opcoesObj = m.alternativas || m.opciones || {}
  const feedbackObj = m.feedback_de_cada_alternativa || m.feedback || {}
  const correta = m.resposta_correta || m.correcta

  const letras = Object.keys(opcoesObj).sort()
  const opcoes = letras.map((l) => opcoesObj[l])
  const opcoes_comentario = letras.map((l) => feedbackObj[l] ?? null)
  const indice_correta = letras.indexOf(correta)

  const tagsRaw = m.tags
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw
    : typeof tagsRaw === "string"
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : []

  const dificuldade = (m.dificuldade || m.dificultad || "").toLowerCase() || null

  return {
    enunciado,
    materia: "pediatria_4",
    dificuldade,
    disciplina_base: normalizarDisciplina(m.disciplina_base || m["disciplina_base"]),
    tags,
    opcoes,
    indice_correta,
    opcoes_comentario,
    parcial: normalizarParcial(m.parcial),
    ativo: true,
    _arquivo: arquivo,
  }
}

const todas = []
for (const arquivo of ARQUIVOS) {
  const raw = JSON.parse(readFileSync(`${DOWNLOADS}/${arquivo}`, "utf-8"))
  for (const item of raw) {
    const q = mapQuestao(item, arquivo)
    todas.push(q)
  }
}

console.log(`Lidas ${todas.length} questoes de ${ARQUIVOS.length} arquivos.`)

// valida estrutura antes de importar
const problemas = []
for (const q of todas) {
  if (!q.enunciado) problemas.push([q._arquivo, "enunciado vazio"])
  if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) problemas.push([q._arquivo, "opcoes invalidas", q.enunciado?.slice(0, 40)])
  if (q.indice_correta < 0) problemas.push([q._arquivo, "indice_correta invalido", q.enunciado?.slice(0, 40)])
  if (q.opcoes.length !== q.opcoes_comentario.length) problemas.push([q._arquivo, "opcoes/comentarios desalinhados", q.enunciado?.slice(0, 40)])
}
if (problemas.length > 0) {
  console.error("Problemas estruturais encontrados, abortando:")
  for (const p of problemas.slice(0, 20)) console.error(" ", p)
  process.exit(1)
}

// dedup interno (entre os proprios arquivos) por materia+enunciado+opcoes
const vistos = new Set()
const unicas = []
let dupInterna = 0
for (const q of todas) {
  const chave = `${q.materia}|${q.enunciado}|${q.opcoes.join("~")}`
  if (vistos.has(chave)) {
    dupInterna++
    continue
  }
  vistos.add(chave)
  unicas.push(q)
}
console.log(`Duplicadas internamente (entre os proprios arquivos): ${dupInterna}`)

// dedup contra o banco (materia+enunciado+opcoes)
const { data: existentes, error: errExistentes } = await supabase
  .from("questoes")
  .select("enunciado, opcoes")
  .eq("materia", "pediatria_4")

if (errExistentes) {
  console.error("Erro ao checar existentes:", errExistentes.message)
  process.exit(1)
}

const chavesExistentes = new Set((existentes ?? []).map((e) => `pediatria_4|${e.enunciado}|${(e.opcoes ?? []).join("~")}`))
const novas = unicas.filter((q) => !chavesExistentes.has(`${q.materia}|${q.enunciado}|${q.opcoes.join("~")}`))

console.log(`Ja existentes no banco (pediatria_4): ${chavesExistentes.size}`)
console.log(`Novas a importar: ${novas.length}`)

const porParcial = novas.reduce((acc, q) => {
  acc[q.parcial] = (acc[q.parcial] ?? 0) + 1
  return acc
}, {})
console.log("Por parcial:", porParcial)

const linhas = novas.map(({ _arquivo, ...q }) => q)

const TAMANHO_LOTE = 100
for (let i = 0; i < linhas.length; i += TAMANHO_LOTE) {
  const lote = linhas.slice(i, i + TAMANHO_LOTE)
  const { error } = await supabase.from("questoes").insert(lote)
  if (error) {
    console.error(`Erro ao inserir lote ${i}-${i + lote.length}:`, error.message)
    process.exit(1)
  }
  console.log(`Inserido lote ${i}-${i + lote.length}`)
}

console.log(`Importacao concluida: ${linhas.length} questoes novas de Pediatria do 4o ano.`)
