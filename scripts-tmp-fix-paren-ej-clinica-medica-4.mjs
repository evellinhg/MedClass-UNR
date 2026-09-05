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

// bug no v2 do podar(): a checagem terminaEmPalavraSegura() só remove o ponto FINAL
// da string antes de olhar a última palavra, então uma abreviação como "(ej."
// (que já contém um ponto interno) sobrevivia ao teste porque nenhuma outra
// regra pega uma abertura de parênteses seguida de uma abreviação truncada.
// Restaura o texto original (pré-reforço/poda) das 3 opções afetadas em
// clinica_medica_4, cujo conteúdo entre parênteses foi perdido.
const original = JSON.parse(readFileSync(`${SCRATCH}/clinica_medica_4_full.json`, "utf-8"))
const byId = Object.fromEntries(original.map((q) => [q.id, q]))

const fixes = [
  { id: "9efeda57-44e0-4d69-b4b5-2b292c61d277", idxs: [1, 3] },
  { id: "c425b9f4-1573-4c3d-92a6-dd318f647503", idxs: [1] },
  { id: "1a77998c-7222-4bea-bbb2-56c8633179cd", idxs: [2] },
]

for (const f of fixes) {
  const orig = byId[f.id]
  const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", f.id).single()
  if (error) { console.error(f.id, error); continue }
  const novasOpcoes = [...q.opcoes]
  for (const idx of f.idxs) {
    if (idx === q.indice_correta) { console.error("BLOQUEADO: correta", f.id, idx); continue }
    novasOpcoes[idx] = orig.opcoes[idx]
  }
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", f.id)
  console.log(err2 ? "ERRO" : "corrigida", f.id, err2 || "")
}
