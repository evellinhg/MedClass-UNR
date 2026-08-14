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

const { data: existente } = await supabase
  .from("hospital_simulacao_casos")
  .select("id")
  .eq("arquivo_html", "/simuladores/caso2-iamcest-inferior-vd.html")
  .maybeSingle()

if (existente) {
  console.log("Ya existe una fila para este caso:", existente.id, "-- no se inserta de nuevo.")
  process.exit(0)
}

const { data, error } = await supabase
  .from("hospital_simulacao_casos")
  .insert({
    titulo: "Caso 2 - SCACEST Inferior + VD",
    descricao: "Infarto agudo de miocardio con elevación del ST de pared inferior y extensión al ventrículo derecho. Nivel intermedio-avanzado, 11 nodos.",
    arquivo_html: "/simuladores/caso2-iamcest-inferior-vd.html",
    tipo: "iframe",
    ordem: 2,
    ativo: true,
  })
  .select()
  .single()

if (error) {
  console.error("Error al insertar:", error.message)
  process.exit(1)
}

console.log("Caso 2 insertado con éxito:", data.id)
