import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 1) Eliminar la fila del Caso 2 anterior (SCACEST inferior + VD con hemodinamia)
const { data: anterior, error: errBusca } = await supabase
  .from("hospital_simulacao_casos")
  .select("id, titulo, arquivo_html")
  .eq("arquivo_html", "/simuladores/caso2-iamcest-inferior-vd.html")
  .maybeSingle()

if (errBusca) { console.error("Error buscando Caso 2 anterior:", errBusca.message); process.exit(1) }

if (anterior) {
  const { error: errDelete } = await supabase
    .from("hospital_simulacao_casos")
    .delete()
    .eq("id", anterior.id)
  if (errDelete) { console.error("Error eliminando Caso 2 anterior:", errDelete.message); process.exit(1) }
  console.log("Caso 2 anterior eliminado:", anterior.id, "-", anterior.titulo)
} else {
  console.log("No se encontró fila del Caso 2 anterior (ya estaba eliminada).")
}

// 2) Insertar el nuevo contenido como Caso 2
const { data, error } = await supabase
  .from("hospital_simulacao_casos")
  .insert({
    titulo: "Caso 2",
    descricao: null,
    arquivo_html: "/simuladores/caso2-shock-mixto-v2.html",
    tipo: "iframe",
    ordem: 2,
    ativo: true,
  })
  .select()
  .single()

if (error) { console.error("Error al insertar el nuevo Caso 2:", error.message); process.exit(1) }
console.log("Nuevo Caso 2 insertado con éxito:", data.id)
