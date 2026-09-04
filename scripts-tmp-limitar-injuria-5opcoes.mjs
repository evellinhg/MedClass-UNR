// Limita a 5 alternativas as 9 questões de injuria que tinham 6-8 opções,
// removendo apenas alternativas INCORRETAS (a correta nunca é removida).
// No processo, 2 dessas 9 se revelaram corrompidas por outro motivo (não é
// só excesso de opções) e foram reconstruídas em vez de só aparadas:
// - fbfc980b: enunciado era uma colagem de fragmentos de várias questões
//   (rótulos soltos "i)"/"j)") e uma opção (D) terminava cortada no meio da
//   frase -- reconstruída com enunciado limpo e 4 distratores novos sobre
//   vírus respiratórios.
// - 26e68a2d: enunciado trazia 5 pistas de um exercício de correlação
//   original ("(G)...(F)...(B)...(A)...(E)..."), mas a questão convertida
//   só testa UMA delas (a pista G, granulações metacromáticas -> Mastocitos)
//   -- as outras 4 pistas ficaram penduradas sem uso. Enunciado reescrito
//   pra conter só a pista realmente usada.
//
// Nas outras 7, a remoção sempre prioriza tirar as alternativas "combo"
// (ex. "A+B", "Todas as anteriores" duplicadas) ou as menos plausíveis,
// nunca uma alternativa cujo texto seja referenciado por outra (ex. não
// removo a opção B se outra opção diz literalmente "A+B" -- nesses casos
// removo a opção-combo em vez da opção-base).
//
// Uso: node scripts-tmp-limitar-injuria-5opcoes.mjs --dry-run
//      node scripts-tmp-limitar-injuria-5opcoes.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const DRY_RUN = process.argv.includes("--dry-run")
const LETRAS = "ABCDEFGH"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// -- fixes: trim (remove índices) ou replace (reconstrução completa) --------
const fixes = [
  { id: "7bd2649e-562b-4f88-a6eb-3cd52f70597c", tipo: "trim", removerIdx: [5] }, // remove F "B+C"
  { id: "775f14fc-4752-46e2-8f4f-cdaa5efb53eb", tipo: "trim", removerIdx: [5] }, // remove F "Ninguna de las anteriores"
  { id: "35912b18-fb7c-4c06-bc8b-7914302c4cf2", tipo: "trim", removerIdx: [5] }, // remove F "B+C"
  { id: "715d8fb0-0add-480e-a5ee-0fa040412da6", tipo: "trim", removerIdx: [4] }, // remove E "Solo hepatitis E"
  { id: "dbbf440f-2303-4f4a-bc6e-d50ced9b6143", tipo: "trim", removerIdx: [2, 3, 4] }, // remove C,D,E "Solo hep C/D/E"
  { id: "7aecc2e1-39a2-4999-8ec4-365f8837d2d6", tipo: "trim", removerIdx: [4] }, // remove E "todas correcta"
  { id: "e9e0b91c-6bf7-4eb7-a379-9832980adc15", tipo: "trim", removerIdx: [5] }, // remove F "A,B,D"
  {
    id: "26e68a2d-63a5-4a7b-a435-066f5a443eb2",
    tipo: "trim",
    enunciadoOverride: "¿Qué tipo celular del tejido conectivo se caracteriza por poseer granulaciones metacromáticas en su citoplasma, visibles con colorantes como el azul de toluidina?",
    removerIdx: [2, 5, 7], // Adipocitos, Macrófagos (duplicava "Macrófagos inactivos"), Células mesenquimales indiferenciadas
  },
  {
    id: "fbfc980b-9c38-4043-8374-475ad348a887",
    tipo: "replace",
    enunciado: "Con respecto a los virus respiratorios, señale la opción correcta:",
    opcoes: [
      "El virus influenza posee distintos serotipos",
      "El virus respiratorio sincitial (VSR) es improbable que infecte a niños menores de 2 años.",
      "Los virus parainfluenza presentan un único serotipo, lo que explica una inmunidad permanente tras la primoinfección.",
      "La infección por virus influenza no predispone a sobreinfecciones bacterianas, ya que la respuesta inmune antiviral protege también frente a bacterias.",
      "Los adenovirus solo producen infecciones del aparato respiratorio, sin afectar otros sistemas.",
    ],
    indice_correta: 0,
    opcoes_comentario: [
      "Correcto. El virus influenza posee distintos serotipos (A, B, C). El tipo A tiene subtipos según hemaglutinina (H1-H18) y neuraminidasa (N1-N11), y es responsable de pandemias por variación antigénica mayor (shift).",
      "Incorrecto. El VSR es la causa más frecuente de bronquiolitis en lactantes: la gran mayoría de los niños se infecta al menos una vez antes de los 2 años de edad -- es altamente probable, no improbable, la infección en este grupo etario.",
      "Incorrecto. Existen varios serotipos de virus parainfluenza (1 a 4), cada uno con características clínicas distintas, y la inmunidad tras la infección natural es parcial y de corta duración, permitiendo reinfecciones.",
      "Incorrecto. La infección por influenza daña el epitelio respiratorio y altera la inmunidad local, lo que predispone a sobreinfecciones bacterianas secundarias (frecuentemente por Streptococcus pneumoniae o Staphylococcus aureus), una de las principales causas de morbimortalidad asociada a la gripe.",
      "Incorrecto. Los adenovirus pueden causar, además de cuadros respiratorios, conjuntivitis, gastroenteritis, cistitis hemorrágica y cuadros graves en inmunocomprometidos -- no se limitan al aparato respiratorio.",
    ],
    justificativa: "Enunciado original era uma colagem de fragmentos de múltiplas questões (rótulos soltos 'i)'/'j)') e a opção D terminava cortada no meio da frase; reconstruída com enunciado limpo e distratores novos sobre virología respiratoria, mantendo a alternativa correta original.",
  },
]

console.log(`${fixes.length} questões a corrigir.\n`)

const resultados = []
for (const fix of fixes) {
  const { data: atual, error: errLeitura } = await supabase.from("questoes").select("*").eq("id", fix.id).single()
  if (errLeitura || !atual) { console.error(`Erro ao ler ${fix.id}:`, errLeitura?.message); process.exit(1) }

  let payload
  if (fix.tipo === "trim") {
    const manterIdx = atual.opcoes.map((_, i) => i).filter((i) => !fix.removerIdx.includes(i))
    if (fix.removerIdx.includes(atual.indice_correta)) throw new Error(`${fix.id}: removeria a correta!`)
    payload = {
      opcoes: manterIdx.map((i) => atual.opcoes[i]),
      opcoes_comentario: manterIdx.map((i) => (atual.opcoes_comentario ?? [])[i] ?? null),
      indice_correta: manterIdx.indexOf(atual.indice_correta),
    }
    if (fix.enunciadoOverride) payload.enunciado = fix.enunciadoOverride
  } else {
    payload = { enunciado: fix.enunciado, opcoes: fix.opcoes, opcoes_comentario: fix.opcoes_comentario, indice_correta: fix.indice_correta, justificativa: fix.justificativa ?? atual.justificativa }
  }

  if (payload.opcoes.length > 5) throw new Error(`${fix.id}: ainda tem ${payload.opcoes.length} opções após o fix!`)
  if (payload.opcoes.length !== payload.opcoes_comentario.length) throw new Error(`${fix.id}: opcoes/comentarios desalinhados`)
  if (payload.indice_correta < 0 || payload.indice_correta >= payload.opcoes.length) throw new Error(`${fix.id}: indice_correta inválido`)

  console.log(`id=${fix.id} [${fix.tipo}]`)
  console.log(`  enunciado: ${(payload.enunciado ?? atual.enunciado).slice(0, 100)}`)
  console.log(`  antes (${atual.opcoes.length} opções): correta=${LETRAS[atual.indice_correta]}`)
  atual.opcoes.forEach((o, i) => console.log(`    [${LETRAS[i]}]${i === atual.indice_correta ? "*" : ""}: ${o}`))
  console.log(`  depois (${payload.opcoes.length} opções): correta=${LETRAS[payload.indice_correta]}`)
  payload.opcoes.forEach((o, i) => console.log(`    [${LETRAS[i]}]${i === payload.indice_correta ? "*" : ""}: ${o}`))
  console.log()

  resultados.push({ id: fix.id, payload })
}

if (DRY_RUN) {
  console.log(`--dry-run: nada foi atualizado no banco. ${resultados.length} questões seriam atualizadas.`)
  process.exit(0)
}

for (const r of resultados) {
  const { error } = await supabase.from("questoes").update(r.payload).eq("id", r.id)
  if (error) { console.error(`Erro ao atualizar ${r.id}:`, error.message); process.exit(1) }
}
console.log(`Concluído: ${resultados.length} questões de injuria ajustadas para no máximo 5 alternativas.`)
