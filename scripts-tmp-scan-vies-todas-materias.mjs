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

let all = []
{
  const pageSize = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from("questoes")
      .select("id,materia,opcoes,indice_correta")
      .eq("ativo", true)
      .range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}

const porMateria = {}
for (const q of all) {
  if (!q.opcoes || q.opcoes.length < 2 || q.indice_correta == null) continue
  const m = q.materia || "(sem materia)"
  porMateria[m] = porMateria[m] || { total: 0, maisLongaEstrita: 0, maisLongaEmpate: 0, somaRazao: 0, nOpcoes: q.opcoes.length }
  const g = porMateria[m]
  const correta = q.opcoes[q.indice_correta]
  const outras = q.opcoes.filter((_, i) => i !== q.indice_correta)
  const lenCorreta = correta.length
  const maxOutras = Math.max(...outras.map((o) => o.length))
  const avgOutras = outras.reduce((s, o) => s + o.length, 0) / outras.length
  g.total++
  if (lenCorreta > maxOutras) g.maisLongaEstrita++
  if (lenCorreta >= maxOutras) g.maisLongaEmpate++
  g.somaRazao += lenCorreta / (avgOutras || 1)
}

const linhas = Object.entries(porMateria).map(([materia, g]) => {
  const esperado = 100 / g.nOpcoes
  return {
    materia,
    total: g.total,
    pctEstrita: (100 * g.maisLongaEstrita / g.total),
    pctEmpate: (100 * g.maisLongaEmpate / g.total),
    razaoMedia: g.somaRazao / g.total,
    esperadoPorAcaso: esperado,
  }
})

linhas.sort((a, b) => b.pctEstrita - a.pctEstrita)
console.log("materia".padEnd(35), "total".padStart(6), "estrita%".padStart(9), "empate%".padStart(9), "razão".padStart(7), "esperado%".padStart(10))
for (const l of linhas) {
  const flag = l.pctEstrita > l.esperadoPorAcaso * 1.5 ? "  <== VERIFICAR" : ""
  console.log(
    l.materia.padEnd(35),
    String(l.total).padStart(6),
    l.pctEstrita.toFixed(1).padStart(9),
    l.pctEmpate.toFixed(1).padStart(9),
    l.razaoMedia.toFixed(2).padStart(7),
    l.esperadoPorAcaso.toFixed(1).padStart(10),
    flag
  )
}
