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

function corrigirParenteseAberto(texto) {
  const abre = (texto.match(/\(/g) || []).length
  const fecha = (texto.match(/\)/g) || []).length
  if (abre === fecha) return texto
  if (abre === fecha + 1) {
    // remove o "(" pendente e tudo que vem depois dele (fragmento incompleto)
    const idx = texto.lastIndexOf("(")
    let corte = texto.slice(0, idx).trim()
    corte = corte.replace(/[,;:]$/, "").trim()
    if (!/[.!?]$/.test(corte)) corte += "."
    return corte
  }
  return texto // caso raro/diferente, não mexe
}

const updates = []
for (const q of data) {
  const novasOpcoes = q.opcoes.map((o, i) => {
    if (i === q.indice_correta) return o
    return corrigirParenteseAberto(o)
  })
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates.push({ id: q.id, opcoes: novasOpcoes, antes: q.opcoes, indice_correta: q.indice_correta })
}
console.log("Questões com parênteses quebrados a corrigir:", updates.length)
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO", u.id, error)
}
console.log("Aplicado.")

// mostra alguns exemplos do antes/depois pra conferência
for (const u of updates.slice(0, 5)) {
  console.log("\nID:", u.id)
  for (let i = 0; i < u.antes.length; i++) {
    if (u.antes[i] !== u.opcoes[i]) {
      console.log("  ANTES:", u.antes[i])
      console.log("  DEPOIS:", u.opcoes[i])
    }
  }
}
