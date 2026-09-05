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

const materia = process.argv[2]
if (!materia) { console.error("uso: node scripts-tmp-fix-frase-curta-generico.mjs <materia>"); process.exit(1) }
const suspeitas = JSON.parse(readFileSync(`${SCRATCH}/${materia}_frase_curta_suspeitas.json`, "utf-8"))

// exclui os IDs que na revisão manual não são truncamento real (frases completas e legítimas)
const IGNORAR = new Set([
  "a631461a-8ca6-43ef-b745-e425df2003db:3",
  "43fa072e-8940-4527-8aa3-7f93e672a31b:1",
  "5656624a-bbc0-4bf6-9f38-8b3118d668b9:0",
])

function dividirFrases(texto) {
  const frases = []
  let atual = ""
  for (let i = 0; i < texto.length; i++) {
    atual += texto[i]
    if (texto[i] === ".") {
      const proximo = texto[i + 1]
      const anterior = texto[i - 1]
      const separadorDeMilhar = anterior && /\d/.test(anterior) && proximo && /\d/.test(proximo)
      if (!separadorDeMilhar && (proximo === undefined || proximo === " ")) {
        frases.push(atual.trim())
        atual = ""
      }
    }
  }
  if (atual.trim()) frases.push(atual.trim())
  return frases
}

const porQuestao = {}
for (const s of suspeitas) {
  const chave = `${s.id}:${s.idx}`
  if (IGNORAR.has(chave)) continue
  porQuestao[s.id] = porQuestao[s.id] || []
  porQuestao[s.id].push(s)
}

let corrigidas = 0
for (const [id, itens] of Object.entries(porQuestao)) {
  const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", id).single()
  if (error) { console.error(id, error); continue }
  const novasOpcoes = [...q.opcoes]
  for (const item of itens) {
    if (item.idx === q.indice_correta) { console.error("BLOQUEADO: correta", id, item.idx); continue }
    const frases = dividirFrases(novasOpcoes[item.idx])
    novasOpcoes[item.idx] = frases[0] // mantém apenas a primeira frase, descarta a corrompida/redundante
  }
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
  if (err2) { console.error("erro update", id, err2); continue }
  corrigidas++
}
console.log(`Questões corrigidas: ${corrigidas}`)
