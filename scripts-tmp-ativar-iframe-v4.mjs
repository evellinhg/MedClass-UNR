// Troca o Caso 1 de volta para tipo "iframe", apontando pro simulador HTML
// autocontido (public/simuladores/caso1-iamcest-v4.html) que agora tem o
// motor de fases ramificadas do v4 embutido (mesma logica/dados do caso
// v4 usado pelo modo "perguntas", so que reaproveitando o layout rico do
// simulador original: monitor Mindray uMEC12, ficha clinica, impresos com
// laudo, registro clinico, ficha do paciente).
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=")
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const { error } = await supabase
  .from("hospital_simulacao_casos")
  .update({ tipo: "iframe", arquivo_html: "/simuladores/caso1-iamcest-v4.html" })
  .eq("id", "948c4bc5-3573-498c-916a-1ee4c9038021")

if (error) {
  console.error("Erro ao atualizar caso:", error.message)
  process.exit(1)
}

console.log("Caso 1 atualizado: tipo=iframe, arquivo_html=/simuladores/caso1-iamcest-v4.html")
