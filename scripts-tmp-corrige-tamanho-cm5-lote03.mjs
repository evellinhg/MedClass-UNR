import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
import { PATCHES } from "./scripts-tmp-cm5-lote03-patches-data.mjs"
const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"
const lote = JSON.parse(readFileSync(`${SCRATCH}/cm5_lote_03.json`, "utf-8"))
const byId = Object.fromEntries(lote.map(q => [q.id, q]))

console.log("Questões no lote:", lote.length, "| Patches definidos:", Object.keys(PATCHES).length)

const results = []
for (const q of lote) {
  const edits = PATCHES[q.id]
  if (!edits) { console.log("SEM PATCH:", q.id); continue }
  const opcoes = [...q.opcoes]
  const correctaAntes = opcoes[q.indice_correta]
  for (const [idx, texto] of Object.entries(edits)) {
    if (Number(idx) === q.indice_correta) throw new Error(`Patch tentaria alterar a alternativa CORRETA em ${q.id}`)
    opcoes[idx] = texto
  }
  const { data, error } = await supabase.from("questoes").update({ opcoes }).eq("id", q.id).select("id,opcoes,indice_correta")
  if (error) { console.error("ERRO", q.id, error); results.push({ id: q.id, error: error.message }); continue }
  if (data[0].opcoes[data[0].indice_correta] !== correctaAntes) throw new Error(`Correta mudou em ${q.id}!`)
  results.push({ id: q.id, ok: true })
}
console.log(`\nTotal: ${results.length}, OK: ${results.filter(r=>r.ok).length}, Erros: ${results.filter(r=>r.error).length}`)

const ids = lote.map(q => q.id)
const { data: pos } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
let aindaLonga = 0, aindaCurta = 0, ok2 = 0
const ratios = []
for (const q of pos) {
  const lens = q.opcoes.map(o => o.length)
  const maxLen = Math.max(...lens), minLen = Math.min(...lens)
  const correta = lens[q.indice_correta]
  if (correta === maxLen && lens.filter(l=>l===maxLen).length === 1) aindaLonga++
  else if (correta === minLen && lens.filter(l=>l===minLen).length === 1) aindaCurta++
  else ok2++
  const outras = lens.filter((_,i)=>i!==q.indice_correta)
  ratios.push(correta / (outras.reduce((a,b)=>a+b,0)/outras.length))
}
const avgRatio = ratios.reduce((a,b)=>a+b,0)/ratios.length
console.log(`\nCorreta ainda é a mais longa: ${aindaLonga}/${pos.length} (${(100*aindaLonga/pos.length).toFixed(1)}%)`)
console.log(`Correta é a mais curta: ${aindaCurta}/${pos.length} (${(100*aindaCurta/pos.length).toFixed(1)}%)`)
console.log(`Razão média correta/outras: ${avgRatio.toFixed(2)}`)
