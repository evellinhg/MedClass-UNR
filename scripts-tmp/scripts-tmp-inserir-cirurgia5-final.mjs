// Insere o lote final (ja com distratores alongados e letra correta
// balanceada) de Cirurgia do 5o ano no Supabase.
// Fonte: /private/tmp/.../scratchpad/final_insert_ready.json (756 linhas
// prontas, geradas por export_dataset.py + merge_and_rebalance.py +
// final_prepare.py a partir dos arquivos originais em ~/Downloads/CIRURGIA 5).
//
// Uso: node scripts-tmp-inserir-cirurgia5-final.mjs --dry-run
//      node scripts-tmp-inserir-cirurgia5-final.mjs

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const DRY_RUN = process.argv.includes("--dry-run")

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
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

const linhas = JSON.parse(
  readFileSync(
    "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/e8738065-244a-47ab-81ef-ae2d583df7cf/scratchpad/final_insert_ready.json",
    "utf-8"
  )
)
console.log(`Lidas ${linhas.length} questoes prontas para insercao.`)

function normEnunciado(s) {
  return (s || "").trim().replace(/\s+/g, " ").toLowerCase()
}

// checagem final de dedup contra o banco (o estado pode ter mudado desde a analise)
const { data: existentes, error: errExistentes } = await supabase
  .from("questoes")
  .select("enunciado")
  .eq("materia", "cirurgia_5")

if (errExistentes) {
  console.error("Erro ao checar existentes:", errExistentes.message)
  process.exit(1)
}

const enunciadosExistentes = new Set((existentes ?? []).map((e) => normEnunciado(e.enunciado)))
const novas = linhas.filter((q) => !enunciadosExistentes.has(normEnunciado(q.enunciado)))
console.log(`Ja existentes no banco agora: ${enunciadosExistentes.size}`)
console.log(`Novas a inserir: ${novas.length} (${linhas.length - novas.length} colidiram nesta checagem final)`)

// validacao estrutural final
const problemas = []
for (const q of novas) {
  if (!q.enunciado) problemas.push(["enunciado vazio"])
  if (!Array.isArray(q.opcoes) || q.opcoes.length < 2) problemas.push(["opcoes invalidas", q.enunciado?.slice(0, 40)])
  if (q.indice_correta < 0 || q.indice_correta >= q.opcoes.length) problemas.push(["indice invalido", q.enunciado?.slice(0, 40)])
  if (q.opcoes.length !== q.opcoes_comentario.length) problemas.push(["opcoes/comentarios desalinhados", q.enunciado?.slice(0, 40)])
}
if (problemas.length > 0) {
  console.error("Problemas estruturais encontrados, abortando:")
  for (const p of problemas.slice(0, 20)) console.error(" ", p)
  process.exit(1)
}

if (DRY_RUN) {
  console.log("\n--dry-run: nada foi inserido no banco.")
  process.exit(0)
}

const TAMANHO_LOTE = 100
for (let i = 0; i < novas.length; i += TAMANHO_LOTE) {
  const lote = novas.slice(i, i + TAMANHO_LOTE)
  const { error } = await supabase.from("questoes").insert(lote)
  if (error) {
    console.error(`Erro ao inserir lote ${i}-${i + lote.length}:`, error.message)
    process.exit(1)
  }
  console.log(`Inserido lote ${i}-${i + lote.length}`)
}

console.log(`Importacao concluida: ${novas.length} questoes novas de Cirurgia do 5o ano.`)
