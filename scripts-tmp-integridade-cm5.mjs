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
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"
const original = JSON.parse(readFileSync(`${SCRATCH}/cm5_full.json`, "utf-8"))
const byId = Object.fromEntries(original.map(q => [q.id, q]))
const ids = original.map(q => q.id)
const data = []
for (let i = 0; i < ids.length; i += 200) {
  const chunk = ids.slice(i, i + 200)
  const { data: page, error } = await supabase.from("questoes").select("id,opcoes,opcoes_comentario,indice_correta,enunciado").in("id", chunk)
  if (error) { console.error(error); process.exit(1) }
  data.push(...page)
}

let indiceOk = true, correctaOk = true, enunciadoOk = true, comprimentoOk = true
for (const q of data) {
  const orig = byId[q.id]
  if (q.indice_correta !== orig.indice_correta) { console.error("INDICE MUDOU:", q.id); indiceOk = false }
  if (q.opcoes[q.indice_correta] !== orig.opcoes[orig.indice_correta]) { console.error("TEXTO DA CORRETA MUDOU:", q.id); correctaOk = false }
  if (q.enunciado !== orig.enunciado) { console.error("ENUNCIADO MUDOU:", q.id); enunciadoOk = false }
  if (q.opcoes.length !== orig.opcoes.length || q.opcoes_comentario.length !== q.opcoes.length) { console.error("CONTAGEM DIFERENTE:", q.id); comprimentoOk = false }
}
console.log(`Verificadas: ${data.length} de ${original.length} originais`)
console.log("indice_correta preservado:", indiceOk ? "OK" : "FALHOU")
console.log("texto da correta preservado:", correctaOk ? "OK" : "FALHOU")
console.log("enunciado preservado:", enunciadoOk ? "OK" : "FALHOU")
console.log("contagem opcoes==comentarios:", comprimentoOk ? "OK" : "FALHOU")
