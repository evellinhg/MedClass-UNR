// Aplica as correções da auditoria (RELATORIO-auditoria-caso1.md +
// hospital-simulacao-caso1-v5.json) ao Caso 1: aponta a fila do Supabase
// para o novo arquivo autocontido caso1-iamcest-v5.html (conteúdo corrigido
// + fixes de motor M-01 a M-09) e limpa a coluna 'conteudo' residual do modo
// React antigo, que a auditoria sinalizou como fonte de confusão futura.
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

const { data, error } = await supabase
  .from("hospital_simulacao_casos")
  .update({
    titulo: "Caso 1 - IAMCEST inferior con extensión a ventrículo derecho",
    arquivo_html: "/simuladores/caso1-iamcest-v5.html",
    conteudo: null,
  })
  .eq("id", "948c4bc5-3573-498c-916a-1ee4c9038021")
  .select()
  .single()

if (error) {
  console.error("Error al actualizar:", error.message)
  process.exit(1)
}

console.log("Caso 1 actualizado a v5:", JSON.stringify({ id: data.id, titulo: data.titulo, arquivo_html: data.arquivo_html, conteudo: data.conteudo }, null, 2))
