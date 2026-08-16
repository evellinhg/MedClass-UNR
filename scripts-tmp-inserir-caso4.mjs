import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const { data: existente } = await supabase
  .from("hospital_simulacao_casos")
  .select("id")
  .eq("arquivo_html", "/simuladores/caso4-tep-v2.html")
  .maybeSingle()

if (existente) {
  console.log("Caso 4 ya existe:", existente.id, "-- no se inserta de nuevo.")
  process.exit(0)
}

const { data, error } = await supabase
  .from("hospital_simulacao_casos")
  .insert({
    titulo: "Caso 4",
    descricao: null,
    arquivo_html: "/simuladores/caso4-tep-v2.html",
    tipo: "iframe",
    ordem: 4,
    ativo: true,
  })
  .select()
  .single()

if (error) {
  console.error("Error al insertar Caso 4:", error.message)
  process.exit(1)
}

console.log("Caso 4 insertado con éxito:", data.id)
