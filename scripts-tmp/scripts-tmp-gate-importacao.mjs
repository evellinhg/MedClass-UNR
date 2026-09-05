// Gate de importação: valida um lote de questões recém-inseridas
// (ativo=false) e só ativa (ativo=true) as que passam. Ver
// lib-qa-questoes.mjs para as regras.
//
// IMPORTANTE: recebe uma lista EXPLÍCITA de ids via --ids-file, nunca
// "todas as inativas da matéria X" -- ao longo desta sessão várias
// questões foram desativadas de propósito por outros motivos (template
// falso, duplicata, corrupção sem conteúdo recuperável) e continuam
// devendo ficar inativas. Rodar isso "por matéria" reativaria lixo.
//
// Uso recomendado para um NOVO script de importação:
//   const { data: inseridas } = await supabase.from("questoes")
//     .insert(novasLinhas.map(l => ({ ...l, ativo: false })))
//     .select("id")
//   writeFileSync("scripts-tmp/lote-<materia>-<data>.json", JSON.stringify(inseridas.map(r => r.id)))
//
// Depois:
//   node scripts-tmp/scripts-tmp-gate-importacao.mjs --ids-file scripts-tmp/lote-<materia>-<data>.json
//   node scripts-tmp/scripts-tmp-gate-importacao.mjs --ids-file ... --force   # ativa mesmo com avisos (nunca com erros)

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { validarLote } from "./lib-qa-questoes.mjs"

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const args = process.argv.slice(2)
const idsFileIdx = args.indexOf("--ids-file")
const force = args.includes("--force")
const dryRun = args.includes("--dry-run")

if (idsFileIdx === -1 || !args[idsFileIdx + 1]) {
  console.error("Uso: node scripts-tmp-gate-importacao.mjs --ids-file <caminho.json> [--force] [--dry-run]")
  console.error("  <caminho.json> deve conter um array JSON de ids (uuid) de questoes recém-inseridas.")
  process.exit(1)
}

const ids = JSON.parse(readFileSync(args[idsFileIdx + 1], "utf-8"))
if (!Array.isArray(ids) || ids.length === 0) {
  console.error("Arquivo de ids vazio ou inválido.")
  process.exit(1)
}

console.log(`Validando lote de ${ids.length} questões...`)

let questoes = []
{
  const pageSize = 200
  for (let i = 0; i < ids.length; i += pageSize) {
    const chunk = ids.slice(i, i + pageSize)
    const { data, error } = await supabase
      .from("questoes")
      .select("id,materia,enunciado,opcoes,opcoes_comentario,indice_correta,ativo")
      .in("id", chunk)
    if (error) { console.error(error); process.exit(1) }
    questoes.push(...data)
  }
}

const idsNaoEncontrados = ids.filter((id) => !questoes.some((q) => q.id === id))
if (idsNaoEncontrados.length) {
  console.log(`\nAVISO: ${idsNaoEncontrados.length} id(s) do arquivo não encontrados no banco:`)
  idsNaoEncontrados.forEach((id) => console.log(`  - ${id}`))
}

const jaAtivas = questoes.filter((q) => q.ativo)
if (jaAtivas.length) {
  console.log(`\nAVISO: ${jaAtivas.length} questão(ões) do lote já estavam ativo=true (não fazem parte de uma importação nova?):`)
  jaAtivas.forEach((q) => console.log(`  - ${q.id}`))
}

const { erros, avisos, porQuestao } = validarLote(questoes)

console.log(`\n--- Erros (bloqueiam ativação, mesmo com --force): ${erros.length} ---`)
erros.forEach((e) => console.log(`  ✗ ${e}`))

console.log(`\n--- Avisos (bloqueiam sem --force): ${avisos.length} ---`)
avisos.forEach((a) => console.log(`  ⚠ ${a}`))

const idsComErro = new Set()
for (const [id, r] of porQuestao) if (r.erros.length > 0) idsComErro.add(id)

const idsComAviso = new Set()
for (const [id, r] of porQuestao) if (r.avisos.length > 0) idsComAviso.add(id)

const idsParaAtivar = questoes
  .filter((q) => !q.ativo)
  .filter((q) => !idsComErro.has(q.id))
  .filter((q) => force || !idsComAviso.has(q.id))
  .map((q) => q.id)

const idsRetidos = questoes.filter((q) => !q.ativo && !idsParaAtivar.includes(q.id)).map((q) => q.id)

console.log(`\n--- Resultado ---`)
console.log(`Aprovadas para ativação: ${idsParaAtivar.length}/${questoes.length}`)
console.log(`Retidas (inativas): ${idsRetidos.length}`)
if (idsRetidos.length && !force) {
  console.log(`  (${idsComAviso.size - [...idsComAviso].filter((id) => idsComErro.has(id)).length} retidas só por aviso -- rode de novo com --force se quiser aceitar mesmo assim)`)
}

if (idsParaAtivar.length === 0) {
  console.log("\nNenhuma questão aprovada. Nada foi alterado no banco.")
  process.exit(0)
}

if (dryRun) {
  console.log(`\n[--dry-run] Nada foi alterado no banco. ${idsParaAtivar.length} seriam ativadas.`)
  process.exit(0)
}

const { error: updateError } = await supabase.from("questoes").update({ ativo: true }).in("id", idsParaAtivar)
if (updateError) {
  console.error("Erro ao ativar:", updateError)
  process.exit(1)
}
console.log(`\n${idsParaAtivar.length} questão(ões) ativada(s) com sucesso.`)
