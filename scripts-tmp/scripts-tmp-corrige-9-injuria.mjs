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
  // vacuna cuádruple: opção truncada + "b);" sobrando no enunciado
  "60fc7d27-4f78-4db1-97dc-5355f2f4b5b3": {
    enunciado: "Hace 20 años atrás, las meningitis por Haemophilus influenzae eran las más frecuentemente observadas en pediatría. En la actualidad es muy rara su presentación. Esto se debe a:",
    opcoes: [
      "La reducción se debe a la vacuna anti-Hib, no a la prescripción de antibióticos.",
      "La vacuna triple DTP no incluye el componente anti-Hib, presente solo en la cuádruple.",
      "La vacuna H1N1 protege contra un subtipo de influenza, no Haemophilus influenzae.",
      "La vacuna antigripal protege contra influenza, distinta de Haemophilus influenzae b.",
      "La vacuna cuádruple bacteriana (difteria, tétanos, tos convulsa, Haemophilus influenzae tipo b)",
    ],
  },
  // opção corrompida (duas opções fundidas + explicação vazada) e comentários
  // trocados entre si (nenhum dizia "Correcto" na alternativa marcada certa)
  "93deec30-b93c-41ce-8c89-07d21cdffd0e": {
    opcoes: [
      "Exudado fibrinoso y organización del mismo",
      "Congestión activa, trasudado y focos de hemorragia aguda",
      "Congestión pasiva crónica con ingurgitación capilar y macrófagos cargados de hemosiderina (células de la insuficiencia cardíaca)",
      "Trasudado y células espumosas.",
    ],
    indice_correta: 2,
    opcoes_comentario: [
      "Incorrecto. El edema agudo de pulmón ocurre en ICC descompensada (congestión activa), no en todos los pacientes con ICC crónica. El hallazgo típico crónico es congestión pasiva.",
      "Incorrecto. La congestión ACTIVA con focos de hemorragia aguda es propia del edema agudo de pulmón (descompensación aguda), no del cuadro crónico establecido, que se caracteriza por congestión PASIVA.",
      "Correcto. En la insuficiencia cardíaca izquierda crónica, la congestión pasiva pulmonar prolongada produce ingurgitación capilar, trasudado alveolar y macrófagos cargados de hemosiderina ('células de la insuficiencia cardíaca'), que reflejan microhemorragias alveolares repetidas por la congestión sostenida.",
      "Incorrecto. No es correcta la combinación. La patología pulmonar en ICC es congestión pasiva crónica con macrófagos con hemosiderina.",
    ],
  },
  // opção [3] era na verdade um comentário vazado como se fosse alternativa;
  // comentários citavam valores de PA levemente diferentes dos das opções
  "959142b0-6321-455e-9bde-fe266cabb183": {
    opcoes: [
      "120/85 mmHg está dentro del rango de presión normal, sin cumplir los criterios diagnósticos de hipertensión arterial, que exigen valores iguales o superiores a 140 mmHg de sistólica o 90 mmHg de diastólica.",
      "155/80 mmHg",
      "135/85 mmHg corresponde a presión normal-alta o prehipertensión, sin alcanzar aún los valores de corte diagnósticos de hipertensión, que son 140/90 mmHg.",
    ],
    indice_correta: 1,
    opcoes_comentario: [
      "Incorrecto. 120/85 mmHg se considera presión normal, sin alcanzar los valores de corte diagnósticos de hipertensión arterial (≥140/90 mmHg).",
      "Correcto. Se diagnostica HTA con cifras ≥140/90 mmHg en consulta. 155/80 mmHg cumple criterio de HTA SISTÓLICA AISLADA (sistólica elevada con diastólica normal), una forma frecuente de HTA, sobre todo en adultos mayores.",
      "Incorrecto. 135/85 mmHg corresponde a presión normal-alta (prehipertensión), sin alcanzar los valores de corte diagnósticos de hipertensión arterial (140/90 mmHg).",
    ],
  },
  // opção fundida ("PECAM-1; c) ICAM-1") + indice_correta apontava pra
  // "ninguna es correcta" quando o próprio comentário dizia que E-selectina
  // era a resposta
  "abf454af-6645-4ac2-b140-4ba86de75fcd": {
    opcoes: ["PECAM-1", "ICAM-1", "L-selectina", "E-selectina"],
    indice_correta: 3,
    opcoes_comentario: [
      "Incorrecto. PECAM-1 (CD31) media la TRANSMIGRACIÓN (diapédesis) del leucocito a través del endotelio, una etapa posterior a la adhesión firme, no el rodamiento inicial.",
      "Incorrecto. ICAM-1 media la adhesión firme del leucocito al endotelio (uniéndose a integrinas como LFA-1), no el rodamiento. El rodamiento es mediado por selectinas.",
      "Incorrecto. La L-selectina interviene principalmente en el tránsito de linfocitos por las vénulas de endotelio alto del tejido linfoide; la selectina clásicamente asociada al rodamiento en el endotelio activado por la inflamación es la E-selectina.",
      "Correcto. El rodamiento leucocitario es favorecido por la E-selectina (expresada en endotelio activado). La E-selectina se une a ligandos sialilados en leucocitos, mediando el rodamiento de baja afinidad, necesario para la posterior adhesión firme.",
    ],
  },
  // opção fundida ("IL-1; e) INF-γ.") e opção C3b com comentário de outra
  // molécula (histamina) colado
  "c6bdfb6f-5840-4296-90cd-6322bc4353f6": {
    opcoes: ["Prostaglandinas", "TNF-α", "C3b", "Leucotrienos B4"],
    opcoes_comentario: [
      "Incorrecto. Las prostaglandinas son vasodilatadoras y moduladoras de la inflamación, pero no son quimiotácticas significativas.",
      "Incorrecto. El TNF-α activa endotelio y promueve adhesión, pero no es directamente quimiotáctico. Las quimiocinas y LTB4 son los principales factores quimiotácticos.",
      "Incorrecto. C3b es una OPSONINA que favorece la fagocitosis al unirse a receptores del fagocito; no es un mediador quimiotáctico. El fragmento del complemento con actividad quimiotáctica es el C5a.",
      "Correcto. Los leucotrienos B4 (LTB4) son potentes factores quimiotácticos producidos por neutrófilos y macrófagos. Atraen leucocitos al sitio de inflamación activando receptores BLT1.",
    ],
  },
  // opções eram na verdade comentários vazados ("Incorrecto, ya que...")
  // com a explicação inteira embutida no texto da alternativa
  "d8c27efa-47fe-449c-89c6-5b06258eebf9": {
    opcoes: [
      "El cambio adaptativo característico es la atrofia de las glándulas bronquiales submucosas, con ausencia de moco.",
      "El epitelio respiratorio cilíndrico ciliado pseudoestratificado con células caliciformes se transforma en un epitelio plano estratificado.",
      "El humo transforma el epitelio cilíndrico ciliado en un epitelio columnar simple.",
      "No existe una opción correcta entre las alternativas planteadas.",
    ],
    opcoes_comentario: [
      "Incorrecto. La atrofia glandular no es el cambio adaptativo característico. La metaplasia escamosa es la respuesta típica.",
      "Correcto. El humo del cigarrillo produce metaplasia escamosa del epitelio respiratorio: el epitelio pseudoestratificado cilíndrico ciliado normal es reemplazado por epitelio plano estratificado escamoso. Esto es una adaptación al estrés crónico.",
      "Incorrecto. El humo produce cambio a epitelio plano estratificado (metaplasia escamosa), no a epitelio columnar simple.",
      "Incorrecto. Sí existe una opción correcta: el cambio adaptativo típico es la metaplasia escamosa (opción B).",
    ],
  },
  // enunciado com fragmentos das 4 opções colados (mesma corrupção já vista
  // e corrigida em defesa/babd0e57)
  "df02c27f-c890-4256-8937-dea4b732f29d": {
    enunciado: "Con respecto a los virus de la gripe (Influenza A, B y C), marque la opción correcta:",
    opcoes: [
      "La memoria inmunológica desencadenada por la infección de estos virus no sirve contra infecciones futuras.",
      "El virus Influenza A presenta hemaglutininas y neuraminidasas insertas en su envoltura lipídica. Estas le permiten interactuar con las células del epitelio respiratorio.",
      "Las variaciones antigénicas son comunes en el virus Influenza tipo B, responsable de pandemias.",
      "El virus Influenza B es un virus únicamente humano y no experimenta cambios antigénicos mayores, aunque sí suficiente deriva antigénica como para que la cepa circulante pueda ser la causante de epidemias.",
    ],
  },
  // opção truncada + "en una gran cantidad de enfermedades);" sobrando no
  // enunciado (mesma corrupção já corrigida em defesa/11573375)
  "ed7c2188-5567-459c-ad04-de9200eb1bc4": {
    enunciado: "Un niño de 6 años se presenta con un cuadro de meningitis. A los efectos de tomar una decisión urgente se efectúa una coloración de Gram del LCR. Se observa leucocitos y diplococos Gram negativos capsulados. ¿Cuál es el probable agente causante?",
    opcoesIdx: { 4: "Neisseria meningitidis" },
  },
  // opção com citação de página de livro vazada ("R&C pag 139") e outra
  // truncada em "c)"; comentários pertenciam a outras alternativas
  "f4f4ac69-3c19-4910-95bc-bf0928e4a2ce": {
    opcoes: ["Infarto", "Apoptosis", "Necrosis licuefactiva"],
    indice_correta: 0,
    opcoes_comentario: [
      "Correcto. La necrosis isquémica secundaria a la interrupción brusca y completa del aporte arterial o del drenaje venoso de un tejido se denomina INFARTO. Cuando se sobreinfecta o afecta una extremidad con compromiso extenso, puede evolucionar clínicamente a gangrena.",
      "Incorrecto. La apoptosis es muerte celular PROGRAMADA (activa, regulada genéticamente), no la consecuencia de una interrupción brusca del aporte sanguíneo. La necrosis isquémica produce necrosis de coagulación (infarto), no apoptosis.",
      "Incorrecto. La necrosis licuefactiva es característica de la digestión enzimática de tejidos (por ejemplo, en abscesos o en el sistema nervioso central), no del patrón típico de la necrosis isquémica sistémica, que habitualmente es de tipo coagulativa (infarto).",
    ],
  },
}

for (const [id, fix] of Object.entries(FIXES)) {
  const patch = {}
  if (fix.enunciado) patch.enunciado = fix.enunciado
  if (fix.opcoes) patch.opcoes = fix.opcoes
  if (fix.opcoes_comentario) patch.opcoes_comentario = fix.opcoes_comentario
  if (fix.indice_correta !== undefined) patch.indice_correta = fix.indice_correta
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
