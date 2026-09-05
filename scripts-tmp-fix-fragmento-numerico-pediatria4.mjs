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

// mesmo bug de separador de milhar/palavra incompleta encontrado em clinica_medica_5
// (scripts-tmp-fix-fragmento-numerico-cm5.mjs), aqui em pediatria_4: opções [2] e [3]
// terminavam truncadas no meio da palavra ("...las cuales son m.", "...criterios de síndrom.")
const id = "d5d9cea5-858a-4ce6-82fc-9498ca649ee7"
const fixes = {
  2: "Se requieren los 5 criterios presentes; las variables son la talla baja, bocio endémico, hipotonía central, microcefalia y anemia microcítica.",
  3: "Se requiere el dosaje de IgA anti-endomisio positiva asociado a calcificaciones occipitales cerebrales bilaterales.",
}

const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", id).single()
if (error) { console.error(error); process.exit(1) }
const novasOpcoes = [...q.opcoes]
for (const [idx, texto] of Object.entries(fixes)) {
  if (Number(idx) === q.indice_correta) { console.error("BLOQUEADO: correta", idx); continue }
  novasOpcoes[idx] = texto
}
const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
console.log(err2 ? "ERRO" : "corrigida", err2 || "")
