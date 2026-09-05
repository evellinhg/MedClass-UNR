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
  "01481aea-1e63-411c-8412-4fcce46610dd:3",
  "da360346-4ba8-4c0f-886a-6ca9d406256d:2",
  "da360346-4ba8-4c0f-886a-6ca9d406256d:3",
  "87db6449-0b53-4fae-89a9-8b4e42de7c75:1",
  "87db6449-0b53-4fae-89a9-8b4e42de7c75:2",
  "b4c64d4d-1588-428a-b3fb-598111d10a60:0",
  "abccc030-8b20-4b12-881d-dff7fac4b662:0",
  "abccc030-8b20-4b12-881d-dff7fac4b662:2",
  "720b7156-fd39-4817-86e7-df6be2b6a4ce:0",
  "1f6fe777-d0bc-4be1-bfdd-ab85df5472de:0",
  "5b3de5d9-8593-4de4-a979-77a5da8f7707:2",
  "a1a3a68c-d284-4463-a1ee-ef30de4c9e93:0",
  "c425b9f4-1573-4c3d-92a6-dd318f647503:2",
  "5c4d0c64-98a3-446f-aaae-8c7e335c20e2:0",
  "5c4d0c64-98a3-446f-aaae-8c7e335c20e2:1",
  "b5a0fd9d-0ec1-4aa5-b212-e4fa662ee7ec:1",
  "b5a0fd9d-0ec1-4aa5-b212-e4fa662ee7ec:2",
  "2be9fb0a-78b3-41ca-abc4-163bbcc0c8a3:0",
  "2be9fb0a-78b3-41ca-abc4-163bbcc0c8a3:1",
  "fbf4c0a0-d187-4e8c-9851-8c259466c313:1",
  "d8d6916b-f934-4a77-b5b9-540613e18092:1",
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
    // dividirFrases também quebra em abreviações com ponto (ex: "(ej."), então frases[0]
    // sozinha pode deixar parênteses abertos; nesse caso junta frases seguintes até fechar.
    let mantida = frases[0]
    let i = 1
    while (i < frases.length && (mantida.match(/\(/g) || []).length !== (mantida.match(/\)/g) || []).length) {
      mantida += frases[i]
      i++
    }
    novasOpcoes[item.idx] = mantida // mantém apenas a primeira frase (completa), descarta a corrompida/redundante
  }
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
  if (err2) { console.error("erro update", id, err2); continue }
  corrigidas++
}
console.log(`Questões corrigidas: ${corrigidas}`)
