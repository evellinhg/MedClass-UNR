import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
const envFile = readFileSync(new URL(".env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/de118d2d-4b0f-4f0c-b610-5a21b3659ea4/scratchpad"
const all = JSON.parse(readFileSync(`${SCRATCH}/defesa_full.json`, "utf-8"))
const byId = Object.fromEntries(all.map(q => [q.id, q]))

// questões com >5 alternativas: mantém apenas os índices listados (na ordem
// dada), removendo distratores-combo redundantes. novoCorretoIdx = posição
// da resposta correta DENTRO da lista `manter`.
const TRIMS = {
  "39ae1c6d-d1b8-4618-bf10-c2025d9263ed": { manter: [0,1,2,3,4] }, // remove B+C
  "785d72a6-4a2c-43b8-a7ea-3cf32b50a88a": { manter: [0,1,2,5,7] }, // solo A/B/C, A+B(correta), Los5
  "00dc7e29-0fd8-496d-9fa4-17735bd96a05": { manter: [0,1,2,3,4] }, // remove A+D
  "0bacb17b-a52b-4f19-9d6a-ae9fc2cd99da": { manter: [0,1,2,3,5] }, // remove "A y C"
  "8ea9f6aa-ceae-4ae0-b46b-b6dd0b67caa1": { manter: [0,1,2,3,4] }, // remove A+B
  "f0dae133-d7b8-43fb-82e7-98ab7452170f": { manter: [0,1,2,3,4] }, // remove Todas/Ninguna
  "7ae3c89e-55bc-4d61-acff-14466b44053c": { manter: [0,1,2,3,5] }, // remove "todas correctas"
  "59f35743-83fc-42fd-9981-59bd5f955720": { manter: [0,1,2,3,4] }, // remove "A y B"
}

const results = []
for (const [id, { manter }] of Object.entries(TRIMS)) {
  const q = byId[id]
  const novasOpcoes = manter.map(i => q.opcoes[i])
  const novosComentarios = manter.map(i => q.opcoes_comentario[i])
  const novoCorretoIdx = manter.indexOf(q.indice_correta)
  if (novoCorretoIdx === -1) throw new Error(`Correta não está na lista mantida: ${id}`)
  const patch = { opcoes: novasOpcoes, opcoes_comentario: novosComentarios, indice_correta: novoCorretoIdx }
  const { data, error } = await supabase.from("questoes").update(patch).eq("id", id).select("id,enunciado,opcoes,indice_correta")
  if (error) { console.error("ERRO", id, error); results.push({ id, error: error.message }); continue }
  console.log("Trimmed:", id.slice(0,8), "->", data[0].opcoes.length, "opções, correta idx", data[0].indice_correta)
  results.push({ id, ok: true })
}

// 2 questões corrompidas (enunciado fusionado com fragmentos de outra
// pergunta / exercício de correlación mal transformado). Conteúdo
// reconstruído com precisão a partir dos próprios comentários originais
// (que já traziam o conteúdo correto, só desalinhado das opções extras).
const RECONSTRUCOES = {
  "33df3c8e-f2f5-4577-8583-ed94aa77595c": {
    enunciado: "Virus respiratorios: marque la afirmación correcta:",
    opcoes: [
      "Los virus Parainfluenza presentan un solo serotipo",
      "Los adenovirus no se pueden transmitir por vía fecal-oral",
      "La inmunidad natural que deja la infección por el virus del sarampión no protege durante toda la vida",
      "El virus Influenza causa epidemias estacionales y muta sus antígenos de superficie",
    ],
    indice_correta: 3,
    opcoes_comentario: [
      "Incorrecto. Los virus Parainfluenza presentan 4 serotipos (1, 2, 3, 4), no uno solo. Cada serotipo tiene diferentes características epidemiológicas y clínicas.",
      "Incorrecto. Los adenovirus SÍ se pueden transmitir por vía fecal-oral. De hecho, esa es una de las principales vías de transmisión, junto con la respiratoria. Causan infecciones gastrointestinales y respiratorias.",
      "Incorrecto. La inmunidad natural que deja la infección por el virus del sarampión SÍ protege durante toda la vida. El sarampión produce una inmunidad duradera y permanente, siendo uno de los virus más inmunogénicos.",
      "Correcto. El virus Influenza causa epidemias estacionales (anuales) y muta sus antígenos de superficie mediante deriva antigénica (antigenic drift: cambios menores) y cambio antigénico (antigenic shift: cambios mayores que pueden causar pandemias).",
    ],
  },
  "509a61c1-9f1d-4c26-8e40-d4483413276d": {
    enunciado: "¿Qué célula presenta granulaciones metacromáticas visibles en su citoplasma?",
    opcoes: ["Fibroblastos", "Plasmocitos", "Macrófagos", "Mastocitos"],
    indice_correta: 3,
    opcoes_comentario: [
      "Incorrecto. Los fibroblastos se caracterizan por su abundante retículo endoplasmático rugoso y la producción de tropocolágeno, no por granulaciones metacromáticas.",
      "Incorrecto. Los plasmocitos se caracterizan por su abundante RER y núcleo excéntrico con cromatina en 'rueda de carro', no por granulaciones metacromáticas.",
      "Incorrecto. Los macrófagos se caracterizan por la abundancia de lisosomas secundarios y vesículas endocíticas, no por granulaciones metacromáticas.",
      "Correcto. Los MASTOCITOS (células cebadas) poseen granulaciones metacromáticas en su citoplasma, visibles con colorantes como azul de toluidina. Contienen histamina, heparina y otras sustancias, y son células del tejido conectivo involucradas en alergia e inflamación.",
    ],
  },
}
for (const [id, patch] of Object.entries(RECONSTRUCOES)) {
  const { data, error } = await supabase.from("questoes").update(patch).eq("id", id).select("id,enunciado,opcoes,indice_correta")
  if (error) { console.error("ERRO", id, error); results.push({ id, error: error.message }); continue }
  console.log("Reconstruído:", id.slice(0,8), "->", data[0].enunciado.slice(0,50))
  results.push({ id, ok: true })
}

writeFileSync(`${SCRATCH}/defesa_trim_result.json`, JSON.stringify(results, null, 1))
console.log(`\nTotal: ${results.length}, OK: ${results.filter(r=>r.ok).length}, Erros: ${results.filter(r=>r.error).length}`)
