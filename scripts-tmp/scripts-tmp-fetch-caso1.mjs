import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"

const envFile = readFileSync("/Users/Evelllin/Desktop/MedClass UNR/.env.local", "utf-8")
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

const { data, error } = await supabase.from("hospital_simulacao_casos").select("*").order("ordem")
if (error) {
  console.error(error.message)
  process.exit(1)
}

for (const row of data) {
  console.log(`ID: ${row.id} | ordem: ${row.ordem} | titulo: ${row.titulo} | tipo: ${row.tipo} | ativo: ${row.ativo}`)
}

writeFileSync(
  "/private/tmp/claude-502/-Users-Evelllin-Desktop-medclass-pratico/ed02b00f-421f-47ad-b010-7708b8ddeda9/scratchpad/casos-atuais.json",
  JSON.stringify(data, null, 2)
)
console.log("Salvo em casos-atuais.json")
