// Aplica os distratores expandidos (corrigindo o viés de tamanho: alternativa
// correta sistematicamente mais longa que os distratores) de volta na tabela
// desafios_clinicos_perguntas. Mesmo processo já feito em "questoes" para
// Cirurgia do 5º ano (scripts-tmp-inserir-cirurgia5-final.mjs), mas aqui é
// UPDATE de linhas existentes, não insert.
//
// Fonte: 497 perguntas flagueadas em desafios_flagged.json (distrator com
// <70% do tamanho da alternativa correta e diferença >30 chars), reescritas
// em 10 chunks por agentes sequenciais -> desafios_chunk_NN_fixed.json.
//
// Distribuição da letra correta já está balanceada no banco (A:201 B:219
// C:216 D:189 de 825) -- diferente do caso de Cirurgia 5, não é necessário
// reembaralhar a ordem das alternativas, só substituir o texto dos
// distratores marcados.
//
// Uso: node scripts-tmp-atualizar-distratores-desafios.mjs --dry-run
//      node scripts-tmp-atualizar-distratores-desafios.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const DRY_RUN = process.argv.includes("--dry-run")
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/46eaa718-f387-470f-972a-3cb953d5cb2e/scratchpad"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

function normId(id) {
  return (id || "").toUpperCase()
}

// -- carrega e mescla os 10 chunks corrigidos ------------------------------
const flagged = JSON.parse(readFileSync(`${SCRATCH}/desafios_flagged.json`, "utf-8"))
const fixedById = new Map()
for (let i = 0; i < 10; i++) {
  const chunk = JSON.parse(readFileSync(`${SCRATCH}/desafios_chunk_${String(i).padStart(2, "0")}_fixed.json`, "utf-8"))
  for (const q of chunk) {
    if (fixedById.has(q.id)) throw new Error(`id duplicado entre chunks: ${q.id}`)
    fixedById.set(q.id, q.fixed)
  }
}
console.log(`Flagged: ${flagged.length} perguntas. Fixed carregados: ${fixedById.size} perguntas.`)

// -- valida cobertura e consistência de letras -----------------------------
const problemas = []
for (const q of flagged) {
  const fixed = fixedById.get(q.id)
  if (!fixed) { problemas.push(`sem fixed: ${q.id}`); continue }
  const esperadas = Object.keys(q.distractors_to_expand).map(normId).sort()
  const recebidas = Object.keys(fixed).map(normId).sort()
  if (esperadas.join(",") !== recebidas.join(",")) {
    problemas.push(`letras diferentes em ${q.id}: esperado [${esperadas}] recebido [${recebidas}]`)
  }
}
if (problemas.length > 0) {
  console.error(`${problemas.length} problema(s) de cobertura, abortando:`)
  for (const p of problemas.slice(0, 20)) console.error(" ", p)
  process.exit(1)
}
console.log("Cobertura e letras OK: todos os 497 flagged têm fixed correspondente com as mesmas letras.")

// -- busca as linhas atuais no banco ----------------------------------------
const ids = flagged.map((q) => q.id)
const rows = []
const PAGE = 200
for (let i = 0; i < ids.length; i += PAGE) {
  const lote = ids.slice(i, i + PAGE)
  const { data, error } = await supabase.from("desafios_clinicos_perguntas").select("id,alternativas").in("id", lote)
  if (error) { console.error("Erro ao buscar linhas:", error.message); process.exit(1) }
  rows.push(...data)
}
console.log(`Linhas encontradas no banco: ${rows.length} (esperado ${ids.length})`)
if (rows.length !== ids.length) {
  const encontrados = new Set(rows.map((r) => r.id))
  const faltando = ids.filter((id) => !encontrados.has(id))
  console.error(`Faltando ${faltando.length} linha(s):`, faltando.slice(0, 10))
  process.exit(1)
}

// -- monta as alternativas atualizadas ---------------------------------------
let totalDistratoresAplicados = 0
let somaDeltaLen = 0
const amostras = []
const atualizacoes = []
for (const row of rows) {
  const fixed = fixedById.get(row.id)
  const alts = row.alternativas
  let mudou = false
  const novasAlts = alts.map((a) => {
    const letra = normId(a.id)
    if (fixed[letra] === undefined) return a
    mudou = true
    totalDistratoresAplicados++
    somaDeltaLen += fixed[letra].length - a.texto.length
    return { ...a, texto: fixed[letra] }
  })
  if (!mudou) { console.error(`ALERTA: nenhuma alternativa mudou para ${row.id}`); process.exit(1) }
  // validação estrutural: mesma quantidade de alternativas, exatamente uma correta
  if (novasAlts.length !== alts.length) { console.error(`tamanho de alternativas mudou em ${row.id}`); process.exit(1) }
  if (novasAlts.filter((a) => a.correta).length !== 1) { console.error(`correta != 1 em ${row.id}`); process.exit(1) }
  atualizacoes.push({ id: row.id, alternativas: novasAlts })
  if (amostras.length < 3) amostras.push({ id: row.id, antes: alts, depois: novasAlts })
}

console.log(`\nDistratores aplicados: ${totalDistratoresAplicados}`)
console.log(`Aumento médio de tamanho por distrator: ${(somaDeltaLen / totalDistratoresAplicados).toFixed(1)} chars`)
console.log(`\n--- Amostra (3 perguntas) ---`)
for (const a of amostras) {
  console.log(`\nid=${a.id}`)
  for (let i = 0; i < a.antes.length; i++) {
    const mudou = a.antes[i].texto !== a.depois[i].texto
    console.log(`  [${normId(a.antes[i].id)}]${a.antes[i].correta ? " (correta)" : ""}${mudou ? " *** ALTERADA ***" : ""}`)
    if (mudou) {
      console.log(`    antes  (${a.antes[i].texto.length}): ${a.antes[i].texto}`)
      console.log(`    depois (${a.depois[i].texto.length}): ${a.depois[i].texto}`)
    }
  }
}

if (DRY_RUN) {
  console.log(`\n--dry-run: nada foi atualizado no banco. ${atualizacoes.length} linhas seriam atualizadas.`)
  process.exit(0)
}

let feitos = 0
for (const upd of atualizacoes) {
  const { error } = await supabase.from("desafios_clinicos_perguntas").update({ alternativas: upd.alternativas }).eq("id", upd.id)
  if (error) { console.error(`Erro ao atualizar ${upd.id}:`, error.message); process.exit(1) }
  feitos++
  if (feitos % 50 === 0) console.log(`  ${feitos}/${atualizacoes.length} atualizadas`)
}
console.log(`\nConcluído: ${feitos} perguntas de desafios_clinicos_perguntas atualizadas.`)
