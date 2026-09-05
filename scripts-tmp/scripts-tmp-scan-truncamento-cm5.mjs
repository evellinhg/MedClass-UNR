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

// palavras que, sozinhas antes de um ponto final, quase sempre indicam frase cortada no meio
const PALAVRAS_INCOMPLETAS = new Set([
  "y","o","la","el","de","del","al","que","con","por","para","a","en","su","sus",
  "un","una","unos","unas","es","son","se","no","las","los","como","sin","más","muy",
  "e","desde","hacia","sobre","entre","cuando","donde","si","the","and","of","to"
])

function terminaTruncada(texto) {
  const t = texto.trim()
  if (!t.endsWith(".")) return false
  // última "frase" = do último ponto anterior (ou início) até o ponto final
  const semPontoFinal = t.slice(0, -1)
  const idxUltimoPonto = semPontoFinal.lastIndexOf(". ")
  const ultimaFrase = idxUltimoPonto >= 0 ? semPontoFinal.slice(idxUltimoPonto + 2) : semPontoFinal
  const palavras = ultimaFrase.trim().split(/\s+/)
  const ultimaPalavra = (palavras[palavras.length - 1] || "").toLowerCase().replace(/[.,;:]/g, "")
  if (PALAVRAS_INCOMPLETAS.has(ultimaPalavra)) return { motivo: `termina em "${ultimaPalavra}."`, ultimaFrase }
  // frase final muito curta (menos de 3 palavras) também é suspeita de corte
  if (palavras.length <= 2 && ultimaFrase.length < 20) return { motivo: "frase final muito curta", ultimaFrase }
  return false
}

let data = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data: page, error } = await supabase
      .from("questoes")
      .select("id,opcoes,indice_correta")
      .eq("materia", "clinica_medica_5")
      .eq("ativo", true)
      .range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    data.push(...page)
    if (page.length < pageSize) break
    from += pageSize
  }
}

const suspeitas = []
for (const q of data) {
  q.opcoes.forEach((op, idx) => {
    const r = terminaTruncada(op)
    if (r) suspeitas.push({ id: q.id, idx, correta: idx === q.indice_correta, motivo: r.motivo, ultimaFrase: r.ultimaFrase, texto: op })
  })
}

console.log(`Total questões: ${data.length}`)
console.log(`Opções suspeitas de truncamento: ${suspeitas.length}`)
suspeitas.forEach((s) => {
  console.log(`- ${s.id} [${s.idx}]${s.correta ? " *CORRETA*" : ""} (${s.motivo})`)
  console.log(`    ...${s.texto.slice(-100)}`)
})

writeFileSync(`${SCRATCH}/cm5_truncamento_suspeitas.json`, JSON.stringify(suspeitas, null, 2))
