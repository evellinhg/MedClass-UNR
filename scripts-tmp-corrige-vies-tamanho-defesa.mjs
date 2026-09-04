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

// das 47 questões com resposta correta desproporcionalmente mais longa, só
// ~13 têm o padrão real de viés (resposta certa em parágrafo elaborado vs.
// distratoras rasas tipo giveaway); as demais são perguntas de resposta
// curta legítima (nome de bactéria/fármaco/diagnóstico) e não foram tocadas.
// Cada patch só edita o índice de alternativa indicado, sem mexer no
// indice_correta nem no restante da pergunta.
const PATCHES = {
  "3002da0d-7f84-45c3-b8c4-63acbc45e74a": {
    0: "Los pulmones enfisematosos son voluminosos, de aspecto pálido y con escasa cantidad de sangre en la superficie de corte.",
    1: "Los límites (bordes) del pulmón enfisematoso adoptan una morfología redondeada por el aumento de volumen pulmonar.",
    2: "En los casos avanzados de enfisema se observan bullas y vesículas subpleurales de gran tamaño.",
  },
  "0754cda6-5a16-4422-8b4b-d15744d650d8": {
    0: "Los pulmones enfisematosos son voluminosos, de aspecto pálido y con escasa cantidad de sangre en la superficie de corte.",
    1: "Los límites (bordes) del pulmón enfisematoso adoptan una morfología redondeada por el aumento de volumen pulmonar.",
    2: "En los casos avanzados de enfisema se observan bullas y vesículas subpleurales de gran tamaño.",
  },
  "a9a5db53-75a0-4754-89ae-324a091ea21c": {
    0: "Las infecciones virales simples del tracto respiratorio superior.",
    2: "La infección por Mycoplasma pneumoniae (neumonía atípica).",
  },
  "f55dced5-6bd8-4794-b950-2e2715281d64": {
    0: "Las virosis del tracto respiratorio superior.",
    1: "La infección por Mycoplasma pneumoniae (neumonía atípica).",
    3: "La bacteriemia con diseminación hematógena.",
  },
  "5f2f8882-3c84-4beb-a5e2-d5a9077f0b83": {
    2: "Pienso que se trata de una gastroenteritis aguda inespecífica.",
    3: "Debería preguntarle por la fecha de última menstruación (FUM), presencia de ginecorragia u otra sintomatología ginecológica antes de decidir la conducta.",
  },
  "6a6fdb04-5c52-4122-bdee-d3192b0a0236": {
    0: "Dilatación anormal excesiva de los bronquios y bronquiolos, de carácter reversible y sin daño estructural permanente de la pared.",
    1: "Dilatación anormal de los bronquios y bronquiolos (mayor de 2mm) secundaria a debilidad transitoria de la pared, que se resuelve espontáneamente.",
  },
  "44ba1d16-175d-4465-b7de-02a21b631162": {
    2: "Endocarditis infecciosa",
  },
  "cf1c1533-d4b6-4ec5-8aa3-68cfcc46ffeb": {
    2: "Solo los procesos respiratorios altos (faringe, laringe) pueden producir tos, nunca los procesos de la vía aérea baja.",
    3: "No son causa de tos crónica el goteo post-nasal ni los fármacos IECA (inhibidores de la enzima convertidora de angiotensina).",
  },
  "596458c8-87e5-4d6a-b647-1fc215409890": {
    0: "Hepatocitos en vidrio esmerilado (ground-glass)",
    2: "Portitis (infiltrado inflamatorio portal)",
  },
  "5442c5a2-ccc5-4dfd-b857-5e9c54d5ece4": {
    0: "En la fase uno de la etapa clínica del desarrollo de fármacos participan pacientes con la enfermedad de interés.",
    2: "Los estudios de casos y controles parten de la enfermedad o efecto adverso, y a partir de ahí estudian la exposición previa a diferentes factores.",
  },
  "cdf70367-455a-440a-a4a4-497cfae02b1a": {
    0: "El componente C5a del sistema de complemento ejerce actividad opsonizante sobre los microorganismos.",
    1: "El componente C3b media principalmente una actividad quimiotáctica sobre los leucocitos.",
    2: "El componente C5a es reconocido específicamente por receptores de reconocimiento de patrones (RRP).",
  },
  "3e634a9a-3485-4eeb-9918-91c37d67d7b2": {
    0: "Hiperdensidad parenquimatosa focal en la sustancia cerebral.",
    1: "Lesión focal hipodensa en el parénquima cerebral.",
    3: "Mayor profundidad y amplitud de los surcos corticales cerebrales.",
  },
  "91b3c13a-f4dd-4827-a253-ad5fc5712c45": {
    1: "Producir interferón gamma (IFN-γ) de forma sostenida.",
    2: "Dejar de producir citoquinas inmunosupresoras como IL-10 y TGF-beta.",
  },
  "c05fd526-a164-4e29-a61c-55d9c232145a": {
    0: "Cinetosis (mareo por movimiento).",
    1: "Fármacos agonistas dopaminérgicos D2, como la Levodopa.",
    2: "Quimioterapia antitumoral emetogénica.",
    3: "Morfina (analgésico opioide).",
  },
}

const results = []
for (const [id, edits] of Object.entries(PATCHES)) {
  const { data: cur, error: e1 } = await supabase.from("questoes").select("opcoes").eq("id", id).single()
  if (e1) { console.error(e1); continue }
  const opcoes = [...cur.opcoes]
  for (const [idx, texto] of Object.entries(edits)) opcoes[idx] = texto
  const { error: e2 } = await supabase.from("questoes").update({ opcoes }).eq("id", id)
  if (e2) { console.error("ERRO", id, e2); results.push({ id, error: e2.message }); continue }
  console.log("OK:", id.slice(0,8), "- editados índices", Object.keys(edits).join(","))
  results.push({ id, ok: true })
}
writeFileSync(`${SCRATCH}/defesa_vies_tamanho_result.json`, JSON.stringify(results, null, 1))
console.log(`\nTotal: ${results.length}, OK: ${results.filter(r=>r.ok).length}`)
