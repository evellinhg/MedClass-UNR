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

const { count } = await supabase.from("desafios_clinicos_perguntas").select("id", { count: "exact", head: true })
const PAGE = 1000
const todas = []
for (let from = 0; from < count; from += PAGE) {
  const { data, error } = await supabase.from("desafios_clinicos_perguntas").select("*").range(from, from + PAGE - 1)
  if (error) { console.error(error); process.exit(1) }
  todas.push(...data)
}
console.log(`Lidas ${todas.length} perguntas de desafios_clinicos_perguntas.`)

const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/e8738065-244a-47ab-81ef-ae2d583df7cf/scratchpad"

// normaliza id da alternativa pra maiuscula (A/B/C/D), corrige a inconsistencia
// de minusculas encontrada na analise (a/b/c/d) sem mexer no conteudo
function normId(id) {
  return (id || "").toUpperCase()
}

const flagged = []
let totalDistratores = 0
for (const p of todas) {
  const alts = Array.isArray(p.alternativas) ? p.alternativas : []
  if (alts.length < 2) continue
  const correta = alts.find((a) => a.correta)
  if (!correta) continue
  const correctLen = correta.texto.length

  const needs = {}
  for (const a of alts) {
    if (a === correta) continue
    if (a.texto.length < 0.7 * correctLen && correctLen - a.texto.length > 30) {
      needs[normId(a.id)] = { current_text: a.texto, current_len: a.texto.length, target_len: correctLen, feedback_hint: a.feedback }
    }
  }
  if (Object.keys(needs).length > 0) {
    flagged.push({
      id: p.id,
      desafio_id: p.desafio_id,
      enunciado: p.enunciado,
      correct_letter: normId(correta.id),
      correct_text: correta.texto,
      explicacao: p.explicacao,
      distractors_to_expand: needs,
    })
    totalDistratores += Object.keys(needs).length
  }
}

console.log(`${flagged.length} perguntas com >=1 distrator curto, ${totalDistratores} distratores a expandir`)
writeFileSync(`${SCRATCH}/desafios_flagged.json`, JSON.stringify(flagged, null, 1))

const CHUNK = 50
const nChunks = Math.ceil(flagged.length / CHUNK)
for (let i = 0; i < nChunks; i++) {
  writeFileSync(`${SCRATCH}/desafios_chunk_${String(i).padStart(2, "0")}.json`, JSON.stringify(flagged.slice(i * CHUNK, (i + 1) * CHUNK), null, 1))
}
console.log(`${nChunks} chunks de ate ${CHUNK}`)
