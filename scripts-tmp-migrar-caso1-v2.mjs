// Substitui o conteudo do Caso 1 pela versao v2 (novo no de exame_fisico,
// sinal vital FR, alvos_vitais absolutos por opcao, desenlaces_finales em
// formato flat camino_1..4), traduzida para espanhol a partir de
// caso1-iamcest-ramificado-v2.json (original em portugues).
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

const raw = JSON.parse(
  readFileSync(
    "/private/tmp/claude-502/-Users-Evelllin-Desktop-medclass-pratico/560aff66-e9a8-4825-a43d-cf88914634fe/scratchpad/caso1-iamcest-ramificado-v2-es.json",
    "utf-8"
  )
)

const { error } = await supabase
  .from("hospital_simulacao_casos")
  .update({ conteudo: raw })
  .eq("id", "948c4bc5-3573-498c-916a-1ee4c9038021")

if (error) {
  console.error("Erro ao atualizar caso:", error.message)
  process.exit(1)
}

console.log(`Caso 1 atualizado para a versao v2: ${Object.keys(raw.etapas).length} etapas.`)
