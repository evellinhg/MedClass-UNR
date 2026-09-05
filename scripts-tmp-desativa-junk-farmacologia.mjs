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

// 40 questões de farmacologia importadas com fallback de template quebrado:
// enunciado genérico ("Pregunta de evaluación sobre... #NNN") e opções sem
// conteúdo médico real ("Opción de evaluación A/B/C/D..."). Sem conteúdo
// recuperável para reescrever; desativadas em vez de corrigidas.
let all = []
{
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("questoes").select("id,enunciado").eq("materia", "farmacologia").eq("ativo", true).range(from, from + 499)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < 500) break
    from += 500
  }
}
const junk = all.filter((q) => /Pregunta de evaluaci[oó]n sobre/i.test(q.enunciado))
console.log(`Questões junk encontradas: ${junk.length}`)

for (const q of junk) {
  const { error } = await supabase.from("questoes").update({ ativo: false }).eq("id", q.id)
  if (error) { console.error("erro", q.id, error); continue }
}
console.log(`Desativadas: ${junk.length}`)
