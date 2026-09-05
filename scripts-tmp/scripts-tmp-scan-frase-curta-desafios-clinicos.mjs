import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"

// equivalente a scripts-tmp-scan-frase-curta-generico.mjs para
// desafios_clinicos_perguntas: mesma heurística (opção com 2+ frases cuja
// última tem <=4 palavras é suspeita de resíduo de reforço/poda), aplicada
// ao campo "texto" de cada alternativa em vez de opcoes[].
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

const suspeitas = []
for (const q of all) {
  q.alternativas.forEach((alt, idx) => {
    const texto = alt.texto || ""
    const frases = dividirFrases(texto)
    if (frases.length < 2) return
    const ultima = frases[frases.length - 1]
    const palavras = ultima.replace(/\.$/, "").trim().split(/\s+/)
    if (palavras.length <= 4) {
      suspeitas.push({ id: q.id, idx, correta: alt.correta === true, texto, ultimaFrase: ultima })
    }
  })
}

console.log(`Total questões: ${all.length}`)
console.log(`Opções suspeitas (última frase curta após frase(s) anterior(es)): ${suspeitas.length}`)
suspeitas.forEach((s) => {
  console.log(`- ${s.id} [${s.idx}]${s.correta ? " *CORRETA*" : ""}`)
  console.log(`    "${s.texto}"`)
})
writeFileSync(`${SCRATCH}/desafios_clinicos_frase_curta_suspeitas.json`, JSON.stringify(suspeitas, null, 2))
