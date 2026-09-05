import { createClient } from "@supabase/supabase-js"
import { readFileSync, writeFileSync } from "fs"
const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
const env = Object.fromEntries(
  envFile.split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => {
    const i = l.indexOf("=")
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = "/private/tmp/claude-502/-Users-Evelllin-Desktop-MedClass-UNR/73e6c3a9-25d3-4e28-969b-da3fc967d2a6/scratchpad"

// 18 questões (injuria) detectadas por scripts-tmp-export-feedback-desalinhado.mjs
// como tendo opcoes_comentario sem nenhuma palavra em comum com o enunciado.
// Investigação revelou uma corrupção em cadeia: o comentário de uma pergunta
// pertencia de fato a outra (ex: c0e4b4fb -> 03dde49e -> 5838d2e3). Conteúdo
// recuperado da cadeia onde foi possível confirmar; reescrito do zero quando
// nenhuma fonte foi encontrada. Em 10 dos 18 casos o indice_correta (e em 3
// deles também o enunciado/opcoes) estava igualmente errado -- corrigido com
// base em conhecimento médico, não apenas reordenado.
const FIXES = {
  "03dde49e-2f61-4b32-af7c-a52843ea87c9": {
    opcoes_comentario: [
      "Incorrecto. La vena cava superior y la aurícula izquierda no forman el borde izquierdo. La vena cava superior está a la derecha y la aurícula izquierda es central, no forma el borde.",
      "Correcto. El contorno radiológico del mediastino izquierdo en la Rx frontal está constituido (de arriba abajo) por: ARTERIA SUBCLAVIA IZQUIERDA, CAYADO AÓRTICO, TRONCO DE LA PULMONAR y VENTRÍCULO IZQUIERDO. Estas estructuras forman el borde izquierdo del mediastino.",
      "Incorrecto. El tronco arterial braquiocefálico, la arteria pulmonar derecha y el ventrículo derecho son estructuras del mediastino derecho o central, no del borde izquierdo.",
      "Incorrecto. La arteria carótida interna y el ventrículo derecho no forman parte del borde mediastínico IZQUIERDO. El borde derecho incluye vena cava superior, aurícula derecha y vena cava inferior.",
    ],
  },
  "c0e4b4fb-fbf3-459c-877b-dee39e2adfea": {
    opcoes_comentario: [
      "Correcto. Las QUIMIOCINAS son citocinas quimiotácticas que inducen específicamente el desplazamiento dirigido (quimiotaxis) de los leucocitos polimorfonucleares desde la luz vascular hacia el foco inflamatorio, guiando su migración a través del endotelio y el tejido intersticial.",
      "Incorrecto. La histamina, liberada por mastocitos y basófilos, produce vasodilatación y aumento de la permeabilidad vascular, pero no es el principal mediador quimiotáctico de los leucocitos.",
      "Incorrecto. Las prostaglandinas participan en la vasodilatación, el dolor y la fiebre durante la inflamación, pero no son las responsables de la quimiotaxis leucocitaria.",
      "Incorrecto. La bradicinina produce dolor, vasodilatación y aumento de la permeabilidad vascular, pero no actúa como mediador quimiotáctico para los polimorfonucleares.",
    ],
  },
  "5838d2e3-f72f-4d6d-a086-ba028f6839f8": {
    opcoes: ["Radiologia", "Resonancia", "Tomografia", "Ultrasonido"],
    indice_correta: 3,
    opcoes_comentario: [
      "Incorrecto. La radiología simple no es adecuada para evaluar ganglios cervicales, ya que los ganglios tienen densidad de partes blandas y no se diferencian bien del resto de los tejidos cervicales.",
      "Incorrecto. La resonancia magnética (RM) es útil para ciertas indicaciones específicas pero no es el método inicial para ganglios cervicales por su alto costo y menor disponibilidad. El ultrasonido es el primer paso.",
      "Incorrecto. La tomografía computarizada (TC) es útil pero no es el método de primera línea por su mayor radiación y costo. El ultrasonido es la evaluación inicial recomendada.",
      "Correcto. El ULTRASONIDO (ecografía) es el método de elección para la evaluación inicial de los ganglios cervicales. Es no invasivo, no utiliza radiación ionizante, permite evaluar tamaño, morfología, vascularización y diferenciar ganglios reactivos de patológicos.",
    ],
  },
  "b47b2df5-4fa8-4d7a-a14c-56c3f54e36f1": {
    indice_correta: 3,
    opcoes_comentario: [
      "Incorrecto. Si bien la posición PA es correcta (reduce magnificación cardíaca), la distancia de 1 m es insuficiente. La distancia óptima para minimizar la deformidad es de 1,80 m (180 cm) en PA.",
      "Incorrecto. La distancia de 1,80 m es correcta, pero la posición AP NO es la adecuada. La posición PA es la que reduce la deformidad de las estructuras anteriores (corazón).",
      "Incorrecto. La distancia de 1 m (100 cm) es menor y produce mayor magnificación. La posición AP también magnifica más las estructuras anteriores. La combinación de 1 m AP produce la mayor deformidad.",
      "Correcto. Para disminuir la DEFORMIDAD GEOMÉTRICA (magnificación) en radiografía, se utiliza una DISTANCIA TUBO-PLACA DE 1,80 m y POSICIÓN PA (posteroanterior). A mayor distancia, menor magnificación. La posición PA aleja el corazón de la placa, reduciendo la magnificación cardíaca.",
    ],
  },
  "2f87f729-14d3-442b-af22-135b3426c434": {
    opcoes_comentario: [
      "Incorrecto. La opción 'A + B' hace referencia a rayos X y rayos gamma en conjunto, y ambos SÍ son radiaciones ionizantes. La pregunta busca la que NO lo es.",
      "Incorrecto. Los rayos Gamma SÍ son radiación ionizante, emitidos por núcleos radiactivos inestables durante la desintegración nuclear.",
      "Incorrecto. Los rayos X SÍ son radiación ionizante, generados por la desaceleración brusca de electrones de alta energía al chocar contra un blanco metálico.",
      "Correcto. Las ondas electromagnéticas, sin especificar su frecuencia, NO son necesariamente ionizantes. Solo las de alta frecuencia (rayos X, rayos gamma) tienen energía suficiente para ionizar la materia; las ondas de radio, microondas, infrarrojo, luz visible y UV cercano son electromagnéticas pero NO ionizantes.",
    ],
  },
  "3b7b55a2-f55e-4614-8c2e-a237dfe5dfac": {
    opcoes_comentario: [
      "Incorrecto. El cultivo de Mycobacterium tuberculosis se realiza en medios ESPECIALES (Lowenstein-Jensen, Middlebrook) y el crecimiento es LENTO (2-8 semanas), no en una semana. La baciloscopia es más rápida.",
      "Incorrecto. Mycobacterium tuberculosis NO se observa por tinción de Gram. Se observa por tinción de Ziehl-Neelsen (ácido-alcohol resistente) debido a la alta concentración de ácidos micólicos en su pared.",
      "Incorrecto. Las formas extrapulmonares de tuberculosis son FRECUENTES en pacientes con SIDA (no raras). La inmunosupresión por VIH favorece la diseminación del bacilo a otros órganos (ganglios, SNC, pleura, etc.).",
      "Correcto. La baciloscopia positiva (visualización de BAAR en esputo mediante Ziehl-Neelsen) es diagnóstico de certeza de tuberculosis pulmonar. Confirma la presencia de Mycobacterium tuberculosis en la muestra clínica.",
    ],
  },
  "08b92a44-f7a4-491f-ac24-1722f3d943df": {
    opcoes_comentario: [
      "Correcto. En la insuficiencia cardíaca izquierda de larga data (congestión pasiva crónica), el pulmón muestra: congestión capilar, edema, engrosamiento fibroso de los tabiques alveolares y presencia de macrófagos cargados de hemosiderina ('células de la insuficiencia cardíaca'), reflejo de microhemorragias alveolares repetidas. Es el cuadro completo de la 'induración parda' pulmonar.",
      "Incorrecto. La opción A ya describe de forma completa el conjunto de hallazgos (congestión, edema, fibrosis y hemosiderina); no es necesario combinar fragmentos de otras opciones.",
      "Incorrecto. Esta descripción corresponde al edema agudo de pulmón, sin cambios fibróticos ni hemosiderina, y no refleja una disfunción cardíaca de LARGA DATA como plantea el enunciado.",
      "Incorrecto. Es cierto que los macrófagos cargados de hemosiderina ('células de la insuficiencia cardíaca') aparecen en la congestión pasiva crónica, pero esta opción describe solo una parte del cuadro; la respuesta completa incluye también la congestión capilar, el edema y la fibrosis de los tabiques (opción A).",
    ],
  },
  "131511c8-6d48-449f-b9b2-b2fad960c3af": {
    indice_correta: 0,
    opcoes_comentario: [
      "Correcto. La torsión testicular ocluye primero el retorno VENOSO (de paredes más delgadas y fácilmente compresibles), mientras el flujo ARTERIAL persiste inicialmente. Esto produce congestión, extravasación de sangre hacia el tejido y un INFARTO HEMORRÁGICO (rojo), típico de órganos con circulación laxa o doble como el testículo, el pulmón y el intestino.",
      "Incorrecto. El edema puede acompañar al cuadro, pero no describe la lesión isquémica característica de la torsión testicular, que es un infarto hemorrágico.",
      "Incorrecto. El infarto anémico (blanco) es típico de órganos sólidos con circulación arterial terminal (riñón, bazo, corazón), donde predomina la oclusión arterial. En la torsión testicular la oclusión inicial es VENOSA con persistencia del flujo arterial, lo que genera un infarto HEMORRÁGICO, no anémico.",
      "Incorrecto. Sí existe una respuesta correcta: el infarto hemorrágico (rojo).",
    ],
  },
  "1b35e660-e8c7-44e5-ad7c-7cf744679fb8": {
    enunciado: "¿Cuál es la unidad anatomofuncional visible por TACAR?",
    opcoes: ["Lóbulo pulmonar secundario", "Ácino pulmonar", "Alvéolo", "Segmento pulmonar"],
    indice_correta: 0,
    opcoes_comentario: [
      "Correcto. El LÓBULO PULMONAR SECUNDARIO es la unidad anatomofuncional más pequeña del pulmón visible por Tomografía de Alta Resolución (TACAR/HRCT). Está rodeado por septos de tejido conectivo y agrupa varios ácinos, formando estructuras poligonales características en la imagen.",
      "Incorrecto. El ácino pulmonar es una subunidad del lóbulo pulmonar secundario (varios ácinos forman un lóbulo), pero no es la unidad visible individualmente por TACAR; su tamaño está por debajo de la resolución habitual de esta técnica.",
      "Incorrecto. El alvéolo es la unidad funcional más pequeña del intercambio gaseoso, pero es microscópico y no se visualiza de forma individual por TACAR.",
      "Incorrecto. El segmento pulmonar es una unidad broncopulmonar mayor (varios lóbulos secundarios lo componen); no es la unidad más pequeña visible por TACAR.",
    ],
  },
  "44fc382f-f09c-47e8-a03f-e0bbd7d03dd6": {
    indice_correta: 2,
    opcoes_comentario: [
      "Incorrecto. Los virus son agentes biológicos (infecciosos), no químicos.",
      "Incorrecto. Los rayos X son un agente físico (radiación), no una noxa química.",
      "Correcto. La glucosa, en concentraciones anormales (hiperglucemia, soluciones hipertónicas), es un clásico ejemplo de agente QUÍMICO capaz de producir injuria celular, según la clasificación de las causas de lesión celular.",
      "Incorrecto. La electricidad (shock eléctrico) se clasifica como un agente FÍSICO de injuria, junto con el trauma, las temperaturas extremas y la radiación, no como agente químico.",
    ],
  },
  "5ae84464-6280-403f-a6d3-e6165143a240": {
    indice_correta: 1,
    opcoes_comentario: [
      "Incorrecto. Sí existe una opción correcta: el hiperestrogenismo produce hipertrofia/hiperplasia endometrial.",
      "Correcto. El estímulo estrogénico sostenido y sin oposición de progesterona (hiperestrogenismo) produce un crecimiento excesivo del endometrio, con hipertrofia e hiperplasia de las glándulas endometriales, base histológica de la hiperplasia endometrial, un factor de riesgo para carcinoma de endometrio.",
      "Incorrecto. La ATROFIA endometrial es producida por DEFICIENCIA de estrógenos (por ejemplo, en la posmenopausia), es decir, exactamente lo OPUESTO al efecto del hiperestrogenismo.",
      "Incorrecto. La metaplasia (por ejemplo escamosa) puede verse ocasionalmente en el endometrio, pero no es el cambio característico y predominante ante el hiperestrogenismo, que es la hipertrofia/hiperplasia glandular.",
    ],
  },
  "6d5768ec-e5d0-452e-b2d8-aafccc29c5ed": {
    enunciado: "La cisura mayor (oblicua) derecha divide:",
    opcoes: [
      "Lóbulo superior derecho de lóbulo medio derecho",
      "Lóbulos superior y medio derechos del lóbulo inferior derecho",
      "Lóbulo medio derecho de lóbulo inferior derecho",
      "Lóbulo superior derecho de lóbulo inferior derecho",
    ],
    indice_correta: 1,
    opcoes_comentario: [
      "Incorrecto. Esa es la función de la cisura MENOR (horizontal) derecha, que separa el lóbulo superior del lóbulo medio.",
      "Correcto. La cisura mayor (oblicua) derecha separa los LÓBULOS SUPERIOR Y MEDIO derechos (por arriba) del LÓBULO INFERIOR derecho (por abajo). El pulmón derecho tiene dos cisuras: la mayor (oblicua) y la menor (horizontal).",
      "Incorrecto. Separar solo el lóbulo medio del inferior sería incompleto: la cisura mayor derecha también separa el lóbulo superior del inferior, ya que ambos (superior y medio) quedan por encima de ella.",
      "Incorrecto. Esta opción omite al lóbulo medio derecho, que también queda separado del lóbulo inferior por la cisura mayor.",
    ],
  },
  "79cafb49-cc0b-4aeb-bf43-f1df816918cc": {
    indice_correta: 2,
    opcoes_comentario: [
      "Incorrecto. El espacio paratraqueal derecho se identifica en la radiografía de tórax de FRENTE (línea paratraqueal derecha), no es uno de los 'espacios claros' clásicamente descritos en la proyección de PERFIL.",
      "Incorrecto. No existe un 'espacio claro supraesternal' descrito como tal en la semiología radiológica del tórax de perfil.",
      "Correcto. El ESPACIO CLARO RETROCARDÍACO es uno de los espacios radiolúcidos clásicamente descritos en la radiografía de tórax de PERFIL, ubicado entre el borde posterior del corazón y la columna vertebral. Su ocupación (por ejemplo, por una masa o consolidación) es un signo radiológico relevante.",
      "Incorrecto. 'Paracardíaco derecho' no corresponde a la nomenclatura clásica de los espacios claros radiológicos del perfil torácico; el espacio reconocido en esa proyección es el retrocardíaco (y también el retroesternal).",
    ],
  },
  "86930b9f-f20f-475e-9e38-c212d2fefe68": {
    indice_correta: 1,
    opcoes_comentario: [
      "Incorrecto. La fiebre NO es causada exclusivamente por agentes infecciosos. También puede ser causada por neoplasias (fiebre tumoral), enfermedades autoinmunes, fármacos (fiebre medicamentosa), hemorragias, tromboembolismo, etc.",
      "Correcto. La fiebre SOSTENIDA (continuada) se caracteriza por valores de temperatura elevados de forma PERSISTENTE, SIN variaciones diarias mayores a 1°C. La temperatura se mantiene constantemente por encima de lo normal durante todo el día sin descensos significativos.",
      "Incorrecto. Esa descripción corresponde a la fiebre INTERMITENTE, no a la recurrente. En la fiebre INTERMITENTE, los valores de temperatura descienden hasta valores normales (o por debajo) en algún momento del día.",
      "Incorrecto. Esa descripción corresponde a la fiebre REMITENTE, no a la intermitente. En la fiebre RECURRENTE (relapsante) hay episodios de fiebre que duran días, separados por intervalos afebriles de días o semanas.",
    ],
  },
  "97ce71b1-cdce-4828-9a94-422d36b66bda": {
    opcoes: ["Endotelio", "Sangre", "Tejido conectivo", "Epitelio"],
    indice_correta: 2,
    opcoes_comentario: [
      "Incorrecto. El endotelio está compuesto por células endoteliales que recubren los vasos sanguíneos. Los mastocitos se encuentran en el tejido conectivo subyacente, cerca de los vasos, pero no en el propio endotelio.",
      "Incorrecto. Los mastocitos NO se encuentran en la sangre. Las células que circulan en la sangre y contienen histamina son los BASÓFILOS (granulocitos basófilos). Los mastocitos son células TISULARES.",
      "Correcto. Los MASTOCITOS se encuentran en el TEJIDO CONECTIVO (especialmente cerca de vasos sanguíneos, nervios y superficies epiteliales). Son células residentes tisulares derivadas de la médula ósea que contienen histamina y otros mediadores de la inflamación.",
      "Incorrecto. El epitelio es el tejido que recubre superficies externas e internas del cuerpo. Los mastocitos se localizan en el TEJIDO CONECTIVO subepitelial, no en el epitelio mismo.",
    ],
  },
  "98544b02-7d79-47b4-8da1-3a2bda0e3ba1": {
    opcoes_comentario: [
      "Incorrecto. El exudado mucoso es característico de mucosas inflamadas (por ejemplo, tracto respiratorio o digestivo), no de una ampolla cutánea.",
      "Correcto. Las ampollas (flictenas) contienen típicamente un exudado SEROSO: un líquido claro, pobre en células y rico en proteínas, producido por el aumento de la permeabilidad vascular en la inflamación aguda leve, como ocurre en quemaduras superficiales o fricción.",
      "Incorrecto. El exudado hemorrágico implica daño vascular severo con extravasación de eritrocitos, típico de lesiones más graves, no de una ampolla simple.",
      "Incorrecto. El exudado purulento (rico en neutrófilos) es característico de infecciones bacterianas piógenas, no del contenido habitual de una ampolla no infectada.",
    ],
  },
  "9d19f8be-0a51-4fa8-94de-547ce4a5811c": {
    opcoes_comentario: [
      "Incorrecto. Si bien la vía cutánea (piel erosionada) y las mucosas son vías de contagio válidas para algunos bacilos gram positivos esporulados (como Bacillus anthracis), esta no es la asociación clínica clásica que se busca en la pregunta.",
      "Incorrecto. El reservorio de estos bacilos NO es humano ni se transmite persona a persona por lesiones cutáneas; el reservorio típico es ambiental (suelo, agua) o animal.",
      "Incorrecto. Estos bacilos no son agentes relevantes de neumonía intrahospitalaria; esa asociación corresponde a otros gérmenes (por ejemplo, bacilos gram negativos, Legionella).",
      "Correcto. Los bacilos gram positivos de este grupo se asocian clásicamente a infecciones de piel y partes blandas en trabajadores que manipulan pescado (pescadores, fileteros), por inoculación cutánea directa durante la manipulación del pescado.",
    ],
  },
  "af4aad41-ddbf-405c-bbcb-e46ed449797c": {
    opcoes_comentario: [
      "Incorrecto. El derrame (líquido) tiene densidad de AGUA/partes blandas, la misma categoría que el músculo y el ganglio; no constituye una densidad radiológica distinta por sí mismo.",
      "Incorrecto. El músculo tiene densidad de partes blandas (agua), igual que el derrame y el ganglio; no es una categoría de densidad radiológica en sí misma, sino un ejemplo dentro de ella.",
      "Incorrecto. El ganglio, al igual que el derrame y el músculo, presenta densidad de partes blandas (agua); no representa una densidad radiológica distinta.",
      "Correcto. El AIRE constituye una de las cuatro densidades radiológicas básicas (aire, grasa, agua/partes blandas y calcio/hueso). Derrame, músculo y ganglio son todos ejemplos de la misma densidad de partes blandas (agua), mientras que el aire tiene una densidad radiolúcida propia y distinta.",
    ],
  },
}

const results = []
for (const [id, patch] of Object.entries(FIXES)) {
  const { data, error } = await supabase.from("questoes").update(patch).eq("id", id).select("id,materia,enunciado,indice_correta")
  if (error) { console.error("ERROR on", id, error); results.push({ id, error: error.message }); continue }
  results.push({ id, ok: true, row: data[0] })
  console.log("Fixed:", id.slice(0, 8), "->", data[0]?.enunciado?.slice(0, 50), "correct idx:", data[0]?.indice_correta)
}
writeFileSync(`${SCRATCH}/injuria_fixes_result.json`, JSON.stringify(results, null, 1))
console.log(`\nTotal: ${results.length}, OK: ${results.filter(r => r.ok).length}, Errors: ${results.filter(r => r.error).length}`)
