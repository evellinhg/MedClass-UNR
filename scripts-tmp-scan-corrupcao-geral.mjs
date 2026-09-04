import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"

const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true })
const data = []
for (let from = 0; from < count; from += 1000) {
  const { data: page, error } = await supabase.from("questoes").select("id,materia,enunciado,opcoes").eq("ativo", true).range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  data.push(...page)
}
console.log("Total ativas:", data.length)

const suspeitas = []
for (const q of data) {
  const en = q.enunciado || ""
  const razoes = []
  if (/\b[a-z]\)\s/.test(en) && /;/.test(en)) razoes.push("marcador de lista + ponto-e-vírgula no enunciado")
  if (/\.\.\.\s*[a-záéíóúñ]/i.test(en) || /\.\.\.\s*$/.test(en.trim())) razoes.push("reticências no enunciado")
  if ((en.match(/\(/g) || []).length !== (en.match(/\)/g) || []).length) razoes.push("parênteses não fechados no enunciado")
  for (const o of q.opcoes ?? []) {
    if ((o.match(/\(/g) || []).length !== (o.match(/\)/g) || []).length) { razoes.push("parênteses não fechados em opção"); break }
  }
  for (const o of q.opcoes ?? []) {
    if (/\.\.\.\s*$/.test(o.trim())) { razoes.push("opção termina em reticências"); break }
  }
  if ((en.match(/\?/g) || []).length >= 2) razoes.push("mais de uma interrogação no enunciado")
  if (razoes.length > 0) suspeitas.push({ id: q.id, materia: q.materia, enunciado: en, razoes })
}

console.log(`\nSuspeitas: ${suspeitas.length}`)
const porMateria = {}
for (const s of suspeitas) porMateria[s.materia] = (porMateria[s.materia] || 0) + 1
console.log(porMateria)
writeFileSync(`${SCRATCH}/scan_corrupcao_geral.json`, JSON.stringify(suspeitas, null, 1))
