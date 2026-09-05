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

// segunda leva de truncamentos não capturados pela heurística de palavra incompleta:
// fragmentos residuais de palavra cortada no meio (ex: "La calcit.", "El exoftalmos.")
// todos são opções erradas (nunca a correta), corrigidos cortando de volta na última frase completa.
const fixes = [
  { id: "0740b600-cc14-4c62-b862-825e7a435964", idx: 3, novo: "La lipooxigenasa-5 (5-LOX)." },
  { id: "1f86900f-0c2f-4eca-bbfb-74a135a5d6a3", idx: 0, novo: "Polimialgia Reumática del anciano." },
  { id: "1f86900f-0c2f-4eca-bbfb-74a135a5d6a3", idx: 3, novo: "Artritis Reumatoidea activa." },
  { id: "2b25de4a-f5c4-44ae-9cd5-deddf03b908f", idx: 0, novo: "Criterios de Jones." },
  { id: "2b25de4a-f5c4-44ae-9cd5-deddf03b908f", idx: 1, novo: "Criterios de Centor." },
  { id: "2dd09e57-f8de-40d5-9a14-2fd9e58e67f6", idx: 1, novo: "Infiltración medular por células de Reed-Sternberg rodeadas de linfocitos T reactivos." },
  { id: "4cf8f5e2-da41-4a99-87bc-31cf512640c8", idx: 3, novo: "La presión arterial sistólica caerá de forma inmediata por debajo de 60 mmHg con pérdida de pulsos distales palpables." },
  { id: "5c8f8ed3-5a27-4a3a-b8ac-49f72d64a631", idx: 0, novo: "Fibromialgia." },
  { id: "5c8f8ed3-5a27-4a3a-b8ac-49f72d64a631", idx: 3, novo: "Polimiositis." },
  { id: "62865358-ac8b-4031-9463-f650d9644c1c", idx: 3, novo: "Acromegalia." },
  { id: "934ea709-1e2c-4a2c-9ec7-27c9561c986b", idx: 0, novo: "Calcitonina." },
  { id: "934ea709-1e2c-4a2c-9ec7-27c9561c986b", idx: 1, novo: "Aldosterona." },
  { id: "934ea709-1e2c-4a2c-9ec7-27c9561c986b", idx: 2, novo: "Tiroxina." },
  { id: "a83de7f9-f14d-401c-ab2a-eee1e408fb10", idx: 0, novo: "Taquicardia sinusal." },
  { id: "a83de7f9-f14d-401c-ab2a-eee1e408fb10", idx: 1, novo: "Exoftalmos." },
  { id: "a83de7f9-f14d-401c-ab2a-eee1e408fb10", idx: 3, novo: "Bocio palpable." },
]

const byQuestion = {}
for (const f of fixes) {
  byQuestion[f.id] = byQuestion[f.id] || []
  byQuestion[f.id].push(f)
}

for (const [id, fs2] of Object.entries(byQuestion)) {
  const { data: q, error } = await supabase.from("questoes").select("opcoes,indice_correta").eq("id", id).single()
  if (error) { console.error(id, error); continue }
  const novasOpcoes = [...q.opcoes]
  for (const f of fs2) {
    if (f.idx === q.indice_correta) { console.error("BLOQUEADO: tentativa de editar a correta", id, f.idx); continue }
    novasOpcoes[f.idx] = f.novo
  }
  const { error: err2 } = await supabase.from("questoes").update({ opcoes: novasOpcoes }).eq("id", id)
  if (err2) { console.error("erro update", id, err2); continue }
  console.log("corrigida:", id)
}
