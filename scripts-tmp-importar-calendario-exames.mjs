// Script de uso único: importa o calendário de exames 2026/2027
// (calendario_exames_medicina_2026_2027.xlsx, aba "Tudo Junto") como
// eventos do calendário colaborativo. Cada linha vira 2 eventos:
// inscrição presencial (tipo "inscricao") e data do exame (tipo "prova").
//
// Uso: node scripts-tmp-importar-calendario-exames.mjs
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

const scratch =
  "/private/tmp/claude-502/-Users-Evelllin-Desktop-medclass-pratico/560aff66-e9a8-4825-a43d-cf88914634fe/scratchpad"
const linhas = JSON.parse(readFileSync(`${scratch}/calendario-exames-2026-2027.json`, "utf-8"))

const eventos = []
for (const linha of linhas) {
  const chamadoSufixo = linha.chamado === "Único" ? "" : ` — ${linha.chamado}`
  const rotulo = `${linha.area}${chamadoSufixo} (${linha.periodo})`

  if (linha.inscricao) {
    eventos.push({
      titulo: `Inscripción presencial — ${rotulo}`,
      descricao: null,
      data: linha.inscricao,
      hora: null,
      tipo: "inscricao",
      link: null,
      ativo: true,
    })
  }
  if (linha.exame) {
    eventos.push({
      titulo: `Examen — ${rotulo}`,
      descricao: null,
      data: linha.exame,
      hora: null,
      tipo: "prova",
      link: null,
      ativo: true,
    })
  }
}
console.log(`Total convertido: ${eventos.length} eventos (${linhas.length} linhas × 2)`)

const { data: existentes, error: erroExistentes } = await supabase.from("calendario_eventos").select("titulo, data")
if (erroExistentes) {
  console.error("Erro ao verificar eventos existentes:", erroExistentes.message)
  process.exit(1)
}

const chavesExistentes = new Set(existentes.map((e) => `${e.titulo}|${e.data}`))
const payload = []
const ignorados = []

for (const evento of eventos) {
  const chave = `${evento.titulo}|${evento.data}`
  if (chavesExistentes.has(chave)) {
    ignorados.push(evento.titulo)
    continue
  }
  chavesExistentes.add(chave)
  payload.push(evento)
}

if (ignorados.length > 0) {
  console.log(`${ignorados.length} evento(s) ignorado(s) por já existir(em):`)
  ignorados.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
}

if (payload.length === 0) {
  console.log("Nenhum evento novo para inserir.")
  process.exit(0)
}

const { data, error } = await supabase.from("calendario_eventos").insert(payload).select("id")

if (error) {
  console.error("Erro ao inserir:", error.message)
  process.exit(1)
}

console.log(`${data.length} eventos inseridos com sucesso.`)
