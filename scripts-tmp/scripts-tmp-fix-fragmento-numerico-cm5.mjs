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

// bug da poda: split de frases confundiu "100.000" (separador de milhar) com fim de frase,
// deixando um fragmento numérico órfão no meio da opção (ex: "...imatinib. 000/mm³) y no con...")
// corrigido cortando de volta na última frase limpa antes do fragmento.
const fixes = [
  { id: "052cd2ae-054e-4125-9cfb-8e126a1cfeb6", idx: 1, novo: "Leucemia Mieloide Crónica; frotis de sangre periférica en búsqueda de blastos; tratamiento con imatinib." },
  { id: "38f89d01-9196-44a9-9950-6a1b54fa98c8", idx: 3, novo: "Invasión directa de las meninges y el parénquima pulmonar por bacterias oportunistas Gram negativas formadoras de biofilm." },
  { id: "4a3b6f87-98ab-4224-81da-0785b3d03149", idx: 2, novo: "Trombocitopenia inducida por heparina tipo I; suspender la heparina y transfundir plaquetas de urgencia." },
]

for (const f of fixes) {
  const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", f.id).single()
  if (error) { console.error(f.id, error); continue }
  if (f.idx === q.indice_correta) { console.error("BLOQUEADO: correta", f.id); continue }
  const novasOpcoes = [...q.opcoes]
  novasOpcoes[f.idx] = f.novo
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", f.id)
  if (err2) { console.error("erro", f.id, err2); continue }
  console.log("corrigida:", f.id)
}
