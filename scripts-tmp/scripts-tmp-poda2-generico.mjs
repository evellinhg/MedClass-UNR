import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const materia = process.argv[2]
const fatorAlvo = parseFloat(process.argv[3] || "1.08")
if (!materia) { console.error("uso: node scripts-tmp-poda2-generico.mjs <materia> [fatorAlvo]"); process.exit(1) }

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
function parensBalanceados(t) { return (t.match(/\(/g) || []).length === (t.match(/\)/g) || []).length }
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
  if (acumulado.length >= alvoMax * 0.55 && parensBalanceados(acumulado)) return acumulado
  const todasPalavras2 = texto.split(" ")
  let corte = ""
  for (const p of todasPalavras2) {
    const tentativa = corte ? corte + " " + p : p
    if (corte && tentativa.length > alvoMax) break
    corte = tentativa
  }
  let palavras = corte.split(" ")
  while (palavras.length > 1) {
    const candidato = palavras.join(" ").replace(/[,;:]$/, "").trim()
    if (parensBalanceados(candidato) && terminaEmPalavraSegura(candidato + ".")) { corte = candidato; break }
    palavras.pop()
    corte = palavras.join(" ")
  }
  corte = corte.replace(/[,;:]$/, "").trim()
  if (!corte) return texto
  if (!/[.!?]$/.test(corte)) corte += "."
  return corte
}

let all = []
{
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await supabase.from("questoes").select("id,opcoes,indice_correta").eq("materia", materia).eq("ativo", true).range(from, from + pageSize - 1)
    if (error) { console.error(error); process.exit(1) }
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
}
console.log(`Materia: ${materia} — total: ${all.length} — alvo: correta*${fatorAlvo}`)

const updates = []
for (const q of all) {
  const correta = q.opcoes[q.indice_correta].length
  const alvoMax = Math.round(correta * fatorAlvo)
  const novasOpcoes = q.opcoes.map((o, i) => (i === q.indice_correta ? o : podar(o, alvoMax)))
  if (JSON.stringify(novasOpcoes) !== JSON.stringify(q.opcoes)) updates.push({ id: q.id, opcoes: novasOpcoes })
}
console.log(`Questões a editar: ${updates.length}`)
for (const u of updates) {
  const { error } = await supabase.from("questoes").update({ opcoes: u.opcoes }).eq("id", u.id)
  if (error) console.error("ERRO", u.id, error)
}
console.log(`Aplicado: ${updates.length}`)
