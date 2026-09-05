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

const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true }).eq("materia", "clinica_medica_5").eq("ativo", true)
const data = []
for (let from = 0; from < count; from += 1000) {
  const { data: page } = await supabase.from("questoes").select("*").eq("materia", "clinica_medica_5").eq("ativo", true).range(from, from + 999)
  data.push(...page)
}
console.log("Total:", data.length)

function limpar(comentario) {
  let t = (comentario || "").replace(/^Incorrecto\.?\s*/i, "").trim()
  if (/opci[oó]n correcta|respuesta correcta|es correcta\b/i.test(t)) return null
  return t
}

const updates1 = []
for (const q of data) {
  const lens = q.opcoes.map(o => o.length)
  const correta = lens[q.indice_correta]
  const alvoMin = Math.round(correta * 0.85)
  const novasOpcoes = [...q.opcoes]
  let mudou = false
  for (let i = 0; i < q.opcoes.length; i++) {
    if (i === q.indice_correta) continue
    if (novasOpcoes[i].length >= alvoMin) continue
    const extra = limpar(q.opcoes_comentario?.[i])
    if (!extra) continue
    const separador = novasOpcoes[i].trim().endsWith(".") ? " " : ". "
    novasOpcoes[i] = novasOpcoes[i].trim() + separador + extra
    mudou = true
  }
  if (mudou) updates1.push({ id: q.id, opcoes: novasOpcoes })
}
console.log("Reforço (limpeza final): questões editadas =", updates1.length)
for (const u of updates1) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO reforço", u.id, error)
}

function podar(texto, alvoMax) {
  if (texto.length <= alvoMax) return texto
  const frases = texto.match(/[^.]+\.(?:\s|$)/g) || [texto]
  let acumulado = ""
  for (const f of frases) {
    if (acumulado.length > 0 && (acumulado.length + f.length) > alvoMax) break
    acumulado += f
  }
  acumulado = acumulado.trim()
  if (acumulado.length >= alvoMax * 0.6) return acumulado
  let corte = texto.slice(0, alvoMax)
  const ultimoEspaco = corte.lastIndexOf(" ")
  corte = corte.slice(0, ultimoEspaco > alvoMax * 0.7 ? ultimoEspaco : corte.length)
  corte = corte.replace(/[,;:]$/, "").trim()
  if (!/[.!?]$/.test(corte)) corte += "."
  return corte
}

const ids = data.map(q => q.id)
const { data: pos1 } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
const updates2 = []
for (const q of pos1) {
  const correta = q.opcoes[q.indice_correta].length
  const alvoMax = Math.round(correta * 1.2)
  const novasOpcoes = q.opcoes.map((o, i) => i === q.indice_correta ? o : podar(o, alvoMax))
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates2.push({ id: q.id, opcoes: novasOpcoes })
}
console.log("Poda (limpeza final): questões editadas =", updates2.length)
for (const u of updates2) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO poda", u.id, error)
}

const { data: pos2 } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", ids)
let aindaLonga=0, aindaCurta=0
const ratios=[]
for (const q of pos2) {
  const lens = q.opcoes.map(o=>o.length)
  const maxLen=Math.max(...lens), minLen=Math.min(...lens)
  const correta=lens[q.indice_correta]
  if (correta===maxLen && lens.filter(l=>l===maxLen).length===1) aindaLonga++
  else if (correta===minLen && lens.filter(l=>l===minLen).length===1) aindaCurta++
  const outras = lens.filter((_,i)=>i!==q.indice_correta)
  ratios.push(correta/(outras.reduce((a,b)=>a+b,0)/outras.length))
}
console.log(`\nFINAL clinica_medica_5 (${pos2.length} questões): mais_longa=${aindaLonga} (${(100*aindaLonga/pos2.length).toFixed(1)}%), mais_curta=${aindaCurta} (${(100*aindaCurta/pos2.length).toFixed(1)}%)`)
console.log(`Razão média: ${(ratios.reduce((a,b)=>a+b,0)/ratios.length).toFixed(2)}`)

let integroOk = true
const byId = Object.fromEntries(data.map(q => [q.id, q]))
for (const q of pos2) {
  if (q.opcoes[q.indice_correta] !== byId[q.id].opcoes[byId[q.id].indice_correta]) { console.error("ALTERAÇÃO INDEVIDA:", q.id); integroOk = false }
}
console.log("Integridade da correta:", integroOk ? "OK" : "FALHOU")
