import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 1) Genericizar Caso 1 e Caso 2 -- o aluno no puede ver el tema antes de jugar.
const { error: err1 } = await supabase
  .from("hospital_simulacao_casos")
  .update({ titulo: "Caso 1", descricao: null })
  .eq("arquivo_html", "/simuladores/caso1-iamcest-v5.html")
if (err1) { console.error("Error actualizando Caso 1:", err1.message); process.exit(1) }
console.log("Caso 1 actualizado -> titulo genérico, sin descripción.")

const { error: err2 } = await supabase
  .from("hospital_simulacao_casos")
  .update({ titulo: "Caso 2", descricao: null })
  .eq("arquivo_html", "/simuladores/caso2-iamcest-inferior-vd.html")
if (err2) { console.error("Error actualizando Caso 2:", err2.message); process.exit(1) }
console.log("Caso 2 actualizado -> titulo genérico, sin descripción.")

// 2) Insertar Caso 3 (si no existe ya)
const { data: existente } = await supabase
  .from("hospital_simulacao_casos")
  .select("id")
  .eq("arquivo_html", "/simuladores/caso3-iamcest-vd-hemodinamia.html")
  .maybeSingle()

if (existente) {
  console.log("Caso 3 ya existe:", existente.id, "-- no se inserta de nuevo.")
} else {
  const { data, error } = await supabase
    .from("hospital_simulacao_casos")
    .insert({
      titulo: "Caso 3",
      descricao: null,
      arquivo_html: "/simuladores/caso3-iamcest-vd-hemodinamia.html",
      tipo: "iframe",
      ordem: 3,
      ativo: true,
    })
    .select()
    .single()

  if (error) { console.error("Error al insertar Caso 3:", error.message); process.exit(1) }
  console.log("Caso 3 insertado con éxito:", data.id)
}
