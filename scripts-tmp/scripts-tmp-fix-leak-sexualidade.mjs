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

// corrupção pré-existente em sexualidade_genero_reproducao (não relacionada ao
// pipeline de reforço/poda): opções (incluindo 3 corretas) com um fragmento de
// texto de OUTRO assunto colado no final, ex: "...ya no se utilizan en el
// psicoanálisis moderno. temas secundarios y". Confirmado com o usuário para
// cortar o fragmento vazado mesmo nas corretas, já que não altera o sentido
// da resposta, só remove o ruído.
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
function parensBalanceados(t) { return (t.match(/\(/g) || []).length === (t.match(/\)/g) || []).length }

const alvos = [
  { id: "7213b5ae-ee8e-4a06-8200-424255dc7ed7", idx: 3 },
  { id: "83b92319-ca2c-4d50-a56c-5565bdae7df3", idx: 3 },
  { id: "20c8ccb0-b151-47c4-afa2-ebc22cbd2e6a", idx: 3 },
  { id: "e3730fb0-4c16-4a48-962f-fc049526e385", idx: 3 },
  { id: "171d8ba4-604f-4f98-b5d7-93022a997be7", idx: 0 },
  { id: "171d8ba4-604f-4f98-b5d7-93022a997be7", idx: 3 },
  { id: "26dc462c-9859-42c7-b852-3bf9c6e2b4fa", idx: 3 },
  { id: "ac1de98e-b501-4a63-adf1-d4deede84559", idx: 3 },
  { id: "4e460221-cf22-43a3-b5e4-8d65161d7dfe", idx: 0 },
  { id: "40820c36-01a6-44dc-b45e-841a77a6737b", idx: 3 },
  { id: "5c3ea8b9-5416-4026-9cf1-5bb97c66c311", idx: 3 },
  { id: "1e7bd45c-457f-4d34-9e63-f1b2d08eff81", idx: 3 },
  { id: "37f466a0-271b-49e6-96b4-95a2706c923a", idx: 3 },
  { id: "1e462780-74fd-4171-830f-4bb00aa90183", idx: 3 },
  { id: "628475c8-bcd7-4959-90a1-60cdd5432312", idx: 3 },
  { id: "f853bac5-85e1-44a9-a869-2992568601a3", idx: 3 },
  { id: "746b37b5-5dca-4c23-86b5-98cf53a9ca99", idx: 3 },
  { id: "080671c6-5d4e-4f89-bd8f-a5c3f69fefce", idx: 3 },
  { id: "1b70db87-6ce0-4105-83e5-3568f71f4630", idx: 2 },
  { id: "623f4a5a-9751-4664-b7f7-fe38bfea46dc", idx: 3 },
  { id: "a995923f-1872-4bf3-acba-fc36c623b8ca", idx: 3 },
  { id: "749fff98-9172-47b2-ba31-a84553c9437c", idx: 3 },
  { id: "edc2186e-10ae-42b6-8f6d-10081ae8fd44", idx: 3 },
  { id: "1f150eee-7905-4832-92c4-77cf5967f8eb", idx: 3 },
  { id: "0404c647-7bc1-4b0f-a6ef-9413c4ad01ae", idx: 3 },
  { id: "44f93430-57ea-401e-bf51-ca2088f74111", idx: 3 },
  { id: "1b572eda-f609-4e74-b765-096f4d8b3417", idx: 3 },
  { id: "fea909aa-c0a5-4aa0-893c-8d69a03b94b6", idx: 3 },
  { id: "595ee6af-b958-442d-aff6-344e30e06919", idx: 3 },
]

const porQuestao = {}
for (const a of alvos) {
  porQuestao[a.id] = porQuestao[a.id] || []
  porQuestao[a.id].push(a.idx)
}

let corrigidas = 0
for (const [id, idxs] of Object.entries(porQuestao)) {
  const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", id).single()
  if (error) { console.error(id, error); continue }
  const novasOpcoes = [...q.opcoes]
  for (const idx of idxs) {
    const frases = dividirFrases(novasOpcoes[idx])
    let mantida = frases[0]
    let i = 1
    while (i < frases.length && !parensBalanceados(mantida)) {
      mantida += frases[i]
      i++
    }
    novasOpcoes[idx] = mantida
  }
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
  if (err2) { console.error("erro update", id, err2); continue }
  corrigidas++
}
console.log(`Questões corrigidas: ${corrigidas}`)
