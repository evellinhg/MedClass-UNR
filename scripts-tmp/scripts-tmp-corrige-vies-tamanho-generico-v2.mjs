import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync, existsSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"

// v2: corrige os bugs encontrados em clinica_medica_5 (script anterior:
// scripts-tmp-corrige-tamanho-cm5-lote-generico.mjs)
//   1) split de frases por "." confundia separador de milhar (ex: "100.000")
//      com fim de frase -> agora só considera fim de frase quando o ponto
//      NÃO está entre dois dígitos.
//   2) fallback de corte por palavra podia parar em preposição/artigo/conjunção
//      ("de.", "por.", "y.") ou deixar parêntese aberto -> agora recua
//      palavra por palavra até terminar numa palavra "segura" e com parênteses
//      balanceados.

const materia = process.argv[2]
if (!materia) { console.error("uso: node scripts-tmp-corrige-vies-tamanho-generico-v2.mjs <materia>"); process.exit(1) }

function limpar(comentario) {
  if (!comentario) return null
  let t = comentario.replace(/^Incorrect[oa][.:]?\s*/i, "").trim()
  if (/opci[oó]n correcta|respuesta correcta|es correcta\b/i.test(t)) return null
  return t
}

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
        frases.push(atual)
        atual = ""
      }
    }
  }
  if (atual.trim()) frases.push(atual)
  return frases
}

const PALAVRAS_INCOMPLETAS = new Set([
  "y","o","la","el","de","del","al","que","con","por","para","a","en","su","sus",
  "un","una","unos","unas","es","son","se","no","las","los","como","sin","más","muy",
  "e","desde","hacia","sobre","entre","cuando","donde","si"
])

function parensBalanceados(t) {
  return (t.match(/\(/g) || []).length === (t.match(/\)/g) || []).length
}

function terminaEmPalavraSegura(t) {
  const semPonto = t.replace(/\.$/, "")
  const palavras = semPonto.trim().split(/\s+/)
  const ultima = (palavras[palavras.length - 1] || "").toLowerCase().replace(/[.,;:()]/g, "")
  return ultima.length > 0 && !PALAVRAS_INCOMPLETAS.has(ultima)
}

function podar(texto, alvoMax) {
  if (texto.length <= alvoMax) return texto
  const frases = dividirFrases(texto)
  let acumulado = ""
  for (const f of frases) {
    if (acumulado.length > 0 && (acumulado.length + f.length) > alvoMax) break
    acumulado += f
  }
  acumulado = acumulado.trim()
  if (acumulado.length >= alvoMax * 0.6 && parensBalanceados(acumulado)) return acumulado

  // fallback: acumula palavra INTEIRA por palavra inteira (nunca corta no meio de uma palavra),
  // depois recua enquanto a última palavra parecer insegura ou deixar parênteses desbalanceados
  const todasPalavras = texto.split(" ")
  let corte = ""
  for (const p of todasPalavras) {
    const tentativa = corte ? corte + " " + p : p
    if (corte && tentativa.length > alvoMax) break
    corte = tentativa
  }
  let palavras = corte.split(" ")
  while (palavras.length > 1) {
    const candidato = palavras.join(" ").replace(/[,;:]$/, "").trim()
    if (parensBalanceados(candidato) && terminaEmPalavraSegura(candidato + ".")) {
      corte = candidato
      break
    }
    palavras.pop()
    corte = palavras.join(" ")
  }
  corte = corte.replace(/[,;:]$/, "").trim()
  if (!corte) return texto // não conseguiu cortar com segurança, mantém original
  if (!/[.!?]$/.test(corte)) corte += "."
  return corte
}

let all = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from("questoes")
      .select("id,opcoes,opcoes_comentario,indice_correta")
      .eq("materia", materia)
      .eq("ativo", true)
      .range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}
console.log(`Materia: ${materia} — total questões: ${all.length}`)
writeFileSync(`${SCRATCH}/${materia}_full.json`, JSON.stringify(all, null, 2))

// ---- reforço ----
const updates1 = []
for (const q of all) {
  const lens = q.opcoes.map((o) => o.length)
  const correta = lens[q.indice_correta]
  const alvoMin = Math.round(correta * 0.85)
  const novasOpcoes = [...q.opcoes]
  let mudou = false
  for (let i = 0; i < q.opcoes.length; i++) {
    if (i === q.indice_correta) continue
    if (novasOpcoes[i].length >= alvoMin) continue
    const extra = limpar(q.opcoes_comentario?.[i])
    if (!extra) continue
    const separador = novasOpcoes[i].trim().endsWith(".") ? " " : ". "
    novasOpcoes[i] = novasOpcoes[i].trim() + separador + extra
    mudou = true
  }
  if (mudou) updates1.push({ id: q.id, opcoes: novasOpcoes })
}
console.log(`Reforço: questões editadas = ${updates1.length}`)
for (const u of updates1) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO reforço", u.id, error)
}

// ---- poda ----
const ids = all.map((q) => q.id)
let pos1 = []
{
  const pageSize = 200
  for (let i = 0; i < ids.length; i += pageSize) {
    const chunk = ids.slice(i, i + pageSize)
    const { data, error } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", chunk)
    if (error) { console.error(error); process.exit(1) }
    pos1.push(...data)
  }
}
const updates2 = []
for (const q of pos1) {
  const correta = q.opcoes[q.indice_correta].length
  const alvoMax = Math.round(correta * 1.2)
  const novasOpcoes = q.opcoes.map((o, i) => (i === q.indice_correta ? o : podar(o, alvoMax)))
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates2.push({ id: q.id, opcoes: novasOpcoes })
}
console.log(`Poda: questões editadas = ${updates2.length}`)
for (const u of updates2) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO poda", u.id, error)
}

// ---- verificação final ----
let pos2 = []
{
  const pageSize = 200
  for (let i = 0; i < ids.length; i += pageSize) {
    const chunk = ids.slice(i, i + pageSize)
    const { data, error } = await supabase.from("questoes").select("id,opcoes,indice_correta").in("id", chunk)
    if (error) { console.error(error); process.exit(1) }
    pos2.push(...data)
  }
}
let aindaLonga = 0, aindaCurta = 0, ok2 = 0
const ratios = []
for (const q of pos2) {
  const lens = q.opcoes.map((o) => o.length)
  const maxLen = Math.max(...lens), minLen = Math.min(...lens)
  const correta = lens[q.indice_correta]
  if (correta === maxLen && lens.filter((l) => l === maxLen).length === 1) aindaLonga++
  else if (correta === minLen && lens.filter((l) => l === minLen).length === 1) aindaCurta++
  else ok2++
  const outras = lens.filter((_, i) => i !== q.indice_correta)
  ratios.push(correta / (outras.reduce((a, b) => a + b, 0) / outras.length))
}
console.log(`\nFINAL: correta_mais_longa=${aindaLonga} (${(100 * aindaLonga / pos2.length).toFixed(1)}%), correta_mais_curta=${aindaCurta} (${(100 * aindaCurta / pos2.length).toFixed(1)}%), equilibrada=${ok2}`)
console.log(`Razão média: ${(ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(2)}`)

const byId = Object.fromEntries(all.map((q) => [q.id, q]))
let integroOk = true
for (const q of pos2) {
  const original = byId[q.id]
  if (q.opcoes[q.indice_correta] !== original.opcoes[original.indice_correta]) { console.error("ALTERAÇÃO INDEVIDA NA CORRETA:", q.id); integroOk = false }
}
console.log("Integridade da correta:", integroOk ? "OK" : "FALHOU")
