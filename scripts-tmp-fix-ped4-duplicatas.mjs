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
const data = JSON.parse(readFileSync(`${SCRATCH}/ped4_duplicatas.json`, "utf-8"))
const dupGroup = data.filter(q => q.enunciado.startsWith("Pregunta"))
console.log("Duplicatas encontradas:", dupGroup.length)

// mantém a primeira (por created_at) com enunciado reescrito e completo;
// desativa as outras 94 (ativo=false), mesmo método usado nas 36 perguntas
// "de la pregunta anterior" -- preserva histórico de quem já respondeu.
dupGroup.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
const manter = dupGroup[0]
const desativar = dupGroup.slice(1)
console.log("Mantendo:", manter.id, "criada em", manter.created_at)
console.log("Desativando:", desativar.length)

const novoEnunciado = "Durante la monitorización de un lactante con cuadro respiratorio severo (bronquiolitis), clínicamente estable pero con signos de dificultad respiratoria y secreciones en la vía aérea superior, ¿cuál es la conducta más adecuada?"

const { error: e1 } = await supabase.from("questoes").update({ enunciado: novoEnunciado }).eq("id", manter.id)
if (e1) { console.error(e1); process.exit(1) }
console.log("Enunciado reescrito em", manter.id)

const { data: upd, error: e2 } = await supabase.from("questoes").update({ ativo: false }).in("id", desativar.map(q => q.id)).select("id")
if (e2) { console.error(e2); process.exit(1) }
console.log("Desativadas:", upd.length)
