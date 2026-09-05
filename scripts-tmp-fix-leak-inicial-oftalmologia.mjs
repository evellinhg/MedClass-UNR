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

// achado pela auditoria pré-constraint (scripts-tmp-verifica-constraints-propostas.mjs):
// opção com "Incorrecto." vazado no início do texto (mesmo padrão de
// feedback_distractor_rewrite_answer_leak, provavelmente de uma sessão anterior).
const id = "b8ef44fa-6db5-4046-84f7-fe2b6210168a"
const idx = 0
const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", id).single()
if (error) { console.error(error); process.exit(1) }
if (idx === q.indice_correta) { console.error("BLOQUEADO: correta"); process.exit(1) }
const novasOpcoes = [...q.opcoes]
novasOpcoes[idx] = novasOpcoes[idx].replace(/^Incorrecto\.?\s*/i, "")
const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
console.log(err2 ? "ERRO" : "corrigida", err2 || novasOpcoes[idx])
