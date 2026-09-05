import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/73e6c3a9-25d3-4e28-969b-da3fc967d2a6/scratchpad"
mkdirSync(SCRATCH, { recursive: true })

// Perguntas que dependem do enunciado de "la pregunta/caso anterior": como o
// treinamento embaralha a ordem das questões, essas ficam sem contexto e
// geram nota incorreta para o aluno. Localizadas em toda a tabela questoes
// (não só nas matérias auditadas por viés) e desativadas via `ativo=false`.
const PATTERNS = [
  "pregunta anterior", "caso anterior", "ejercicio anterior", "consigna anterior",
  "actividad anterior", "pregunta previa", "caso clínico anterior", "enunciado anterior",
  "del caso anterior", "de la pregunta anterior", "cuestión anterior", "item anterior",
  "punto anterior", "inciso anterior",
]

function norm(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase() }

const { count } = await supabase.from("questoes").select("id", { count: "exact", head: true })
const all = []
for (let from = 0; from < count; from += 1000) {
  const { data: page, error } = await supabase.from("questoes").select("id,materia,enunciado,opcoes,opcoes_comentario").range(from, from + 999)
  if (error) { console.error(error); process.exit(1) }
  all.push(...page)
}

const hits = []
for (const q of all) {
  const texto = norm(q.enunciado + " " + (q.opcoes ?? []).join(" ") + " " + (q.opcoes_comentario ?? []).join(" "))
  for (const p of PATTERNS) {
    if (texto.includes(norm(p))) {
      hits.push({ id: q.id, materia: q.materia, enunciado: q.enunciado })
      break
    }
  }
}
writeFileSync(`${SCRATCH}/sequential_questions.json`, JSON.stringify(hits, null, 1))
console.log("Encontradas:", hits.length)

const { data, error } = await supabase.from("questoes").update({ ativo: false }).in("id", hits.map(h => h.id)).select("id")
if (error) { console.error(error); process.exit(1) }
console.log("Desativadas:", data.length)
