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

const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true }).eq("materia", "clinica_medica_5").eq("ativo", true)
const data = []
for (let from = 0; from < count; from += 1000) {
  const { data: page } = await supabase.from("questoes").select("id,opcoes,indice_correta").eq("materia", "clinica_medica_5").eq("ativo", true).range(from, from + 999)
  data.push(...page)
}
console.log("Total:", data.length)

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

const updates = []
for (const q of data) {
  const correta = q.opcoes[q.indice_correta].length
  const alvoMax = Math.round(correta * 1.2)
  const novasOpcoes = q.opcoes.map((o, i) => i === q.indice_correta ? o : podar(o, alvoMax))
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates.push({ id: q.id, opcoes: novasOpcoes })
}
console.log("Poda: questões a editar =", updates.length)

let ok = 0
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) { console.error("ERRO", u.id, error) } else ok++
}
console.log("Aplicado:", ok, "/", updates.length)
