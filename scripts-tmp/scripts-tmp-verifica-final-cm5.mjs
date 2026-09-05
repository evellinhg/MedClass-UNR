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
  const { data: page } = await supabase.from("questoes").select("id,opcoes,indice_correta").eq("materia", "clinica_medica_5").eq("ativo", true).range(from, from + 999)
  data.push(...page)
}
console.log("Total:", data.length)

let correctIsLongest = 0, correctIsLongestStrict = 0
const ratios = []
for (const q of data) {
  const lens = q.opcoes.map(o => o.length)
  const maxLen = Math.max(...lens)
  const correta = lens[q.indice_correta]
  if (correta === maxLen) {
    correctIsLongest++
    if (lens.filter(l => l === maxLen).length === 1) correctIsLongestStrict++
  }
  const outras = lens.filter((_,i)=>i!==q.indice_correta)
  ratios.push(correta/(outras.reduce((a,b)=>a+b,0)/outras.length))
}
console.log(`Correta é a mais longa (empate incl.): ${correctIsLongest}/${data.length} = ${(100*correctIsLongest/data.length).toFixed(1)}%`)
console.log(`Correta é ESTRITAMENTE a mais longa: ${correctIsLongestStrict}/${data.length} = ${(100*correctIsLongestStrict/data.length).toFixed(1)}%`)
console.log(`Razão média geral: ${(ratios.reduce((a,b)=>a+b,0)/ratios.length).toFixed(2)}`)
console.log(`(Antes da correção: 87.3% / 86.3% / esperado por acaso ~25%)`)
