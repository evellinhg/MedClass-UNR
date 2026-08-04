// Script de uso único: converte e importa os 10 arquivos GYO.PARCIALx.BLOCKy.json
// (Ginecología y Obstetricia) pro banco de questões do MedClass UNR.
// Cada arquivo veio com uma estrutura diferente (lista solta, objeto único,
// campos dentro de "metadatos" ou não, alternativas em dict A/B/C/D ou a/b/c/d,
// respuesta_correcta/respuesta_correta com erro de digitação, feedback como
// dict por alternativa ou como um parágrafo único) -- esse script normaliza
// tudo antes de reusar a lógica de dedupe/insert do scripts-tmp-importar-questoes.mjs.
//
// Uso: node scripts-tmp-importar-gyo.mjs
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

const PARCIAL_LABEL_TO_KEY = {
  "Primer Parcial": "parcial1",
  "Segundo Parcial": "parcial2",
}

const DIFICULDADE_LABEL_TO_KEY = {
  "Fácil": "fácil", "Facil": "fácil",
  "Médio": "médio", "Medio": "médio", "Media": "médio",
  "Difícil": "difícil", "Dificil": "difícil",
  // Único valor fora do padrão nos arquivos de origem -- confirmado com o usuário.
  "Médio/Difícil": "difícil",
}

// Todas as questões desse lote são de Ginecología y Obstetricia por decisão
// explícita do usuário, independente do rótulo de "materia" de cada arquivo
// de origem (Farmacología, Defensa, Injuria, Sexualidad..., Clínica Médica).
const MATERIA_KEY = "ginecologia_obstetricia"

// A plataforma não renderiza LaTeX -- alguns itens (ex: BLOCK3 do Primer
// Parcial) vieram com notação tipo "$\beta$-hCG de $1.800$ UI/L" que
// apareceria quebrada na tela do aluno. Converte pra texto plano equivalente.
function limparLatex(texto) {
  if (typeof texto !== "string") return texto
  return texto
    .replace(/\\beta/g, "β")
    .replace(/\\alpha/g, "α")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\ge/g, "≥")
    .replace(/\\le/g, "≤")
    .replace(/\^\\circ\\text\{([^}]*)\}/g, "°$1")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\$/g, "")
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function extrairItens(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === "object") {
    for (const v of Object.values(raw)) {
      if (Array.isArray(v)) return v
    }
    if (raw.enunciado) return [raw]
  }
  return []
}

function converterItem(item, parcialLabel) {
  const meta = item.metadatos ?? item
  const dificultadRaw = meta.dificultad ?? meta.dificuldade ?? item.dificultad ?? item.dificuldade
  const dificuldadeKey = DIFICULDADE_LABEL_TO_KEY[dificultadRaw]
  if (!dificuldadeKey) throw new Error(`Dificuldade não reconhecida: "${dificultadRaw}"`)

  const respostaRaw = String(item.respuesta_correcta ?? item.respuesta_correta ?? "")
  const feedbackSrc = item.feedback ?? item.feedback_detallado

  const alternativas = Object.entries(item.alternativas ?? {}).map(([letra, texto]) => {
    const correcta = letra.toLowerCase() === respostaRaw.toLowerCase()
    let feedback = ""
    if (feedbackSrc && typeof feedbackSrc === "object") {
      const entrada = Object.entries(feedbackSrc).find(([k]) => k.toLowerCase() === letra.toLowerCase())
      feedback = entrada ? entrada[1] : ""
    } else if (typeof feedbackSrc === "string") {
      feedback = correcta ? feedbackSrc : ""
    }
    return { letra: letra.toUpperCase(), texto: limparLatex(texto), correcta, feedback: limparLatex(feedback) }
  })

  if (!alternativas.some((a) => a.correcta)) {
    throw new Error(`Nenhuma alternativa correta em: "${item.enunciado}" (resposta="${respostaRaw}")`)
  }

  const parcialKey = PARCIAL_LABEL_TO_KEY[parcialLabel]
  if (!parcialKey) throw new Error(`Parcial não reconhecido: "${parcialLabel}"`)

  alternativas.sort((a, b) => a.letra.localeCompare(b.letra))
  const indiceCorreta = alternativas.findIndex((a) => a.correcta)

  return {
    enunciado: limparLatex(item.enunciado),
    materia: MATERIA_KEY,
    parcial: parcialKey,
    dificuldade: dificuldadeKey,
    opcoes: alternativas.map((a) => a.texto),
    indice_correta: indiceCorreta,
    opcoes_comentario: alternativas.map((a) => a.feedback),
    tags: (meta.tags ?? item.tags ?? []).map(limparLatex),
    ativo: true,
  }
}

const ARQUIVOS = [
  ["GYO.PARCIAL1.BLOCK1.json", "Primer Parcial"],
  ["GYO.PARCIAL1.BLOCK3.json", "Primer Parcial"],
  ["GYO.PARCIAL1.BLOCK5.json", "Primer Parcial"],
  ["GYO.PARCIAL2.BLOCK1.json", "Segundo Parcial"],
  ["GYO.PARCIAL2.BLOCK2.json", "Segundo Parcial"],
  ["GYO.PARCIAL2.BLOCK3.json", "Segundo Parcial"],
  ["GYO.PARCIAL2.BLOCK4.json", "Segundo Parcial"],
  ["GYO.PARCIAL2.BLOCK5.json", "Segundo Parcial"],
]

const downloadsDir = `${process.env.HOME}/Downloads`
let mapeadas = []
for (const [nome, parcialLabel] of ARQUIVOS) {
  const raw = JSON.parse(readFileSync(`${downloadsDir}/${nome}`, "utf-8"))
  const itens = extrairItens(raw)
  console.log(`${nome}: ${itens.length} questão(ões)`)
  for (const item of itens) {
    mapeadas.push(converterItem(item, parcialLabel))
  }
}
console.log(`Total convertido: ${mapeadas.length} questões`)

// PostgREST corta em 1000 linhas por padrão -- pagina pra checar duplicata
// contra a tabela inteira da matéria, não só a primeira página.
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
