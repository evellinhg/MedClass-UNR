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

// achado na investigação das 35 questões com respostas do tipo "A y B son
// correctas": 19 delas têm a alternativa se autorreferenciando de forma sem
// sentido (ex: a opção B afirma "B y C son correctas", dita pela própria
// opção B). Sem o conteúdo original, não dá pra saber com confiança qual
// era a combinação pretendida -- desativadas em vez de corrigidas.
let all = []
{
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("questoes").select("id,materia,opcoes,indice_correta").eq("ativo", true).range(from, from + 999)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
}

const idsParaDesativar = new Set()
for (const q of all) {
  q.opcoes.forEach((o, idx) => {
    const m = o.match(/\b([A-D])\s+y\s+([A-D])\s+son\s+correctas/i)
    if (!m) return
    const letraOpcao = String.fromCharCode(65 + idx)
    if ([m[1].toUpperCase(), m[2].toUpperCase()].includes(letraOpcao)) {
      idsParaDesativar.add(q.id)
    }
  })
}

console.log(`Questões a desativar: ${idsParaDesativar.size}`)
for (const id of idsParaDesativar) {
  const { error } = await supabase.from("questoes").update({ ativo: false }).eq("id", id)
  if (error) console.error("erro", id, error)
}
console.log("Concluído.")
