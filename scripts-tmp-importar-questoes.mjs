// Script reutilizável para importar lotes de questões (formato TEMPLATE_QUESTOES.txt / JSON)
// pro banco de questões do MedClass UNR. Uso: node scripts-tmp-importar-questoes.mjs
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

const ANO_LABEL_TO_KEY = {
  "1º Año": "ano1", "1º Ano": "ano1",
  "2º Año": "ano2", "2º Ano": "ano2",
  "3º Año": "ano3", "3º Ano": "ano3",
  "4º Año": "ano4", "4º Ano": "ano4",
  "5º Año": "ano5", "5º Ano": "ano5",
}

const MATERIA_LABEL_TO_KEY = {
  "Crescimento e Desenvolvimento": "crescimento_desenvolvimento",
  "Crecimiento y Desarrollo": "crescimento_desenvolvimento",
  "Nutrição": "nutricao",
  "Nutrición": "nutricao",
  "Sexualidade, Gênero e Reprodução": "sexualidade_genero_reproducao",
  "Sexualidad, Género y Reproducción": "sexualidade_genero_reproducao",
  "Trabalho e Tempo Livre": "trabalho_tempo_livre",
  "Trabajo y Tiempo Libre": "trabalho_tempo_livre",
  "Ser Humano e Seu Meio": "ser_humano_meio",
  "Ser Humano y su Medio": "ser_humano_meio",
  "Injúria": "injuria",
  "Injuria": "injuria",
  "Defesa": "defesa",
  "Defensa": "defesa",
  "Clínica Médica do 4º ano": "clinica_medica_4",
  "Clínica Médica de 4º año": "clinica_medica_4",
  "Pediatria do 4º ano": "pediatria_4",
  "Pediatría de 4º año": "pediatria_4",
  "Oftalmologia": "oftalmologia",
  "Oftalmología": "oftalmologia",
  "Otorrinolaringologia": "otorrinolaringologia",
  "Otorrinolaringología": "otorrinolaringologia",
  "Farmacologia": "farmacologia",
  "Farmacología": "farmacologia",
  "Cirurgia do 5º ano": "cirurgia_5",
  "Cirugía de 5º año": "cirurgia_5",
  "Pediatria do 5º ano": "pediatria_5",
  "Pediatría de 5º año": "pediatria_5",
  "Clínica Médica do 5º ano": "clinica_medica_5",
  "Clínica Médica de 5º año": "clinica_medica_5",
}

const PARCIAL_LABEL_TO_KEY = {
  "Primeira Parcial": "parcial1", "Primer Parcial": "parcial1", "Primeiro Parcial": "parcial1",
  "Segunda Parcial": "parcial2", "Segundo Parcial": "parcial2",
}

const DIFICULDADE_LABEL_TO_KEY = {
  "Fácil": "fácil", "Facil": "fácil",
  "Médio": "médio", "Medio": "médio",
  "Difícil": "difícil", "Dificil": "difícil",
}

function mapQuestao(q) {
  const materiaKey = MATERIA_LABEL_TO_KEY[q.materia]
  const parcialKey = PARCIAL_LABEL_TO_KEY[q.parcial]
  const dificuldadeKey = DIFICULDADE_LABEL_TO_KEY[q.dificultad ?? q.dificuldade]
  if (!materiaKey) throw new Error(`Matéria não reconhecida: "${q.materia}"`)
  if (!parcialKey) throw new Error(`Parcial não reconhecido: "${q.parcial}"`)
  if (!dificuldadeKey) throw new Error(`Dificuldade não reconhecida: "${q.dificultad ?? q.dificuldade}"`)

  const alternativas = [...q.alternativas].sort((a, b) => a.letra.localeCompare(b.letra))
  const indiceCorreta = alternativas.findIndex((a) => a.correcta ?? a.correta)
  if (indiceCorreta === -1) throw new Error(`Nenhuma alternativa correta em: "${q.enunciado}"`)

  return {
    enunciado: q.enunciado,
    materia: materiaKey,
    parcial: parcialKey,
    dificuldade: dificuldadeKey,
    opcoes: alternativas.map((a) => a.texto),
    indice_correta: indiceCorreta,
    opcoes_comentario: alternativas.map((a) => a.feedback),
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

const inputPath = process.argv[2]
if (!inputPath) {
  console.error("Uso: node scripts-tmp-importar-questoes.mjs <arquivo.json>")
  process.exit(1)
}

const raw = JSON.parse(readFileSync(inputPath, "utf-8"))
const lista = raw.preguntas ?? raw.questoes ?? raw
const mapeadas = lista.map(mapQuestao)

// Busca só as matérias presentes no lote, paginando com .range() -- o
// PostgREST corta em 1000 linhas por padrão, e a tabela já passa disso
// no total. Sem isso a checagem de duplicata fica cega pra maior parte
// da tabela (foi o que causou uma importação triplicada em produção).
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

// Chave inclui as alternativas: mesmo enunciado com respostas diferentes NÃO é duplicata,
// só bloqueia quando pergunta E alternativas são idênticas.
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
  chavesExistentes.add(chave) // também pega duplicadas dentro do próprio lote
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

console.log(`${data.length} questões inseridas com sucesso:`)
data.forEach((q, i) => console.log(`  ${i + 1}. [${q.id}] ${q.enunciado.slice(0, 60)}...`))
