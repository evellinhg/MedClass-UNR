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

const FIXES = {
  // sobrou "en una gran cantidad de enfermedades);" colado no fim do enunciado
  "11573375-ce17-41f8-a8c0-308801ab78bd": {
    enunciado: "Un niño de 6 años se presenta con un cuadro de meningitis. A los efectos de tomar una decisión urgente se efectúa una coloración de Gram del LCR. Se observa leucocitos y diplococos Gram negativos capsulados. ¿Cuál es el probable agente causante?",
  },
  // sobrou "b);" colado no fim do enunciado
  "19b3c47a-02cc-4e00-a50e-5d2b48413cd0": {
    enunciado: "Hace 20 años atrás, las meningitis por Haemophilus influenzae eran las más frecuentemente observadas en pediatría. En la actualidad es muy rara su presentación. Esto se debe a:",
  },
  // opção [1] truncada em reticências, com comentário vazio
  "2529c433-36ec-46d3-bcc3-1deea7f4215a": {
    opcoesIdx: {
      1: "No, no se puede. El foco primario de Ghon existe solo en la tuberculosis pulmonar.",
    },
    comentarioIdx: {
      1: "Incorrecto. El foco primario de Ghon SÍ puede presentarse fuera del pulmón: en la tuberculosis intestinal (por ingestión de M. bovis en leche no pasteurizada) se forma un complejo primario intestinal, análogo al pulmonar, con foco en la mucosa intestinal y compromiso ganglionar mesentérico.",
    },
  },
  // enunciado com fragmentos das 4 opções colados e separados por ";"; cada
  // opção ficou cortada no meio da frase. Reconstruído religando cada
  // fragmento à opção correspondente (o conteúdo bate perfeitamente com os
  // comentários já existentes).
  "babd0e57-57b6-46a7-8ad0-02b02272d699": {
    enunciado: "Con respecto a los virus de la gripe (Influenza A, B y C), marque la opción correcta:",
    opcoesIdx: {
      0: "Las variaciones antigénicas son comunes en el virus Influenza tipo B, responsable de pandemias",
      1: "El virus Influenza A presenta hemaglutininas y neuraminidasas insertas en su envoltura lipídica. Estas le permiten interactuar con las células del epitelio respiratorio",
      2: "El virus Influenza B es un virus únicamente humano y no experimenta cambios antigénicos mayores, aunque sí suficiente deriva antigénica como para que la cepa circulante pueda ser la causante de epidemias",
      3: "La memoria inmunológica desencadenada por la infección de estos virus no sirve contra infecciones futuras",
    },
  },
}

for (const [id, fix] of Object.entries(FIXES)) {
  const { data: cur, error: e1 } = await supabase.from("questoes").select("opcoes,opcoes_comentario").eq("id", id).single()
  if (e1) { console.error(e1); continue }
  const patch = {}
  if (fix.enunciado) patch.enunciado = fix.enunciado
  if (fix.opcoesIdx) {
    const opcoes = [...cur.opcoes]
    for (const [idx, txt] of Object.entries(fix.opcoesIdx)) opcoes[idx] = txt
    patch.opcoes = opcoes
  }
  if (fix.comentarioIdx) {
    const com = [...cur.opcoes_comentario]
    for (const [idx, txt] of Object.entries(fix.comentarioIdx)) com[idx] = txt
    patch.opcoes_comentario = com
  }
  const { error: e2 } = await supabase.from("questoes").update(patch).eq("id", id)
  if (e2) { console.error("ERRO", id, e2); continue }
  console.log("OK:", id.slice(0,8))
}
