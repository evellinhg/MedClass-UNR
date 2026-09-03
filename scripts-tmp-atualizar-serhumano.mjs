// Aplica os distratores expandidos (viés de tamanho) e reembaralha a ordem
// das alternativas (viés de letra, forte em direção a "A": 31,8%) nas 733
// questões de materia "ser_humano_meio" (tabela questoes).
//
// Fonte:
// - 111 perguntas flagueadas por tamanho em serhumano_flagged.json,
//   distratores reescritos em 3 chunks -> serhumano_chunk_NN_fixed.json.
// - Busca TODAS as linhas com paginação (PAGE=1000) mesmo a matéria tendo
//   menos de 1000 linhas -- lição aprendida em trabalho_tempo_livre, onde
//   um select("*") sem paginação truncou silenciosamente em 1000 de 1286.
// - Reembaralhamento por round-robin de letra alvo, agrupado por nº de
//   opções (2 a 8), pra balancear a letra correta dentro de cada grupo.
//
// Uso: node scripts-tmp-atualizar-serhumano.mjs --dry-run
//      node scripts-tmp-atualizar-serhumano.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const DRY_RUN = process.argv.includes("--dry-run")
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/73e6c3a9-25d3-4e28-969b-da3fc967d2a6/scratchpad"
const LETRAS = "ABCDEFGH"
const MATERIA = "ser_humano_meio"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260903)
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// -- carrega e mescla os 3 chunks corrigidos ---------------------------------
const flaggedR2 = JSON.parse(readFileSync(`${SCRATCH}/serhumano_flagged.json`, "utf-8"))
const fixedById = new Map()
for (let i = 0; i < 3; i++) {
  const chunk = JSON.parse(readFileSync(`${SCRATCH}/serhumano_chunk_${String(i).padStart(2, "0")}_fixed.json`, "utf-8"))
  for (const q of chunk) {
    if (fixedById.has(q.id)) throw new Error(`id duplicado entre chunks: ${q.id}`)
    fixedById.set(q.id, q.fixed)
  }
}
console.log(`Flagged round2: ${flaggedR2.length} perguntas. Fixed carregados: ${fixedById.size} perguntas.`)

const problemas = []
for (const q of flaggedR2) {
  const fixed = fixedById.get(q.id)
  if (!fixed) { problemas.push(`sem fixed: ${q.id}`); continue }
  const esperadas = Object.keys(q.distractors_to_expand).sort()
  const recebidas = Object.keys(fixed).sort()
  if (esperadas.join(",") !== recebidas.join(",")) problemas.push(`letras diferentes em ${q.id}: esperado [${esperadas}] recebido [${recebidas}]`)
}
if (problemas.length > 0) {
  console.error(`${problemas.length} problema(s) de cobertura, abortando:`)
  for (const p of problemas.slice(0, 20)) console.error(" ", p)
  process.exit(1)
}
console.log("Cobertura e letras OK.")

// -- busca TODAS as linhas com paginação -------------------------------------
const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true }).eq("materia", MATERIA)
const PAGE = 1000
const rows = []
for (let from = 0; from < count; from += PAGE) {
  const { data: page, error } = await supabase.from("questoes").select("*").eq("materia", MATERIA).range(from, from + PAGE - 1)
  if (error) { console.error(error.message); process.exit(1) }
  rows.push(...page)
}
console.log(`Linhas no banco: ${rows.length} (esperado ${count})`)

// -- aplica textos expandidos da 2ª rodada -------------------------------------
let totalDistratoresAplicados = 0
for (const row of rows) {
  const fixed = fixedById.get(row.id)
  if (!fixed) continue
  row.opcoes = row.opcoes.map((texto, i) => {
    const letra = LETRAS[i]
    if (fixed[letra] === undefined) return texto
    totalDistratoresAplicados++
    return fixed[letra]
  })
}
console.log(`Distratores da 2ª rodada aplicados: ${totalDistratoresAplicados} (esperado 206)`)

// -- reembaralha ordem das alternativas de TODAS as 1286, balanceando por grupo de nº de opções --
const porGrupo = new Map()
for (const row of rows) {
  const n = row.opcoes.length
  if (!porGrupo.has(n)) porGrupo.set(n, [])
  porGrupo.get(n).push(row)
}

const atualizacoes = []
for (const [n, grupo] of porGrupo) {
  const ordemEmbaralhada = shuffle(grupo)
  ordemEmbaralhada.forEach((row, idx) => {
    const targetIdx = idx % n
    const opcoesOrig = row.opcoes
    const comentariosOrig = row.opcoes_comentario ?? []
    const idxCorretaOrig = row.indice_correta

    const outrosIdx = shuffle(opcoesOrig.map((_, i) => i).filter((i) => i !== idxCorretaOrig))
    const novaOrdem = new Array(n)
    novaOrdem[targetIdx] = idxCorretaOrig
    let cursor = 0
    for (let i = 0; i < n; i++) {
      if (i === targetIdx) continue
      novaOrdem[i] = outrosIdx[cursor++]
    }
    const novasOpcoes = novaOrdem.map((origIdx) => opcoesOrig[origIdx])
    const novosComentarios = novaOrdem.map((origIdx) => comentariosOrig[origIdx] ?? null)

    atualizacoes.push({ id: row.id, opcoes: novasOpcoes, opcoes_comentario: novosComentarios, indice_correta: targetIdx, _antes: { opcoes: opcoesOrig, indice_correta: idxCorretaOrig } })
  })
}

console.log(`\nTotal de atualizações preparadas: ${atualizacoes.length} (esperado ${rows.length})`)

const novaDistribuicao = {}
for (const u of atualizacoes) {
  const letra = LETRAS[u.indice_correta]
  novaDistribuicao[letra] = (novaDistribuicao[letra] ?? 0) + 1
}
console.log(`\nNova distribuição da letra correta (sobre as ${atualizacoes.length} questões):`)
for (const l of Object.keys(novaDistribuicao).sort()) {
  const pct = ((novaDistribuicao[l] / atualizacoes.length) * 100).toFixed(1)
  console.log(`  ${l}: ${novaDistribuicao[l]} (${pct}%)`)
}

const errosValidacao = []
for (const u of atualizacoes) {
  if (u.opcoes.length !== u._antes.opcoes.length) errosValidacao.push(`tamanho mudou em ${u.id}`)
  if (u.opcoes[u.indice_correta] !== u._antes.opcoes[u._antes.indice_correta]) errosValidacao.push(`correta não corresponde em ${u.id}`)
  const setAntes = [...u._antes.opcoes].sort().join("|")
  const setDepois = [...u.opcoes].sort().join("|")
  if (setAntes !== setDepois) errosValidacao.push(`conjunto de opções mudou em ${u.id}`)
}
if (errosValidacao.length > 0) {
  console.error(`\n${errosValidacao.length} erro(s) de validação, abortando:`)
  for (const e of errosValidacao.slice(0, 20)) console.error(" ", e)
  process.exit(1)
}
console.log(`\nValidação estrutural OK: mesmo conjunto de opções, correta preservada, em todas as ${atualizacoes.length} questões.`)

console.log(`\n--- Amostra (3 questões que tiveram distrator expandido nesta 2ª rodada) ---`)
const comExpansao = atualizacoes.filter((u) => fixedById.has(u.id)).slice(0, 3)
for (const u of comExpansao) {
  console.log(`\nid=${u.id}`)
  console.log(`  antes:  correta=${LETRAS[u._antes.indice_correta]} | ${u._antes.opcoes.map((o, i) => `${LETRAS[i]}:"${o}"`).join(" | ")}`)
  console.log(`  depois: correta=${LETRAS[u.indice_correta]} | ${u.opcoes.map((o, i) => `${LETRAS[i]}:"${o}"`).join(" | ")}`)
}

if (DRY_RUN) {
  console.log(`\n--dry-run: nada foi atualizado no banco. ${atualizacoes.length} linhas seriam atualizadas.`)
  process.exit(0)
}

let feitos = 0
for (const u of atualizacoes) {
  const { error: errUpd } = await supabase
    .from("questoes")
    .update({ opcoes: u.opcoes, opcoes_comentario: u.opcoes_comentario, indice_correta: u.indice_correta })
    .eq("id", u.id)
  if (errUpd) { console.error(`Erro ao atualizar ${u.id}:`, errUpd.message); process.exit(1) }
  feitos++
  if (feitos % 100 === 0) console.log(`  ${feitos}/${atualizacoes.length} atualizadas`)
}
console.log(`\nConcluído: ${feitos} questões de ser_humano_meio atualizadas (2ª rodada, cobertura completa).`)
