import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"

const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true }).eq("materia", "defesa")
const data = []
for (let from = 0; from < count; from += 1000) {
  const { data: page, error } = await supabase.from("questoes").select("id,opcoes,opcoes_comentario,indice_correta").eq("materia", "defesa").range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  data.push(...page)
}
console.log("Total:", data.length)

// agrupa por nº de alternativas; dentro de cada grupo, round-robin decide a
// NOVA posição da resposta correta (0,1,2,...,n-1,0,1,...), embaralhando o
// resto das opções aleatoriamente. Preserva o pareamento opcoes<->comentario.
function shuffleArray(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
let seed = 42
function rng() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

const grupos = {}
for (const q of data) {
  const n = q.opcoes.length
  ;(grupos[n] ??= []).push(q)
}

const updates = []
for (const [n, qs] of Object.entries(grupos)) {
  const nOpts = Number(n)
  let roundRobin = 0
  for (const q of shuffleArray(qs, rng)) {
    const novaPosCorreta = roundRobin % nOpts
    roundRobin++
    const pares = q.opcoes.map((o, i) => ({ opcao: o, comentario: q.opcoes_comentario[i], correta: i === q.indice_correta }))
    const correta = pares.find(p => p.correta)
    const outras = shuffleArray(pares.filter(p => !p.correta), rng)
    const novaOrdem = []
    let oi = 0
    for (let pos = 0; pos < nOpts; pos++) {
      if (pos === novaPosCorreta) novaOrdem.push(correta)
      else novaOrdem.push(outras[oi++])
    }
    updates.push({
      id: q.id,
      opcoes: novaOrdem.map(p => p.opcao),
      opcoes_comentario: novaOrdem.map(p => p.comentario),
      indice_correta: novaPosCorreta,
    })
  }
}

const letras = {}
for (const u of updates) {
  const l = "ABCDEFGH"[u.indice_correta] ?? "?"
  letras[l] = (letras[l] || 0) + 1
}
console.log("Nova distribuição de letra:")
for (const [l, c] of Object.entries(letras).sort()) console.log(`${l}: ${c} (${(100*c/updates.length).toFixed(1)}%)`)

writeFileSync(`${SCRATCH}/defesa_reshuffle_plan.json`, JSON.stringify(updates, null, 0))
console.log("\nPlano salvo. Aplicando updates...")

let ok = 0, err = 0
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes, opcoes_comentario: u.opcoes_comentario, indice_correta: u.indice_correta }).eq("id", u.id)
  if (error) { console.error("ERRO", u.id, error); err++; continue }
  ok++
}
console.log(`\nAplicado: ${ok} OK, ${err} erros`)
