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

// equivalente a scripts-tmp-scan-vies-todas-materias.mjs, mas para
// desafios_clinicos_perguntas, que usa "alternativas" (array de objetos
// {id,texto,correta,feedback}) em vez de opcoes[]/indice_correta.
let all = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("desafios_clinicos_perguntas").select("id,alternativas").range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}

let total = 0, estrita = 0, empate = 0, somaRazao = 0
for (const q of all) {
  const alts = q.alternativas
  if (!Array.isArray(alts) || alts.length < 2) continue
  const idxCorreta = alts.findIndex((a) => a.correta === true)
  if (idxCorreta === -1) continue
  total++
  const lens = alts.map((a) => (a.texto || "").length)
  const lenCorreta = lens[idxCorreta]
  const outras = lens.filter((_, i) => i !== idxCorreta)
  const maxOutras = Math.max(...outras)
  if (lenCorreta > maxOutras) estrita++
  if (lenCorreta >= maxOutras) empate++
  somaRazao += lenCorreta / (outras.reduce((a, b) => a + b, 0) / outras.length)
}

const esperado = 100 / (all[0]?.alternativas?.length || 4)
console.log(`Total: ${total}`)
console.log(`Correta é a mais longa (empate incl.): ${empate} = ${(100 * empate / total).toFixed(1)}%`)
console.log(`Correta é ESTRITAMENTE a mais longa: ${estrita} = ${(100 * estrita / total).toFixed(1)}%`)
console.log(`Razão média: ${(somaRazao / total).toFixed(2)}`)
console.log(`Esperado por acaso (~4 alternativas): ${esperado.toFixed(1)}%`)
