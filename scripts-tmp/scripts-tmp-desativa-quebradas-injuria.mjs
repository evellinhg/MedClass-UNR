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

// 2 questões de injuria com corrupção estrutural pré-existente (não relacionada
// ao pipeline de reforço/poda desta sessão), achadas na auditoria de matérias
// de sessões anteriores:
//   - 46e208b1...: só tem 2 alternativas, a correta está vazia ("Sexo femenino:")
//   - 86344067...: enunciado cortado no meio da palavra ("...célu"), correta
//     truncada ("...piel y")
// Sem o conteúdo original para reconstruir, desativadas em vez de corrigidas.
const ids = ["46e208b1-888a-42c5-a8dc-c8778d01e17f", "86344067-cc55-44f0-85ed-55fcacec34b0"]
for (const id of ids) {
  const { error } = await supabase.from("questoes").update({ ativo: false }).eq("id", id)
  console.log(error ? "ERRO" : "desativada", id, error || "")
}
