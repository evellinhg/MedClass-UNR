// Converte o Caso 1 (IAMCEST) de tipo "iframe" (simulador do vendor) pra
// "perguntas": 20 etapas com alternativas A/B/C, cada uma com impacto no BP
// e feedback -- formato de jogo de perguntas de verdade, em vez do menu de
// exploracao livre do simulador embutido.
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

const raw = JSON.parse(readFileSync(`${process.env.HOME}/Downloads/caso1_iam.json`, "utf-8"))

const { error } = await supabase
  .from("hospital_simulacao_casos")
  .update({
    tipo: "perguntas",
    conteudo: raw,
    arquivo_html: null,
  })
  .eq("id", "948c4bc5-3573-498c-916a-1ee4c9038021")

if (error) {
  console.error("Erro ao atualizar caso:", error.message)
  process.exit(1)
}

console.log(`Caso 1 atualizado: tipo=perguntas, ${raw.etapas.length} etapas.`)
