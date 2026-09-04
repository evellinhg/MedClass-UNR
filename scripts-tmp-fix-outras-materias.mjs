import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const FIXES = {
  // pergunta duplicada colada ("¿...? En relación a...?" duas interrogações)
  "2de0e517-631e-4208-8d28-3e73d5748144": {
    enunciado: "En relación a los músculos de la lengua, ¿cuál de las siguientes opciones es incorrecta?",
  },
  // parêntese de abertura faltando antes de "para el tercio medio)"
  "56bde7d1-2bfb-4cab-9f95-62665def6f57": {
    opcoesIdx: {
      1: "La vena hemorroidal superior, que llega a la vena mesentérica inferior, es la encargada del retorno venoso del tercio superior. Los dos tercios restantes (medio e inferior) no van hacia el sistema venoso porta, sino que la vena hemorroidal media (para el tercio medio) confluye en la vena ilíaca interna, y la vena hemorroidal inferior (para el tercio inferior) lleva la sangre hacia la vena pudenda interna, y esta hacia la vena ilíaca interna.",
    },
  },
  // fragmento "a) Se reduce de tamaño" (texto da própria opção A) vazado no
  // final do enunciado, além de espaço duplo
  "aef512c0-4b3d-455a-b603-cf5acad451a8": {
    enunciado: "¿Qué sucede con el útero después de la menarca?",
  },
}

for (const [id, fix] of Object.entries(FIXES)) {
  const patch = {}
  if (fix.enunciado) patch.enunciado = fix.enunciado
  if (fix.opcoesIdx) {
    const { data: cur } = await supabase.from("questoes").select("opcoes").eq("id", id).single()
    const opcoes = [...cur.opcoes]
    for (const [idx, txt] of Object.entries(fix.opcoesIdx)) opcoes[idx] = txt
    patch.opcoes = opcoes
  }
  const { error } = await supabase.from("questoes").update(patch).eq("id", id)
  if (error) { console.error("ERRO", id, error); continue }
  console.log("OK:", id.slice(0,8))
}
