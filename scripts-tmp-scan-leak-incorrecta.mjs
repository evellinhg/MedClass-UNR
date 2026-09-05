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
    const { data, error } = await supabase.from("questoes").select("id,materia,opcoes,indice_correta").eq("ativo", true).range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}
const achados = []
for (const q of all) {
  q.opcoes.forEach((op, idx) => {
    if (/[.:]\s*Incorrect[oa][.:]/i.test(op) || /\bIncorrect[oa]:\s/.test(op)) {
      achados.push({ id: q.id, materia: q.materia, idx, correta: idx === q.indice_correta, texto: op })
    }
  })
}
console.log(`Total achados: ${achados.length}`)
const porMateria = {}
for (const a of achados) porMateria[a.materia] = (porMateria[a.materia] || 0) + 1
console.log(porMateria)
achados.forEach(a => console.log(`- [${a.materia}] ${a.id} [${a.idx}]${a.correta ? " *CORRETA*" : ""}: ${a.texto.slice(0,150)}`))
