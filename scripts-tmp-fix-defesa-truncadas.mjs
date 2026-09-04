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

// duas opções truncadas no meio da frase (parênteses não fechados), uma delas
// vazando a própria explicação da resposta dentro do texto da alternativa
const FIXES = {
  "11573375-ce17-41f8-a8c0-308801ab78bd": {
    opcoesIdx: 4,
    novoTexto: "Neisseria meningitidis",
  },
  "19b3c47a-02cc-4e00-a50e-5d2b48413cd0": {
    opcoesIdx: 2,
    novoTexto: "La vacuna cuádruple bacteriana (difteria, tétanos, tos convulsa, Haemophilus influenzae tipo b)",
  },
}

for (const [id, { opcoesIdx, novoTexto }] of Object.entries(FIXES)) {
  const { data: cur, error: e1 } = await supabase.from("questoes").select("opcoes").eq("id", id).single()
  if (e1) { console.error(e1); continue }
  const opcoes = [...cur.opcoes]
  const anterior = opcoes[opcoesIdx]
  opcoes[opcoesIdx] = novoTexto
  const { error: e2 } = await supabase.from("questoes").update({ opcoes }).eq("id", id)
  if (e2) { console.error(e2); continue }
  console.log(id.slice(0,8), ":", JSON.stringify(anterior), "->", JSON.stringify(novoTexto))
}
