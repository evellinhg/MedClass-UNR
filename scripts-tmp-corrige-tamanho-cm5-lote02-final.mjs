import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"
const lote = JSON.parse(readFileSync(`${SCRATCH}/cm5_lote_02.json`, "utf-8"))
const ids = lote.map(q => q.id)
const { data } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)

function podar(texto, alvoMax) {
  if (texto.length <= alvoMax) return texto
  const frases = texto.match(/[^.]+\.(?:\s|$)/g) || [texto]
  let acumulado = ""
  for (const f of frases) {
    if (acumulado.length > 0 && (acumulado.length + f.length) > alvoMax) break
    acumulado += f
  }
  acumulado = acumulado.trim()
  if (acumulado.length >= alvoMax * 0.55) return acumulado
  let corte = texto.slice(0, alvoMax)
  const ultimoEspaco = corte.lastIndexOf(" ")
  corte = corte.slice(0, ultimoEspaco > alvoMax * 0.7 ? ultimoEspaco : corte.length)
  corte = corte.replace(/[,;:]$/, "").trim()
  if (!/[.!?]$/.test(corte)) corte += "."
  return corte
}

const updates = []
for (const q of data) {
  const correta = q.opcoes[q.indice_correta].length
  const alvoMax = Math.round(correta * 1.15)
  const novasOpcoes = q.opcoes.map((o, i) => i === q.indice_correta ? o : podar(o, alvoMax))
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates.push({ id: q.id, opcoes: novasOpcoes })
}
console.log("Ajustando:", updates.length)
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO", u.id, error)
}

const { data: pos } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
let maisLonga=0, maisCurta=0, ok2=0
const ratios=[]
for (const q of pos) {
  const lens = q.opcoes.map(o=>o.length)
  const maxLen=Math.max(...lens), minLen=Math.min(...lens)
  const correta=lens[q.indice_correta]
  if (correta===maxLen && lens.filter(l=>l===maxLen).length===1) maisLonga++
  else if (correta===minLen && lens.filter(l=>l===minLen).length===1) maisCurta++
  else ok2++
  const outras = lens.filter((_,i)=>i!==q.indice_correta)
  const avgOutras = outras.reduce((a,b)=>a+b,0)/outras.length
  ratios.push(correta/avgOutras)
}
const avgRatio = ratios.reduce((a,b)=>a+b,0)/ratios.length
console.log(`\nFinal: mais_longa=${maisLonga}, mais_curta=${maisCurta}, equilibrada=${ok2}, total=${pos.length}`)
console.log(`Razão média correta/outras: ${avgRatio.toFixed(2)} (1.0 = perfeitamente equilibrado)`)
