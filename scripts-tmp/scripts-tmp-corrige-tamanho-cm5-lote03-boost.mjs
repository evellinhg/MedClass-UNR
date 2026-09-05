import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
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
const ids = lote.map(q => q.id)
const { data } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
const byIdCur = Object.fromEntries(data.map(q => [q.id, q]))

// remove prefixo "Incorrecto." e qualquer menção direta a "la opción/respuesta
// correcta es" (proteção contra vazamento) antes de anexar como reforço
function limpar(comentario) {
  let t = comentario.replace(/^Incorrecto\.?\s*/i, "").trim()
  if (/opci[oó]n correcta|respuesta correcta|es correcta\b/i.test(t)) return null
  return t
}

const updates = []
for (const q of data) {
  const original = byId[q.id]
  const lens = q.opcoes.map(o => o.length)
  const correta = lens[q.indice_correta]
  const alvoMin = Math.round(correta * 0.85)
  const novasOpcoes = [...q.opcoes]
  let mudou = false
  for (let i = 0; i < q.opcoes.length; i++) {
    if (i === q.indice_correta) continue
    if (novasOpcoes[i].length >= alvoMin) continue
    const comentario = original.opcoes_comentario[i]
    const extra = limpar(comentario)
    if (!extra) continue
    // evita duplicar conteúdo se já foi parcialmente incorporado
    const jaTemInicio = novasOpcoes[i].toLowerCase().includes(extra.slice(0, 30).toLowerCase())
    if (jaTemInicio) continue
    const separador = novasOpcoes[i].trim().endsWith(".") ? " " : ". "
    novasOpcoes[i] = novasOpcoes[i].trim() + separador + extra
    mudou = true
  }
  if (mudou) updates.push({ id: q.id, opcoes: novasOpcoes })
}
console.log("Questões a reforçar:", updates.length)

let ok = 0
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) { console.error("ERRO", u.id, error); continue }
  ok++
}
console.log("Aplicado:", ok)

const { data: pos } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
let aindaLonga=0, aindaCurta=0, ok2=0
const ratios=[]
for (const q of pos) {
  const lens = q.opcoes.map(o=>o.length)
  const maxLen=Math.max(...lens), minLen=Math.min(...lens)
  const correta=lens[q.indice_correta]
  if (correta===maxLen && lens.filter(l=>l===maxLen).length===1) aindaLonga++
  else if (correta===minLen && lens.filter(l=>l===minLen).length===1) aindaCurta++
  else ok2++
  const outras = lens.filter((_,i)=>i!==q.indice_correta)
  ratios.push(correta/(outras.reduce((a,b)=>a+b,0)/outras.length))
}
console.log(`\nCorreta ainda é a mais longa: ${aindaLonga}/${pos.length} (${(100*aindaLonga/pos.length).toFixed(1)}%)`)
console.log(`Correta é a mais curta: ${aindaCurta}/${pos.length} (${(100*aindaCurta/pos.length).toFixed(1)}%)`)
console.log(`Razão média: ${(ratios.reduce((a,b)=>a+b,0)/ratios.length).toFixed(2)}`)
