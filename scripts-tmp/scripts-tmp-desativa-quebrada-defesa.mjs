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

// mesma questão duplicada (mesmo conteúdo) já desativada em injuria
// (scripts-tmp-desativa-quebradas-injuria.mjs): enunciado embaralhado com
// fragmentos de comentários de outras alternativas, e a alternativa correta
// também truncada ("...causar infecciones de piel y"). Sem conteúdo
// original confiável para reconstruir.
const { error } = await supabase.from("questoes").update({ ativo: false }).eq("id", "6527f7f6-5c1c-4ff4-a77c-aa91514f6650")
console.log(error ? "ERRO" : "desativada", error || "")
