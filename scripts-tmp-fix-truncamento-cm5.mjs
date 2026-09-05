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

const PALAVRAS_INCOMPLETAS = new Set([
  "y","o","la","el","de","del","al","que","con","por","para","a","en","su","sus",
  "un","una","unos","unas","es","son","se","no","las","los","como","sin","más","muy",
  "e","desde","hacia","sobre","entre","cuando","donde","si","the","and","of","to"
])

function ultimaPalavraIncompleta(texto) {
  const t = texto.trim()
  if (!t.endsWith(".")) return null
  const semPontoFinal = t.slice(0, -1)
  const idxUltimoPonto = semPontoFinal.lastIndexOf(". ")
  const ultimaFrase = idxUltimoPonto >= 0 ? semPontoFinal.slice(idxUltimoPonto + 2) : semPontoFinal
  const palavras = ultimaFrase.trim().split(/\s+/)
  const ultimaPalavra = (palavras[palavras.length - 1] || "").toLowerCase().replace(/[.,;:]/g, "")
  return PALAVRAS_INCOMPLETAS.has(ultimaPalavra) ? { idxUltimoPonto, ultimaFrase } : null
}

// tenta cortar no último ponto final "de verdade" (frase anterior completa),
// descartando a frase final corrompida. Se não sobrar nada substancial, retorna null.
function tentarCortarNaFraseAnterior(texto, info) {
  if (info.idxUltimoPonto < 0) return null // não há frase anterior, só a corrompida
  const cortado = texto.slice(0, info.idxUltimoPonto + 1).trim() // inclui o ponto da frase anterior
  if (cortado.length < 30) return null
  return cortado
}

const original = JSON.parse(readFileSync(`${SCRATCH}/cm5_full.json`, "utf-8"))
const byId = Object.fromEntries(original.map((q) => [q.id, q]))

let all = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from("questoes")
      .select("id,opcoes,opcoes_comentario,indice_correta")
      .eq("materia", "clinica_medica_5")
      .eq("ativo", true)
      .range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}
console.log(`Total questões carregadas: ${all.length}`)

let corrigidas = 0
let viaFraseAnterior = 0
let viaOriginal = 0
let semFix = []

for (const q of all) {
  let mudou = false
  const novasOpcoes = [...q.opcoes]
  q.opcoes.forEach((op, idx) => {
    if (idx === q.indice_correta) return // nunca tocar na alternativa correta
    const info = ultimaPalavraIncompleta(op)
    if (!info) return
    const viaCorte = tentarCortarNaFraseAnterior(op, info)
    if (viaCorte) {
      novasOpcoes[idx] = viaCorte
      viaFraseAnterior++
      mudou = true
      return
    }
    const orig = byId[q.id]
    if (orig && orig.opcoes[idx] && ultimaPalavraIncompleta(orig.opcoes[idx]) === null) {
      novasOpcoes[idx] = orig.opcoes[idx]
      viaOriginal++
      mudou = true
      return
    }
    semFix.push({ id: q.id, idx, texto: op })
  })
  if (mudou) {
    const { error } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", q.id)
    if (error) { console.error("erro ao atualizar", q.id, error); continue }
    corrigidas++
  }
}

console.log(`Questões corrigidas: ${corrigidas}`)
console.log(`Opções corrigidas cortando na frase anterior: ${viaFraseAnterior}`)
console.log(`Opções corrigidas restaurando texto original: ${viaOriginal}`)
console.log(`Opções sem fix automático possível: ${semFix.length}`)
if (semFix.length) writeFileSync(`${SCRATCH}/cm5_truncamento_sem_fix.json`, JSON.stringify(semFix, null, 2))
