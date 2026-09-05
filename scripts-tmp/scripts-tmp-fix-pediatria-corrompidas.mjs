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

const fixes = [
  {
    id: "0b82a5a2-badb-4085-a970-2704cb05e6c0",
    enunciado:
      "La desnutrición oculta por deficiencia silenciosa de Zinc es una entidad frecuente en pediatría que puede pasar desapercibida en niños con dietas restrictivas. Desde el punto de vista clínico, ¿cuáles son las principales manifestaciones de la deficiencia de zinc sobre el crecimiento y desarrollo del niño?",
    opcaoIdx: 2,
    opcao:
      "Retraso en el crecimiento y desarrollo pondoestatural, con lesiones cutáneas periorificiales y acrales (acrodermatitis), diarrea crónica y alteración de la inmunidad celular (linfocitos T).",
    feedback:
      "Correcto. El zinc es un metal de transición esencial como cofactor de múltiples enzimas implicadas en la síntesis proteica y la división celular, procesos de rápido recambio como la piel y el sistema inmune. Su deficiencia se manifiesta con retraso del crecimiento, lesiones cutáneas periorificiales y acrales (características de la acrodermatitis enteropática en la deficiencia severa), diarrea crónica y alteración de la inmunidad celular (linfocitos T), con mayor susceptibilidad a infecciones.",
    disciplina_base: "fisiologia",
  },
  {
    id: "1212f212-804e-4a92-8645-f6fa8b868c26",
    enunciado:
      "Usted atiende en la consulta de control a un niño de 6 años de edad que presenta un estancamiento de su velocidad de crecimiento en los últimos 18 meses; su curva de crecimiento se ha desacelerado notablemente, con una velocidad actual de solo 1.5 cm/año. Al examen físico, usted constata piel seca, constipación y lentitud psicomotriz. ¿Cuál es la sospecha diagnóstica y el estudio complementario inicial a solicitar?",
    opcaoIdx: 1,
    opcao:
      "Hipotiroidismo adquirido (tiroiditis autoinmune); se debe solicitar de forma inicial dosaje de TSH (Hormona Estimulante de la Tiroides) y T4 libre en suero periférico.",
    feedback:
      "Correcto. Una velocidad de crecimiento inferior a 4 cm/año en un niño de 6 años (etapa escolar) es patológica y obliga a descartar organicidad, frecuentemente secundaria a hipotiroidismo adquirido, una de las causas endocrinológicas más frecuentes de retraso del crecimiento en la infancia. Los signos acompañantes (piel seca, constipación y lentitud psicomotriz) refuerzan esta sospecha, por lo que se solicita en primer lugar el dosaje de TSH y T4 libre.",
    disciplina_base: "patologia",
  },
  {
    id: "1916e213-7b32-4c20-82fd-e1685645daae",
    enunciado:
      "En el seguimiento del niño con sospecha de patología del crecimiento, la determinación de la edad ósea es una herramienta complementaria fundamental. ¿Cuál es el estudio de elección para estimarla y qué método se utiliza para su interpretación?",
    opcaoIdx: 2,
    opcao:
      "Radiografía simple de mano y muñeca izquierda de frente; se compara la maduración de los núcleos de osificación con un atlas estandarizado (ej. Greulich y Pyle) para estimar el grado de maduración ósea y su concordancia con la edad cronológica del niño.",
    feedback:
      "Correcto. La radiografía simple de mano y muñeca izquierda de frente es el estudio de elección porque no implica dosis significativas de radiación y permite, de forma sencilla y reproducible, determinar la edad ósea en pediatría. Los núcleos de osificación y los cartílagos de crecimiento visibles en esta única placa permiten comparar la maduración ósea del niño con un atlas de referencia estandarizado (Greulich y Pyle), estableciendo la edad ósea y su concordancia (o discordancia) con la edad cronológica.",
    disciplina_base: "fisiologia",
  },
  {
    id: "212133ab-8979-495e-b77a-43169b8f37bd",
    // enunciado já estava íntegro; só a opção A e o feedback foram corrigidos.
    opcaoIdx: 0,
    feedback:
      "Correcto. La SAP establece criterios definidos para evaluar el crecimiento lineal. La 'Talla Baja' es una foto instantánea en el tiempo: un niño cuya estatura, medida con precisión, se encuentra por debajo del percentilo 3 o de -2 DE respecto a la media poblacional para su edad y sexo. Por el contrario, el 'Retraso del Crecimiento' requiere el seguimiento longitudinal del niño mediante mediciones seriadas separadas por un lapso mínimo de 4 a 6 meses, para determinar que crece a una velocidad (cm/año) menor a la esperada o cruza percentilos hacia abajo, lo que constituye un signo de alarma.",
    disciplina_base: "fisiologia",
  },
  {
    id: "357874f2-67ff-49cd-9bff-985f75bcfab9",
    enunciado:
      "Usted atiende en la consulta a un lactante de 4 meses con diagnóstico de Alergia a la Proteína de Leche de Vaca (APLV) no IgE mediada, en dieta de exclusión estricta realizada de forma correcta por la familia. Los síntomas digestivos y cutáneos del lactante han remitido por completo. Para continuar el seguimiento de acuerdo con las pautas de la SAP, ¿cuál es el paso siguiente recomendado?",
    opcaoIdx: 1,
    opcao:
      "Realizar la Prueba de Provocación Oral (PPO), reintroduciendo cantidades crecientes de leche al niño de forma progresiva, bajo supervisión médica estricta del equipo de salud.",
    feedback:
      "Correcto. El paso siguiente en el seguimiento de la APLV, una vez lograda la remisión clínica con la dieta de exclusión, es la Prueba de Provocación Oral (PPO). Se ofrecen cantidades crecientes de leche al lactante bajo supervisión médica estricta, dado el riesgo de reacción (incluso anafiláctica); si tolera la reintroducción se considera adquirida la tolerancia, y si reaparecen síntomas se confirma la persistencia de la alergia, manteniéndose la dieta de exclusión por un período adicional antes de reintentar.",
    disciplina_base: null,
  },
  {
    id: "5da66910-7500-487b-92da-5de30ed44d02",
    enunciado:
      "En la evaluación de los síndromes de malabsorción en pediatría, el 'Test de Xilosa' ha sido una herramienta útil para evaluar la integridad de la mucosa del intestino delgado. ¿Cuál es el fundamento de esta prueba y cómo se interpreta su resultado ante la sospecha de malabsorción?",
    opcaoIdx: 1,
    opcao:
      "La D-xilosa es un monosacárido de absorción pasiva a nivel del yeyuno proximal, que no requiere digestión enzimática previa; en entidades que cursan con atrofia vellositaria, la absorción de xilosa se encuentra disminuida, reflejándose en determinaciones bajas en sangre y en orina.",
    feedback:
      "Correcto. El Test de la D-xilosa valora de forma funcional la integridad de la superficie absortiva del intestino delgado proximal. Al ser un monosacárido que se absorbe de forma pasiva, sin requerir digestión enzimática previa, su absorción refleja directamente el estado de la mucosa intestinal. En entidades que cursan con atrofia vellositaria (como la enfermedad celíaca o la giardiasis masiva), los niveles de xilosa en sangre y orina se encuentran disminuidos, reflejando la pérdida de superficie absortiva -- por eso se utiliza en el estudio de los síndromes de malabsorción.",
    disciplina_base: "fisiologia",
  },
  {
    id: "a973562d-ae0a-473b-8193-72d843536c0f",
    enunciado:
      "Usted controla a Alma, de 7 años de edad. Al realizar el examen físico y las mediciones antropométricas, constata que su Talla se encuentra en el percentilo 2.5 (Z-score de -2.1 DE). Su velocidad de crecimiento en el último año ha sido de 5.5 cm/año (completamente normal para su edad). Al interrogar sobre los antecedentes familiares, constata que la talla materna es de 1.50 m y la del padre 1.58 m. Al solicitar una radiografía de edad ósea, esta es coincidente con su edad cronológica (7 años). ¿Cuál es el diagnóstico clínico más probable y la conducta recomendada?",
    opcaoIdx: 1,
    opcao:
      "Talla Baja Familiar; es una variante normal del crecimiento, donde la niña presenta una velocidad de crecimiento normal, edad ósea acorde a la cronológica, y su talla proyectada es concordante con su talla blanco genético (calculada a partir de la talla de ambos progenitores).",
    feedback:
      "Correcto. La Talla Baja Familiar es la causa más común de baja estatura, con una talla acorde al blanco genético calculado a partir de la talla de ambos padres (madre 1,50 m y padre 1,58 m, ambos de talla baja). En esta entidad, la velocidad de crecimiento es normal para la edad y la edad ósea coincide con la edad cronológica. Una velocidad de crecimiento normal (entre 5 y 6 cm/año) es el dato clave que descarta patología orgánica, por lo que no se requieren estudios adicionales, solo seguimiento antropométrico periódico.",
    disciplina_base: "fisiologia",
  },
  {
    id: "abfa323c-9c92-46d4-9b9a-b544194a84f6",
    enunciado:
      "Un niño de 13 años es derivado al centro de salud por baja talla. Su talla actual está por debajo del percentilo 3. Su velocidad de crecimiento es levemente disminuida para su edad (4.8 cm/año). Al examen físico se encuentra en estadio prepuberal, sin caracteres sexuales secundarios desarrollados. La radiografía de edad ósea muestra un retraso respecto a la edad cronológica (atraso de 2.5 años). El padre refiere haber tenido su desarrollo puberal tardío, con estirón de crecimiento e inicio de caracteres sexuales recién a los 16 años. ¿Cuál es el diagnóstico más probable y la conducta a seguir?",
    opcaoIdx: 1,
    opcao:
      "Retraso Constitucional del Crecimiento y de la Pubertad (o 'madurador lento'); se trata de una variante normal del desarrollo, frecuente en varones con antecedente familiar similar, con manejo expectante y seguimiento clínico y antropométrico periódico, ya que el niño alcanzará su talla final y desarrollo puberal completo de forma más tardía que sus pares.",
    feedback:
      "Correcto. El Retraso Constitucional del Crecimiento y de la Pubertad (RCCP) o 'madurador lento' es otra de las variantes normales del crecimiento, la causa más frecuente de retraso puberal y talla baja en varones. Clínicamente, el niño crece lento pero a una velocidad sostenida, llegando a una edad donde sus pares ya iniciaron la pubertad. El retraso de la edad ósea (mayor a 2 años) respecto a la cronológica, pero concordante con la talla, junto con el antecedente familiar de pubertad tardía (que se repite con frecuencia entre padres e hijos), orienta al diagnóstico. El manejo es expectante, con seguimiento periódico, ya que el niño alcanzará su talla final y desarrollo puberal completo, solo que de forma más tardía que sus pares.",
    disciplina_base: "fisiologia",
  },
  {
    id: "eb1f4e4d-9912-4e4f-ad98-13a5bf45d062",
    enunciado:
      "Una vez confirmado el diagnóstico de Enfermedad Celíaca mediante serología positiva (anticuerpos antitransglutaminasa) y biopsia intestinal que evidencia atrofia vellositaria en un niño de 2 años, ¿cuál es el tratamiento recomendado según las guías de la SAP?",
    opcaoIdx: 1,
    opcao:
      "Dieta de exclusión estricta y permanente de todo alimento que contenga trigo, avena, cebada y centeno (TACC), reemplazándolos por alimentos naturalmente libres de gluten (sin TACC).",
    feedback:
      "Correcto. El único tratamiento eficaz demostrado para la Enfermedad Celíaca es la dieta de exclusión estricta y permanente de gluten (gliadina en el trigo, hordeína en la cebada, secalina en el centeno y avenina en la avena), de por vida, sin excepciones. La dieta libre de gluten (DLG) debe ser supervisada por un equipo multidisciplinario (nutricionista, pediatra) y permite la normalización clínica y de la mucosa intestinal, así como la recuperación del crecimiento (catch-up) y la mejoría de los parámetros nutricionales.",
    disciplina_base: null,
  },
  {
    id: "ec2380b5-1034-4edb-bf45-a4e2a49d15b8",
    enunciado:
      "La enfermedad celíaca puede presentarse de forma atípica en la infancia y adolescencia, manifestándose con formas extradigestivas como anemia y defectos del esmalte dentario, entre otras. ¿Cuál de las siguientes opciones describe correctamente cómo se manifiesta esta entidad en la niñez?",
    opcaoIdx: 2,
    opcao:
      "Baja estatura aislada refractaria al tratamiento (estancamiento del crecimiento), asociada a anemia ferropénica de causa no aclarada y/o defectos del esmalte dentario, que pueden ser las únicas manifestaciones de la enfermedad en su forma atípica.",
    feedback:
      "Correcto. La enfermedad celíaca atípica (o no clásica) es la forma de presentación más frecuente en la etapa escolar y debe sospecharse activamente ante hallazgos como anemia ferropénica refractaria al tratamiento con hierro oral, baja talla o estancamiento del crecimiento sin causa aclarada, y defectos del esmalte dentario. Ante estos signos se debe buscar dirigidamente mediante serología (antitransglutaminasa IgA) y confirmación con biopsia intestinal. La ausencia de síntomas digestivos francos (como diarrea) no descarta el diagnóstico, ya que estas formas atípicas son igualmente frecuentes y no deben subestimarse.",
    disciplina_base: "patologia",
  },
]

const resultados = []
for (const fix of fixes) {
  const { data: atual, error: errLeitura } = await supabase
    .from("questoes")
    .select("enunciado, opcoes, opcoes_comentario, disciplina_base")
    .eq("id", fix.id)
    .single()
  if (errLeitura) {
    console.error(fix.id, "erro ao ler:", errLeitura.message)
    continue
  }

  const opcoes = [...atual.opcoes]
  const opcoes_comentario = [...atual.opcoes_comentario]
  if (fix.opcao) opcoes[fix.opcaoIdx] = fix.opcao
  opcoes_comentario[fix.opcaoIdx] = fix.feedback

  const payload = { opcoes, opcoes_comentario, disciplina_base: fix.disciplina_base }
  if (fix.enunciado) payload.enunciado = fix.enunciado

  const { error: errUpdate } = await supabase.from("questoes").update(payload).eq("id", fix.id)
  if (errUpdate) {
    console.error(fix.id, "erro ao atualizar:", errUpdate.message)
    continue
  }
  resultados.push(fix.id)
}

console.log(`Corrigidas ${resultados.length}/${fixes.length} questoes.`)
