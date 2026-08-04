// Script de uso único: importa as questões extraídas dos 9 PDFs de revisão de
// tentativas do Moodle (1er e 2do Examen Parcial de Cirugía, UNR 2023).
// Cada PDF é uma tentativa distinta de um aluno diferente sobre o mesmo banco
// de questões -- foram deduplicadas manualmente por enunciado, cruzando as
// tentativas pra confirmar a alternativa correta (o Moodle não revela a
// resposta certa nas questões que o aluno errou, só marca a escolha errada).
// Pra essas, a resposta e o feedback foram determinados por conhecimento
// médico e não por uma tentativa "Correcta" do arquivo de origem.
//
// Uso: node scripts-tmp-importar-cirurgia-moodle.mjs
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

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function converterItem(item, parcialKey, dificuldadeKey) {
  const alternativas = Object.entries(item.alternativas).map(([letra, texto]) => ({
    letra,
    texto,
    correcta: letra === item.correcta,
    feedback: item.feedback[letra],
  }))
  alternativas.sort((a, b) => a.letra.localeCompare(b.letra))
  const indiceCorreta = alternativas.findIndex((a) => a.correcta)
  if (indiceCorreta === -1) throw new Error(`Sem alternativa correta: "${item.enunciado}"`)

  return {
    enunciado: item.enunciado,
    materia: MATERIA_KEY,
    parcial: parcialKey,
    dificuldade: dificuldadeKey,
    opcoes: alternativas.map((a) => a.texto),
    indice_correta: indiceCorreta,
    opcoes_comentario: alternativas.map((a) => a.feedback),
    tags: [],
    ativo: true,
  }
}

const scratch = "/private/tmp/claude-502/-Users-Evelllin-Desktop-medclass-pratico/560aff66-e9a8-4825-a43d-cf88914634fe/scratchpad"
const p1 = JSON.parse(readFileSync(`${scratch}/cirugia-p1.json`, "utf-8"))
const p2 = JSON.parse(readFileSync(`${scratch}/cirugia-p2.json`, "utf-8"))

// Dificuldade não veio do processo de extração (é conteúdo gerado a partir de
// PDFs de prova real, não de um lote com dificuldade rotulada) -- todas como
// "médio" por padrão, nível intermediário razoável para questões de exame
// parcial de residência/graduação.
const mapeadas = [
  ...p1.map((q) => converterItem(q, "parcial1", "médio")),
  ...p2.map((q) => converterItem(q, "parcial2", "médio")),
]
console.log(`Total convertido: ${mapeadas.length} questões (${p1.length} parcial1 + ${p2.length} parcial2, antes de dedup interno)`)

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
