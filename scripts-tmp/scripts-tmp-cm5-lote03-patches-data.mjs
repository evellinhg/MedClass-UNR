// Patches manuais (lote 3/11, escrito diretamente após 4 travamentos
// seguidos do subagente neste lote) para o viés de tamanho em
// clinica_medica_5. Só edita índices de `opcoes` listados; indice_correta e
// o texto da alternativa correta nunca são tocados.
export const PATCHES = {
  "426ed275-e5d5-4167-a638-24d1e8e14f2e": {
    0: "La presencia de anticuerpos contra los canales de calcio presinápticos en sangre periférica, un hallazgo inmunológico que define al síndrome miasteniforme de Eaton-Lambert (trastorno paraneoplásico de la unión neuromuscular, frecuentemente asociado a carcinoma pulmonar de células pequeñas), entidad que no guarda ninguna relación con la regulación de la volemia ni con la homeostasis del sodio y el agua corporal.",
    1: "La medición de la capacidad vital forzada junto con la realización de una espirometría completa con curva de flujo-volumen, estudios que evalúan exclusivamente la mecánica ventilatoria y los flujos aéreos pulmonares, careciendo por completo de utilidad diagnóstica para valorar el estado hemodinámico de la volemia en un paciente con hiponatremia de origen central.",
    3: "La presencia de una acidosis tubular renal de tipo distal asociada a una excreción urinaria de amonio positiva, hallazgo bioquímico característico de la acidosis tubular renal tipo 1, un trastorno completamente distinto que no forma parte del diagnóstico diferencial entre el SIADH y el Cerebro Perdedor de Sal.",
  },
  "9c998b30-d15b-46a5-a334-34d4c216f8d4": {
    0: "Síndrome de Peutz-Jeghers, entidad caracterizada por presentar de forma exclusiva pólipos de estirpe histológica hamartomatosa (no adenomatosa), sin riesgo intrínseco de malignización de dichos pólipos, y sin relación con el número o distribución descritos en esta paciente.",
    2: "Poliposis hiperplásica hereditaria, presuntamente asociada a mutaciones del gen APC pero de localización hipofisaria, una entidad inexistente en la literatura médica, ya que el gen APC es un supresor tumoral que actúa sobre la vía Wnt/beta-catenina del epitelio digestivo.",
    3: "Síndrome de Lynch clásico; se diferenciaría por presentar típicamente entre 500 y 1000 pólipos adenomatosos concentrados de forma predominante en el recto distal, a diferencia de la distribución proximal descrita en esta paciente.",
  },
  "0c94a207-0fb0-4227-bf4e-fc1fb1546fea": {
    0: "Pertenece a la categoría Ambiental, es decir, superficies y objetos que no contactan directamente al paciente; requeriría únicamente limpieza con detergente enzimático de forma periódica cada 30 días, sin necesidad de desinfección de alto nivel entre usos.",
    2: "Pertenece a la categoría No Crítico, es decir, dispositivos que solo contactan piel intacta del paciente; requeriría exclusivamente una desinfección de bajo nivel con alcohol al 70%, sin necesidad de un proceso de desinfección más exigente.",
    3: "Pertenece a la categoría Crítico, es decir, dispositivos que penetran tejidos o cavidades estériles del cuerpo; requeriría de forma obligatoria una esterilización física completa mediante autoclave de vapor de agua a 121°C durante 30 minutos.",
  },
  "096bc55c-3c68-42ff-90a3-6b9d962b640f": {
    0: "Tejido fibroso denso de aspecto hialino que infiltra de forma agresiva las estructuras musculares y vasculares vecinas del cuello, simulando clínicamente un proceso maligno local, y que predispondría al desarrollo de un sarcoma cervical de origen fibroso.",
    1: "Foliculitis supurativa aguda con formación de microabscesos ricos en neutrófilos dentro del parénquima tiroideo, un patrón inflamatorio que predispondría de forma hiperaguda al desarrollo de un carcinoma anaplásico de tiroides en cuestión de semanas.",
    3: "Formación de granulomas epitelioides con células gigantes multinucleadas de tipo Langhans y necrosis caseosa central, patrón histológico que asociaría a esta paciente con una linfadenitis tuberculosa satélite de la región cervical.",
  },
  "8ffa3f42-c7e0-42b6-9a47-818dfacb324e": {
    0: "pO2 de 65 mmHg y pCO2 de 28 mmHg, valores compatibles con hipoxemia leve-moderada e hipocapnia compensadora.",
    2: "pO2 de 90 mmHg y pCO2 de 45 mmHg, valores dentro de rangos gasométricos normales para ambos parámetros.",
    3: "pO2 de 75 mmHg y pCO2 de 35 mmHg, valores compatibles con hipoxemia leve y capnia dentro de rango normal.",
  },
  "da227d97-ad71-48a0-b72c-ef0801240cb2": {
    1: "Una deleción homocigota del locus del gen de la globina beta en el cromosoma 11, que induciría una sobreexpresión inestable de metaloproteinasas plasmáticas responsables de la hemólisis, mecanismo propio de los síndromes talasémicos hereditarios.",
    2: "Una mutación autosómica dominante heredada del gen de la espectrina, proteína del citoesqueleto eritrocitario, que inactivaría a los receptores mitocondriales de transferrina, mecanismo característico de la esferocitosis hereditaria familiar.",
    3: "La presencia de una translocación recíproca t(9;22) entre los cromosomas 9 y 22, que bloquearía la apoptosis fisiológica de las células endoteliales distales, alteración molecular característica de otra neoplasia hematológica clonal.",
  },
  "e0a97473-37e2-477c-ba55-56729a96df99": {
    0: "Demuestra la completa curación del distress respiratorio, con normalización de la permeabilidad capilar alveolar y resolución del edema pulmonar rico en proteínas que caracterizaba las fases iniciales del cuadro.",
    1: "Es consecuencia exclusiva del uso de broncodilatadores inhalados de acción prolongada administrados a dosis terapéuticas habituales, sin relación con el proceso destructivo alveolar subyacente.",
    3: "Se debe a un aumento del aclaramiento renal de amonio que induciría una alcalosis metabólica compensadora tardía, mecanismo que explicaría la acidemia observada en la gasometría de este paciente.",
  },
  "9f66b700-68eb-43dc-8979-678bb6d2dc31": {
    0: "Se trata de una diarrea secretora de origen infeccioso por sobrecrecimiento fúngico intestinal, cuadro que requeriría tratamiento antimicótico específico con nistatina oral, sin relación con la resección ileal previa ni con la reabsorción de sales biliares.",
    1: "Se trata de una esteatorrea severa por depleción completa del pool de ácidos biliares, cuadro que se esperaría en resecciones ileales extensas mayores a 100 cm y que requeriría una dieta rica en triglicéridos de cadena larga, sin necesidad de medicación adicional dado que la capacidad hepática compensatoria estaría totalmente superada.",
    2: "Se trata de una diarrea osmótica secundaria a la mala digestión de proteínas por insuficiencia pancreática exocrina, cuadro que se trataría mediante la suplementación oral de enzimas pancreáticas, sin relación con la reabsorción ileal de sales biliares.",
  },
  "1b97f168-024d-4241-b4d9-b292fdc6c7f3": {
    0: "Estudio periódico de la conducción nerviosa periférica mediante electromiografía, orientado a descartar una neuropatía desmielinizante de tipo autonómico asociada al tratamiento.",
    2: "Evaluación oftalmológica del campo visual y retinografía de control anual, orientadas a detectar precozmente una toxicidad retiniana en diana inducida por el fármaco.",
    3: "Densitometría ósea lumbar periódica y medición de los niveles de hormona paratiroidea, orientadas a monitorizar el riesgo de osteoporosis inducida por el tratamiento farmacológico.",
  },
  "f14e7cea-e66d-4655-b4ad-cb1178f40795": {
    0: "Se debe aumentar la dosis de prednisona a 100 mg/día por vía endovenosa de forma indefinida, asumiendo una refractariedad absoluta y esperada de la PMR al tratamiento glucocorticoide habitual a bajas dosis.",
    1: "Iniciar anticoagulación sistémica de forma inmediata, asumiendo la presencia de un síndrome de anticuerpos antifosfolipídicos catastrófico como causa subyacente del fracaso terapéutico observado.",
    3: "Corresponde a la evolución clínica normal y esperada de la PMR, ya que la respuesta terapéutica completa a las dosis bajas de prednisona suele demorar típicamente entre 6 y 12 meses de tratamiento continuo.",
  },
  "97ac4c42-fd12-4f21-a6c7-efe4259e9b1c": {
    0: "Enfermedad de Alzheimer de tipo familiar y de inicio precoz, definida histológicamente por el acúmulo extracelular difuso de placas de beta-amiloide localizadas de forma predominante en el cerebelo anterior.",
    1: "Esclerosis lateral amiotrófica en su fase terminal, caracterizada histológicamente por la degeneración progresiva de las neuronas motoras del asta anterior de la médula espinal, sin compromiso de estructuras diencefálicas.",
    3: "Accidente cerebrovascular isquémico del territorio de la arteria cerebral media izquierda, que se observaría en la neuroimagen como una hiperdensidad cortical difusa en la tomografía computada realizada al ingreso.",
  },
  "a7607e83-ac71-421c-8e86-db7bccedf43c": {
    0: "Invasión tisular directa por micobacterias atípicas que inducirían una reacción granulomatosa necrotizante de células epitelioides a nivel de la dermis pretibial, de origen infeccioso.",
    2: "Edema linfático obstructivo de distribución bilateral, secundario a la presencia de adenopatías inguinales masivas de carácter no doloroso que comprimirían el drenaje linfático de ambos miembros.",
    3: "Insuficiencia venosa crónica de grado severo, con extravasación crónica de eritrocitos y depósito cutáneo de hemosiderina de origen inflamatorio secundario a la hipertensión venosa sostenida.",
  },
  "65074925-fbf5-4c6a-8e1c-1ec934c44123": {
    0: "Requiere de forma obligatoria el implante inmediato de un marcapasos unicameral provisorio, sin necesidad de suspender la ingesta activa de alcohol ni modificar la conducta tóxica de base del paciente.",
    1: "La enfermedad es irreversible y progresiva de forma independiente a la conducta posterior del paciente, debiendo indicarse de inmediato una ablación por radiofrecuencia de la fibrilación auricular como única medida eficaz.",
    2: "Se cura de forma espontánea sin necesidad de suspender el consumo de alcohol, mediante el aporte diario de suplementos de Vitamina C por vía oral que revertirían el daño miocárdico acumulado.",
  },
  "d8964f96-8d9e-4afd-953e-0916230e0f4e": {
    1: "Induce una broncodilatación selectiva de la vía aérea mediada por la inhibición directa de los receptores beta-2 adrenérgicos periféricos, mejorando el intercambio gaseoso por optimización del flujo aéreo.",
    2: "Inhibe de forma selectiva la síntesis renal de prostaglandina I2, lo que aumentaría secundariamente el filtrado glomerular y contribuiría de forma indirecta a mejorar la oxigenación sistémica del paciente.",
    3: "Actúa como un potente vasoconstrictor esplácnico selectivo de las venas pulmonares, redistribuyendo el flujo sanguíneo hacia zonas de mejor relación ventilación-perfusión del parénquima pulmonar.",
  },
  "e285ef27-1c6f-4fec-8aec-2ef83f273e2d": {
    1: "Presencia de un flujo turbulento aislado en la vena cava inferior distal, sin cambios estructurales asociados de la pared aórtica en el estudio tomográfico de control.",
    2: "Presencia de una calcificación concéntrica, homogénea y continua de toda la pared de la aorta descendente, hallazgo conocido como 'aorta en porcelana' de origen aterosclerótico crónico.",
    3: "Desplazamiento cefálico transitorio de la tráquea por encima del nivel de la bifurcación del bronquio principal izquierdo, secundario a un efecto de masa mediastínica.",
  },
  "fe58d669-b9cc-4c84-bcfd-93b1710e3edb": {
    0: "Se produce por vasoconstricción directa de las arteriolas estrelladas de la corteza renal, con la consecuente pérdida de la capacidad de filtración glomerular del potasio circulante.",
    2: "Requiere una caída mínima de apenas 10 mEq/L de potasio corporal total, y actúa destruyendo de forma física las células epiteliales de la porción descendente del asa de Henle.",
    3: "Requiere un déficit mínimo de solo 50 mEq/L de potasio corporal total, y se debe a un bloqueo directo de la secreción adrenal de aldosterona inducido por la hipopotasemia.",
  },
  "f592e76e-bfeb-49ed-bc18-6721185ea389": {
    0: "Realizar un recambio plasmático por aféresis de forma diaria, orientado a remover la heparina libre circulante en el sistema, procedimiento estándar en otras microangiopatías trombóticas.",
    1: "Administrar dosis masivas de heparina no fraccionada por vía endovenosa de forma aislada, con el objetivo de anular la trombosis microvascular difusa mientras se retrasa el tratamiento del foco infeccioso primario.",
    2: "Indicar una esplenectomía de urgencia por vía abierta, con el objetivo de detener el consumo macrofágico esplénico de los factores de la vía extrínseca de la coagulación.",
  },
  "ea8974a4-6ce9-4eda-9bf4-0152d8a33e0c": {
    0: "La falta de potasio plasmático impediría la liberación normal de calcio por parte del retículo sarcoplásmico, lo que cronificaría la contracción muscular sostenida hasta el agotamiento completo de las reservas de ATP.",
    1: "La hipokalemia bloquearía directamente la síntesis de colágeno muscular, provocando la rotura mecánica de la membrana del sarcómero durante los episodios de contracción muscular intensa.",
    3: "La hipokalemia estimularía de forma directa la actividad fagocítica de macrófagos y neutrófilos tisulares, que destruirían las fibras de miosina muscular mediante un mecanismo reflejo de tipo inmunológico.",
  },
  "0f027139-0e31-4b71-bf8f-cb2ea846ad65": {
    0: "La síntesis hepática de hepcidina y la carboxilación postraduccional del factor II de la coagulación, funciones reguladoras del metabolismo del hierro y de la activación de factores vitamina K dependientes.",
    2: "Inhibir de forma competitiva al receptor plaquetario GP IIb/IIIa en ausencia de un estado trombótico sistémico activo, actuando como un regulador negativo natural de la agregación plaquetaria excesiva.",
    3: "Degradar de forma selectiva a la plasmina circulante e inactivar de forma directa al inhibidor natural antitrombina III, participando así en la regulación del sistema fibrinolítico plasmático.",
  },
  "cf20eb56-3844-4210-b780-468c7f255c7b": {
    0: "Síndrome de dumping tardío de origen posquirúrgico, secundario a un vaciamiento gástrico hiperagudo del contenido alimentario hacia el intestino delgado proximal.",
    1: "Esofagitis eosinofílica de curso severo, con formación de múltiples anillos esofágicos concéntricos de tipo Schatzki que dificultan el tránsito del bolo alimentario.",
    3: "Megacolon tóxico secundario a un brote grave de colitis ulcerosa, con distensión colónica generalizada y riesgo inminente de perforación.",
  },
  "232a19fd-9808-4d1e-9d46-4bb8149827b4": {
    0: "El uso crónico de mesalazina oral alcalinizaría de forma sostenida tanto la orina como la bilis, induciendo de forma secundaria la cristalización de sales mixtas de magnesio y fosfato en ambos territorios de forma simultánea.",
    1: "La secreción activa y masiva de calcio por parte de la pared inflamada del íleon terminal saturaría de forma simultánea tanto la bilis como la orina, favoreciendo la precipitación conjunta de ambos tipos de cálculos.",
    2: "La presencia de fístulas enterovesicales y enterobiliares directas causaría el reflujo de bacterias productoras de ureasa, las cuales precipitarían de forma sincrónica tanto la orina como la bilis por alcalinización bacteriana local.",
  },
  "22c73eba-f950-4515-b996-3e21f3dcaeb9": {
    0: "Atenolol 100 mg por vía oral, betabloqueante que actúa de forma selectiva sobre los receptores beta-1 cardíacos sin ejercer ningún efecto adicional sobre la conversión periférica de las hormonas tiroideas.",
    1: "Digoxina 0.25 mg por vía endovenosa, que controlaría la frecuencia cardíaca mediante el bloqueo directo de la conducción a través de una vía accesoria del nodo sinusal.",
    3: "Amiodarona 300 mg por vía endovenosa, que actuaría como estabilizador de membrana y aportaría una carga de yodo inorgánico capaz de bloquear de forma inmediata la función tiroidea.",
  },
  "a7ebca67-66f3-44cb-b9c0-ddab2a0ec717": {
    1: "Iniciar de inmediato tratamiento betabloqueante por vía oral y otorgar el alta médica definitiva, considerando que la paciente se encuentra clínicamente estable y asintomática en su actividad habitual.",
    3: "Indicar una valvuloplastia aórtica percutánea con balón de Wilkins de forma urgente, como alternativa terapéutica menos invasiva al reemplazo valvular quirúrgico convencional.",
  },
  "b64d23d7-b322-428c-8ef2-408da96fd29f": {
    0: "Puntaje de 15, que se clasificaría como un sangrado exanguinante y que requeriría cirugía de urgencia inmediata, prescindiendo de la realización de una endoscopia diagnóstica previa.",
    1: "Puntaje de 0, lo que indicaría el alta hospitalaria inmediata del paciente con manejo e indicaciones exclusivamente ambulatorias.",
    2: "Puntaje de 1, que se clasificaría como de bajo riesgo y permitiría el alta hospitalaria con pautas de alarma claras y tratamiento oral con inhibidores de la bomba de protones.",
  },
  "d82d1913-12b2-4d15-a7c6-c47ef21ce06f": {
    1: "Presencia de un desprendimiento prematuro de placenta normoinserta con sangrado masivo, ocurrido exclusivamente durante el primer trimestre del embarazo.",
    2: "Antecedente de diabetes gestacional refractaria al tratamiento con insulina, requiriendo ajustes terapéuticos frecuentes durante el control prenatal.",
    3: "Desarrollo de malformaciones congénitas mayores del tubo neural fetal, de origen genético y sin relación con factores ambientales o carenciales maternos.",
  },
  "0acff5d3-77c1-4320-a408-616f5cefa082": {
    0: "Deriva de la sobrecarga de volumen diastólica masiva de la aurícula izquierda, hallazgo típico y característico de la estenosis mitral de origen orgánico reumático.",
    1: "Se produce por un infarto agudo de miocardio de tipo transmural masivo secundario a una ateroesclerosis coronaria acelerada de la arteria descendente anterior; su principal riesgo clínico tardío sería el desarrollo de una neumonitis química por aspiración.",
    2: "Es una alteración funcional de tipo puramente espástico, inducida por un estrés emocional masivo (Síndrome de Tako-Tsubo o miocardiopatía por estrés), que característicamente presenta una regresión completa y espontánea dentro de las primeras 48 horas de evolución.",
  },
  "4128b49e-2113-4cb2-8a4b-0946f3a9967e": {
    1: "Cáncer de colon derecho (ciego), que asociaría de forma exclusiva anemia megaloblástica secundaria a una obstrucción del íleon terminal.",
    2: "Cáncer gástrico con penetración directa hacia el lóbulo hepático izquierdo, cuadro que cursaría con epigastralgia y saciedad precoz predominantes.",
    3: "Gastroenteritis bacteriana autolimitada causada por Campylobacter jejuni, de curso agudo y con resolución espontánea en pocos días.",
  },
  "0824f39b-f5e8-46ae-892d-cf087575a038": {
    1: "La distinción se basaría en la avidez por el yodo radiactivo evidenciada en el centellograma postoperatorio, considerando que el adenoma folicular captaría el trazador mientras que el carcinoma sería siempre frío.",
    2: "El carcinoma folicular se caracterizaría por presentar múltiples cuerpos de psamoma dentro de sus folículos, hallazgo que solo podría observarse en el examen macroscópico del espécimen quirúrgico definitivo.",
    3: "La limitación se debería a que las células del carcinoma folicular expresarían calcitonina de forma idéntica al adenoma benigno, diferenciándose ambas entidades mediante la medición de tiroglobulina sérica estimulada.",
  },
  "73aaebfe-aae7-4e94-804f-ea1a233b541d": {
    0: "No se indica profilaxis antimicrobiana de mantenimiento de forma rutinaria, con el objetivo de evitar el desarrollo de resistencia bacteriana a los antibióticos utilizados.",
    1: "Inyección intramuscular mensual de penicilina benzatínica de forma indefinida, esquema profiláctico dirigido a prevenir infecciones bacterianas recurrentes de origen estreptocócico.",
    2: "Realizar paracentesis evacuadoras profilácticas de forma semanal en el consultorio externo, de manera indefinida, como estrategia preventiva de nuevos episodios de infección peritoneal.",
  },
  "4c171e53-25f3-49c2-a377-af6480b9c214": {
    1: "1º Iniciación plaquetaria mediada por heparina libre circulante; 2º Polimerización de cadenas beta de globina en la superficie plaquetaria; 3º Degradación final del coágulo por acción de la plasmina lisosomal intracelular.",
    2: "1º Activación selectiva del factor XII a nivel de la mucosa gástrica; 2º Bloqueo competitivo del calcio circulante por la albúmina plasmática; 3º Lisis plaquetaria mediada por sales biliares en la fase final del proceso.",
    3: "1º Propagación inicial mediada por el factor tisular expuesto; 2º Amplificación de la serie eritroide mediada por hepcidina hepática; 3º Iniciación final del proceso mediada por la antitrombina de origen biliar.",
  },
  "cb5d6d2f-46cd-411f-8595-263dcc3a0ae4": {
    0: "Escleroterapia endoscópica con polidocanol, agente esclerosante que destruiría de forma mecánica el esfínter de Oddi con el objetivo de disminuir el flujo retrógrado sinusoidal hacia el sistema variceal esofágico.",
    1: "Inyección perivariceal de cianoacrilato de forma rutinaria y exclusiva a lo largo de todo el trayecto esofágico distal, independientemente de la localización específica del punto de sangrado activo.",
    3: "Electrocoagulación monopolar directa aplicada sobre el cardias gástrico superior, procedimiento que disminuiría la acidez refluyente y facilitaría el cierre mucoso de la lesión sangrante.",
  },
  "f653e73e-2f0f-4b45-a267-71f885689037": {
    0: "Enfermedad de von Willebrand Tipo 3, forma hereditaria caracterizada por la ausencia total de la síntesis endotelial del factor von Willebrand plasmático.",
    2: "Púrpura Trombocitopénica Inmune de carácter refractario, secundaria a la destrucción plaquetaria mediada por anticuerpos IgG de tipo caliente contra antígenos de superficie.",
    3: "Trombastenia de Glanzmann, trastorno caracterizado por un déficit congénito severo de la glicoproteína de membrana plaquetaria IIb/IIIa.",
  },
  "512828b4-8395-4581-880e-7b2e162c2be3": {
    0: "El cortisol exógeno estimularía la síntesis de nuevos receptores V2 a nivel del asa de Henle, forzando de este modo la excreción activa de agua libre por un mecanismo de arrastre osmótico.",
    2: "La administración de hidrocortisona destruiría de forma directa a las escasas neuronas magnocelulares supervivientes localizadas en el núcleo paraventricular hipotalámico.",
    3: "El cortisol actuaría como un agonista selectivo de los canales de acuaporina 2 en la membrana luminal, impidiendo mecánicamente el paso de agua libre hacia el intersticio medular renal.",
  },
  "d4159af2-87d4-4f41-b524-28404384ae44": {
    0: "Se trata de un hallazgo esencialmente benigno que resolvería de forma sistemática mediante la infusión endovenosa de neostigmina, sin requerimiento de intervención quirúrgica adicional.",
    2: "El riesgo prioritario sería el desarrollo de una insuficiencia cardíaca congestiva de alto gasto, secundaria a la formación refleja de una fístula arteriovenosa mesentérica.",
    3: "El riesgo sería mínimo, dado que el contenido gaseoso podría retrogradar libremente hacia el estómago; el manejo indicado sería una dieta libre de gluten mantenida de forma indefinida.",
  },
  "ddcef470-1201-4b9d-8ad8-6fdf52074e9e": {
    0: "El principio de Pascal, que describe la transmisión hidrostática de presiones de forma simétrica y uniforme a través de un fluido incompresible contenido en un recipiente cerrado.",
    2: "La ley de Boyle-Mariotte, que describe la relación inversa entre la presión y el volumen de un gas en condiciones de compresión isotérmica dentro de la cavidad torácica.",
    3: "La ley de Charles, que describe la expansión volumétrica de un gas inducida por el aumento de temperatura, en este caso atribuida al calor corporal del paciente.",
  },
  "440f1860-de07-4561-a51e-119b2fc52588": {
    1: "El CEA es un marcador altamente específico de cáncer de colon, que nunca se eleva en patologías benignas ni en pacientes con tabaquismo crónico severo.",
    2: "El CEA constituye el método de primera elección para el tamizaje o cribado masivo del cáncer colorrectal en la población general mayor de 50 años, dada su alta sensibilidad en estadios iniciales.",
    3: "El CEA debería permanecer elevado de forma indefinida tras una cirugía exitosa; su caída a valores indetectables indicaría una falla de la respuesta inmunológica del huésped frente al tumor.",
  },
  "ad253153-e67a-4942-b841-fdb3bf156ea4": {
    1: "La articulación sacroilíaca, cuyo compromiso produciría una sacroileítis destructiva de carácter asimétrico y unilateral, asociada a un síndrome de cola de caballo por compresión radicular.",
    2: "La articulación temporomandibular, cuyo compromiso produciría necrosis del cóndilo mandibular con compresión secundaria de la arteria carótida interna adyacente.",
    3: "La columna lumbar alta, cuyo compromiso produciría un absceso frío del músculo psoas que comprimiría las raíces del nervio ciático homolateral.",
  },
  "679d15a4-c4eb-4e67-8a12-d2cfb9717dce": {
    1: "Ausencia total de actividad de la enzima transportadora canalicular apical MRP2, responsable de la excreción biliar activa de bilirrubina conjugada.",
    2: "Mutación de pérdida de función en los polipéptidos transportadores de captación sinusoidal OATP1B1, encargados de la incorporación hepatocitaria de bilirrubina no conjugada.",
    3: "Bloqueo de origen inmunomediado sobre la síntesis hepática de albúmina plasmática funcionalmente activa.",
  },
  "ff8faef9-9e40-4d54-a2d4-9f01c1cdab49": {
    0: "Lobectomía completa bilateral de forma total, asociada a un trasplante urgente de tráquea sintética como medida de rescate quirúrgico.",
    1: "Iniciar ciclos de quimioterapia citotóxica de forma preventiva, orientados a reducir el riesgo futuro de desarrollo de cáncer pulmonar en este paciente.",
    2: "Omitir todo tratamiento mecánico intervencionista e iniciar una infusión continua de betabloqueantes no selectivos por vía sistémica.",
  },
  "82fd196b-effa-4390-8a0b-2a0b64402137": {
    0: "Tratamiento sustitutivo continuo de por vida con inmunoglobulinas endovenosas a dosis bajas, combinado con una restricción proteica dietética estricta y sostenida.",
    1: "Uso exclusivo de agentes fibrinolíticos recombinantes, como la alteplasa, con el objetivo de disolver las microtrombosis hepáticas asociadas al cuadro.",
    2: "Quimioterapia de inducción intensiva inmediata con antraciclinas a dosis máximas acumuladas, asociada a radioterapia esplénica de carácter urgente.",
  },
  "c4d70e1c-ec0e-4897-8c29-b64402f863b2": {
    1: "Fisostigmina a dosis de 1-2 mg por vía endovenosa, repitiendo la administración hasta lograr midriasis completa y una taquicardia superior a 150 latidos por minuto, asociada a carbón activado seriado.",
    2: "N-acetilcisteína por vía oral a dosis de 140 mg/kg como dosis inicial de carga, seguida de una infusión de mantenimiento asociada a bicarbonato de sodio.",
    3: "Flumazenil por vía endovenosa a dosis altas de mantenimiento continuo, asociado a furosemida endovenosa con el objetivo de forzar la diuresis ácida.",
  },
  "e54932ff-c2f5-4f25-b9d5-23ed5d7d3d20": {
    2: "Omitir el lavado local de la herida para evitar diluir los anticuerpos protectores propios del trabajador, acudiendo de forma directa al servicio de infectología para su valoración.",
    3: "Cauterizar de forma inmediata el sitio del pinchazo utilizando un bisturí eléctrico o alcohol absoluto caliente, con el objetivo de desnaturalizar las proteínas virales presentes.",
  },
  "c151a2df-9770-4f59-b4b8-8813a9cb86b6": {
    1: "Síndrome del eutiroideo enfermo, cuadro que no requeriría tratamiento de sustitución hormonal y que ameritaría repetir la analítica en un centro de mayor complejidad técnica.",
    2: "Hipotiroidismo de origen hipofisario central, que requeriría de forma prioritaria la solicitud urgente de una resonancia magnética de la región selar junto con una biopsia transesfenoidal.",
    3: "Hipotiroidismo primario franco, ante el cual se debería iniciar de inmediato una dosis plena de levotiroxina calculada por peso corporal (1.6 µg/kg/día) para inducir una amenorrea de tipo terapéutico.",
  },
  "9393a1bb-68f8-4456-8524-be084451b734": {
    0: "Síndrome colinérgico severo, cuadro ante el cual se debería monitorizar estrechamente el potasio sérico; el antídoto indicado sería la atropina administrada a dosis altas.",
    1: "Síndrome simpaticomimético secundario al consumo de cocaína; el antídoto específico indicado sería el metoprolol por vía endovenosa en bolo de urgencia.",
    3: "Síndrome serotoninérgico de curso severo, cuadro que debería tratarse de forma exclusiva con ciproheptadina asociada a antipiréticos convencionales.",
  },
  "e967203b-c9c4-46f1-b37a-881010258972": {
    1: "Programar de forma inmediata una ablación por radiofrecuencia de tipo biventricular, contraindicando de forma simultánea el uso posterior de amiodarona en este paciente.",
    2: "Iniciar de inmediato una monoterapia oral con amiodarona a dosis de 10 gramos diarios, sin proceder a la colocación de ningún dispositivo cardíaco implantable.",
    3: "Tratamiento médico exclusivo del cuadro, con controles ecocardiográficos de seguimiento programados de forma semestral, sin otra intervención adicional.",
  },
  "fc3e0061-e357-4789-86ae-62acaf0f15a6": {
    0: "La PTHrP bloquearía la síntesis renal de calcitocina y promovería la degranulación de mastocitos localizados en los túbulos colectores renales, generando hipercalcemia por esta vía.",
    1: "Se uniría a los receptores de calcitonina a nivel renal, estimulando la retención de agua libre de forma tal que deformaría a los glóbulos rojos de la circulación periférica.",
    2: "La PTHrP lisaría de forma directa y física la matriz de colágeno óseo, sin requerir la mediación de células osteoclásticas para ejercer su efecto de resorción.",
  },
  "d2084f74-0bc9-4da6-b962-dbbbbc3024fb": {
    0: "El alcohol destruiría las vellosidades intestinales, impidiendo de forma selectiva la absorción de grasas dietarias, lo que forzaría al hígado a sintetizar de forma compensadora quilomicrones hepáticos de gran tamaño.",
    1: "El alcohol estimularía de forma selectiva a los transportadores apicales SGLT-2 renales, induciendo una hiperabsorción tubular de ácidos grasos libres que se depositarían de forma pasiva en el parénquima hepático.",
    2: "La degradación metabólica del etanol consumiría de forma irreversible la totalidad de los aminoácidos disponibles en el hepatocito, impidiendo la contracción normal del citoesqueleto celular hepático.",
  },
  "cc717dfa-6f2c-4253-818f-affdbbd1fec3": {
    0: "Vitamina B12 (Cobalamina), cofactor esencial de la enzima metionina sintasa; su déficit conllevaría un riesgo de desmielinización cortical difusa de carácter permanente.",
    1: "Vitamina B6 (Piridoxina), cofactor de las reacciones de transaminación celular; su déficit conllevaría un riesgo de convulsiones tónico-clónicas inducidas por el exceso de GABA a nivel central.",
    3: "Vitamina B3 (Niacina), cofactor de reacciones de óxido-reducción celular; su déficit conllevaría un riesgo de desarrollar pelagra, con dermatitis, diarrea y demencia de carácter irreversible.",
  },
  "0f50eff5-0acc-49ed-b1c1-cdc13911f5a6": {
    0: "Asfixia mecánica por ahogamiento en agua salina de tipo seco; la oximetría de pulso se encontraría siempre en valores cercanos al 0%; el antídoto de elección sería la atropina administrada por vía endovenosa.",
    1: "Intoxicación por plomo (saturnismo), en la cual el plomo destruiría de forma directa la hemoglobina plasmática circulante; la oximetría de pulso resultaría inútil para el diagnóstico; el antídoto de elección sería la penicilamina oral.",
    2: "Intoxicación aguda por propano, gas que posee una afinidad hasta 10 veces menor que el oxígeno por la hemoglobina; la oximetría de pulso resultaría diagnóstica en este contexto; el antídoto de elección sería el bicarbonato de sodio endovenoso.",
  },
  "7aad060c-1259-4711-b290-49a52b2da2dc": {
    0: "Se debería suspender por completo cualquier aporte de glucosa por vía endovenosa, forzando en su lugar una alimentación rica en carbohidratos complejos administrada de forma enteral continua.",
    1: "Se debería infundir de inmediato una carga rápida de solución dextrosada hipertónica al 50%, posponiendo la administración de tiamina por al menos 24 horas con el objetivo de evitar una acidosis tubular renal.",
    3: "Se debería administrar insulina rápida de forma simultánea con la infusión de dextrosa, con el objetivo de asegurar que la glucosa se desviara de forma exclusiva hacia el tejido graso abdominal.",
  },
  "9f02d55e-6608-443c-b5d7-f976df161c68": {
    0: "Se monitorearía con el Tiempo de Protrombina (TP), y su antídoto de reversión sería la vitamina K administrada por vía gástrica de forma inmediata.",
    1: "Se monitorearía con el recuento absoluto de megacariocitos circulantes en sangre periférica, y su antídoto específico sería el ácido fólico administrado por vía parenteral.",
    2: "Se monitorearía mediante el tiempo de sangría de Ivy, y su antídoto selectivo sería el propranolol administrado por vía endovenosa de forma diaria.",
  },
  "580c440d-6509-4e56-9289-f6ee0b275693": {
    0: "Bronquiectasias cilíndricas de distribución difusa, secundarias a un déficit congénito de inmunoglobulinas que favorecería infecciones respiratorias recurrentes.",
    2: "Enfisema centrolobulillar de curso purulento y crónico, entidad definida por la presencia sostenida de secreciones infectadas en los espacios aéreos distales.",
    3: "Asma bronquial de tipo intrínseco o no alérgico, de presentación característica en el adulto mayor con síntomas respiratorios variables.",
  },
  "db7fea8c-91c5-4ffc-ab69-ba0b383213d4": {
    0: "Déficit congénito severo del Factor VII de la coagulación, que afectaría de forma selectiva a la vía extrínseca del sistema hemostático.",
    1: "Tratamiento activo con warfarina sódica administrada a dosis plenas dentro del rango terapéutico habitual para la anticoagulación oral.",
    3: "Hemofilia A clásica en su forma descompensada de grado severo, secundaria a un déficit congénito del Factor VIII de la coagulación.",
  },
  "da449659-a4c0-4c96-8287-30671e38f2de": {
    0: "Tomografía Computada de cuello con contraste yodado, estudio en el cual la tiroiditis subaguda mostraría calcificaciones en cáscara de huevo consideradas patognomónicas de esta entidad.",
    1: "Resonancia Magnética de las órbitas, estudio en el cual la tiroiditis subaguda asociaría un engrosamiento simétrico del vientre del músculo recto lateral de ambos ojos.",
    3: "Ecografía Doppler color de la glándula tiroides, en la cual la enfermedad de Graves mostraría de forma característica una ausencia total de flujo vascular basal.",
  },
  "d10c3b0c-d14d-4918-b818-6694a1917789": {
    0: "A los 6 meses, debido al riesgo inminente de recurrencia local fragmentada de los pólipos previamente resecados de forma completa.",
    1: "A los 3 años, considerando que el paciente presentaría factores de riesgo intermedio-alto de forma acumulativa según los hallazgos de la colonoscopia.",
    3: "A los 5 años, de forma rutinaria y fija, aplicable de manera uniforme a toda la población general sin distinción de hallazgos endoscópicos previos.",
  },
  "30891bf5-7a1f-4e35-b9d9-8d31655e0c36": {
    0: "Corresponde a una radiculopatía lumbar de tipo compresivo, cuadro que empeoraría característicamente con el reposo y mejoraría al flexionar la columna vertebral hacia adelante.",
    1: "Indica una trombosis venosa profunda de distribución bilateral, con obstrucción masiva del retorno venoso que cedería al caminar de forma enérgica y sostenida.",
    3: "Es una miositis de origen autoinmune y curso proliferativo, localizada de forma exclusiva en las uniones tendinosas de la articulación del tobillo.",
  },
  "cd3f5ab5-cfa2-4d55-b1a7-822d80ea5474": {
    0: "Ciclofosfamida administrada de forma semanal; el ácido fólico mitigaría el riesgo de cistitis hemorrágica; se deberían vigilar de forma periódica las úlceras orales y el desarrollo de cáncer de vejiga.",
    2: "Hidroxicloroquina administrada de forma semanal; el ácido fólico mitigaría la toxicidad retiniana por depósitos maculares; se debería vigilar de forma periódica el desarrollo de ototoxicidad irreversible.",
    3: "Leflunomida administrada de forma semanal; el ácido fólico mitigaría el riesgo de infecciones oportunistas por virus de hepatitis B latente; se debería vigilar la aparición de neuropatía distal asimétrica.",
  },
  "c2f0238e-dc9b-4d10-8b5b-3b19acc8299c": {
    0: "Hipoalbuminemia de grado severo, secundaria a una pérdida entérica crónica de proteínas plasmáticas que reduciría la presión oncótica del compartimento vascular.",
    1: "Daño glomerular de origen inmunomediado, asociado a una proteinuria de rango nefrítico secundaria a un proceso inflamatorio glomerular activo.",
    3: "Vasodilatación arteriolar de tipo selectivo, inducida por fármacos bloqueantes de los canales de calcio administrados de forma crónica.",
  },
  "c94a41bc-ebd1-429b-aed8-fb573e69aadb": {
    0: "Fístula aortoduodenal de carácter primario, secundaria a una úlcera de Dieulafoy localizada en la pared duodenal proximal.",
    2: "Gastritis erosiva aguda secundaria a un reflujo biliar alcalino de curso severo hacia la mucosa gástrica.",
    3: "Divertículo de Meckel con una implantación anatómica anómala de localización intrapancreática proximal.",
  },
  "2c540663-053b-484e-bf8f-e6d4135d3ea2": {
    0: "La hipovolemia activaría de forma refleja a los cotransportadores de Na+/K+/2Cl- localizados en el túbulo contorneado distal, impidiendo de este modo la excreción tubular de iones con carga positiva como el potasio.",
    2: "El cortisol estimularía de forma directa a la bomba H+/K+-ATPasa gástrica, y su déficit provocaría una translocación inversa de protones y potasio hacia la circulación sistémica general.",
    3: "La aldosterona regularía de forma negativa la tasa de filtración glomerular, por lo que su ausencia provocaría una retención masiva de urea y creatinina que bloquearía secundariamente los canales de potasio del asa de Henle.",
  },
  "51eda192-1994-4976-bb69-c7962d3b2c78": {
    0: "Conjuntivitis alérgica estacional de distribución bilateral; se indicaría el uso exclusivo de antihistamínicos orales y la derivación habitual al domicilio del paciente sin otras medidas adicionales.",
    1: "Orzuelo de origen bacteriano por Staphylococcus aureus; requeriría antibióticos tópicos locales sin ninguna acción de notificación epidemiológica ni control vectorial posterior.",
    2: "Dacriocistitis aguda de origen traumático, secundaria a la picadura de mosquitos del género Anopheles; requeriría drenaje quirúrgico de carácter prioritario e inmediato.",
  },
  "8186a8f5-7f49-42cb-bddb-0c149e0c37f2": {
    1: "Agenesia de la glándula tiroides fetal, secundaria a la acción de anticuerpos citotóxicos maternos dirigidos contra el simportador de sodio-yoduro (NIS) de las células foliculares.",
    2: "Teratogénesis fetal con desarrollo de labio leporino, inducidos de forma selectiva por la sola presencia física de un bocio materno de gran tamaño.",
    3: "Hipotiroidismo congénito de carácter permanente, secundario al depósito de complejos inmunes de tiroglobulina materna a nivel de la hipófisis fetal en desarrollo.",
  },
  "3d672ed8-e190-4d50-a975-96e03594926e": {
    0: "Se desaconsejaría de forma absoluta el uso de cualquier vacuna de patógenos vivos o atenuados, atribuyendo este riesgo al uso crónico concomitante de broncodilatadores inhalados.",
    2: "Únicamente la vacuna antigripal (influenza) administrada de forma anual en cada temporada invernal, sin necesidad de ningún otro esquema de inmunización complementario.",
    3: "Vacunación rutinaria anual de carácter exclusivo contra la varicela y la fiebre amarilla, consideradas de aplicación mandatoria en todo paciente con EPOC establecido.",
  },
  "e431bbd8-2e58-4ebf-bb75-6d30c8a43344": {
    0: "Un gradiente de presión portal superior a 2 mmHg sería suficiente para la formación de várices, y superior a 5 mmHg para que ocurriera el sangrado activo variceal.",
    1: "Un gradiente de presión portal superior a 5 mmHg sería necesario para la formación de várices, y superior a 8 mmHg para que ocurriera el sangrado activo.",
    2: "Un gradiente de presión portal superior a 25 mmHg sería necesario para la formación de várices, y superior a 50 mmHg para que ocurriera el sangrado de tipo arterial.",
  },
  "eeb152ea-83fc-4579-91ff-108f43397005": {
    1: "Mieloma Múltiple Quiescente de alto riesgo, entidad que requeriría radioterapia urgente aplicada de forma profiláctica sobre la totalidad de la columna vertebral.",
    2: "Linfoma no Hodgkin de curso indolente, cuadro que requeriría el inicio inmediato de un esquema terapéutico de plasmaféresis.",
    3: "Mieloma Múltiple en su forma activa, entidad que requeriría el inicio inmediato de quimioterapia combinada con bortezomib y dexametasona.",
  },
  "d3f9fe55-7881-4a12-aec7-624320f37d27": {
    0: "Inducción con vancomicina administrada por vía oral durante 10 días, seguida de un mantenimiento con metronidazol de forma indefinida y continuada.",
    1: "Colectomía subtotal de urgencia, asociada a enemas de budesonida administrados de forma indefinida como tratamiento de mantenimiento.",
    2: "Monoterapia con Claritromicina administrada por vía oral durante un período único de 4 semanas, sin fase de mantenimiento posterior.",
  },
  "5accc332-9fce-4b22-b4be-0e3fcd41e611": {
    0: "Infusión de adrenalina por vía subcutánea de forma urgente, seguida de la administración de salmeterol nebulizado de acción prolongada.",
    2: "Iniciar de inmediato un antibiótico oral de amplio espectro, como la levofloxacina, administrado de forma aislada sin broncodilatadores.",
    3: "Glucocorticoides administrados por vía oral, combinados con una infusión continua de teofilina por vía intravenosa.",
  },
  "e6c2bda8-c953-4bf6-8d21-78f82e9d9f10": {
    0: "La bacteria consumiría el ácido cítrico presente en el medio de cultivo, provocando la precipitación ácida de las proteínas contenidas en él.",
    1: "La secreción de la citotoxina CagA inactivaría la bomba de protones gástrica, provocando de forma inmediata una aclorhidria local en el medio.",
    2: "La bacteria destruiría de forma directa a las células parietales del medio, provocando un aumento brusco de la acidez detectado por el indicador.",
  },
  "7663b5d6-e4c8-470c-b94c-84446584367d": {
    0: "Porque el fluido administrado disolvería de forma química el coágulo obstruido a nivel de la bifurcación de la arteria pulmonar principal.",
    2: "Para inducir una diuresis acuosa de tipo reflejo que reduciría la presión de perfusión a nivel del sistema venoso portal.",
    3: "Para diluir la concentración plasmática de hemoglobina y reducir de forma mecánica la viscosidad sanguínea circulante.",
  },
  "9aefdd84-7223-49b9-8d15-53f680e855fb": {
    0: "La filtración masiva de inmunoglobulina G de tipo lúpico a nivel de la membrana glomerular; el órgano afectado sería el hígado, confirmándose mediante biopsia hepática por vía transyugular.",
    1: "El depósito de cristales de oxalato de calcio a nivel del intersticio renal; el órgano más afectado sería la vejiga, confirmándose mediante biopsia uretral con tinción de Gram.",
    2: "El depósito extracelular de fragmentos Fc de inmunoglobulina G monoclonal propia de la enfermedad de Waldenström; el órgano afectado sería el bazo, confirmándose mediante punción-aspiración esplénica directa.",
  },
  "ffd63817-e8a8-43d4-973c-fdd3b2a3a83a": {
    0: "Realizar una paratiroidectomía de urgencia en el quirófano, con el objetivo de extirpar las glándulas suprarrenales hiperplásicas responsables del cuadro.",
    1: "Administración inmediata de diuréticos tiazídicos, como la hidroclorotiazida, utilizados a dosis consideradas inmunosupresoras.",
    2: "Restricción estricta de líquidos por vía endovenosa, con el objetivo de evitar la hemodilución, asociada a la administración inmediata de suplementos orales de calcio.",
  },
  "6b07bb9f-9ada-4b04-afa7-98cc1de709a3": {
    0: "Espasmo esofágico difuso complicado con reflujo gastroesofágico severo y una úlcera gástrica de localización posterior asociada.",
    2: "Infarto agudo de miocardio de cara inferior de forma aislada, secundario a una aterotrombosis de la arteria descendente anterior.",
    3: "Hematoma intramural de la aorta descendente (Stanford B), que asociaría una pericarditis aguda secundaria al roce de fricción pericárdica.",
  },
  "5c3a3dde-b9d1-40c4-a8cd-6d57b8337414": {
    1: "Solicitud de una radiografía de huesos largos de forma semestral, orientada a detectar osteosarcomas metastásicos de aparición activa en este contexto.",
    2: "Determinación anual del antígeno carcinoembrionario (CEA) sérico, asociada a una ecografía tiroidea realizada de forma trimestral.",
    3: "Cistoscopia urinaria de forma continua, con lavado vesical y estudio citológico realizado de forma anual como método de vigilancia.",
  },
  "c97d4f52-257a-445b-ae21-d008419841ca": {
    0: "El hematocrito normal descartaría por completo una hemorragia masiva, indicando que el estado de shock del paciente sería de origen puramente neurogénico.",
    1: "El paciente presentaría de forma concomitante una policitemia vera oculta de herencia autosómica, que neutralizaría de forma compensadora la caída esperada del hematocrito plasmático.",
    2: "La médula ósea del paciente habría compensado de forma instantánea la pérdida sanguínea mediante un pico reticulocitario hiperagudo, medible en cuestión de segundos tras el evento.",
  },
  "67b1c226-4c8c-46c7-84f0-26b1d8203cf6": {
    1: "Paciente A: Quimioterapia sistémica paliativa administrada de forma aislada y continua de por vida. Paciente B: Resección quirúrgica de urgencia mediante neumonectomía total izquierda, sin asociar radioterapia complementaria.",
    2: "Paciente A: Ablación por radiofrecuencia local del tumor, asociada a reposo domiciliario prolongado. Paciente B: Trasplante pulmonar unipulmonar izquierdo, asociado a un esquema de inmunosupresión sistémica.",
    3: "Ambos pacientes deberían ser tratados de forma exclusiva con inmunoterapia basada en inhibidores de checkpoint, utilizada como monoterapia de inicio en ambos casos.",
  },
  "3e509ae8-21ef-4bc9-9536-f2695b0a6d5b": {
    0: "Es un tumor de estirpe linfoplasmocitaria que secreta grandes cantidades de IgM de forma pentamérica, requiriendo de forma urgente una plasmaféresis profiláctica sistemática.",
    2: "Es un linfoma de curso indolente que no requeriría tratamiento activo hasta alcanzar estadios avanzados de la enfermedad, tratándose con aspirina y corticoides orales.",
    3: "Su origen sería exclusivamente de células T maduras reactivas CD3 positivas, tratándose de forma preferencial con cladribina administrada por infusión endovenosa continua.",
  },
  "271ab779-9f79-4fc8-a39b-044897f6dea0": {
    0: "Pertenecerían a la categoría Semicrítico, requiriendo de forma obligatoria una desinfección de alto nivel con glutaraldehído concentrado tras cada uso en el paciente.",
    1: "Pertenecerían a la categoría Crítico, requiriendo esterilización física mediante óxido de etileno antes de cada consulta médica realizada.",
    2: "Serían considerados residuos biológicos de tipo patogénico, de descarte obligatorio inmediato tras su exposición con la piel del paciente.",
  },
  "152a1721-cde7-4538-aabd-779e4f467a8f": {
    0: "Bloqueo de la filtración glomerular renal, que generaría una retención intrínseca de agua libre a nivel del túbulo distal de la nefrona.",
    1: "Inhibición de la síntesis hepática de albúmina, secundaria a una toxicidad directa del fármaco sobre el hepatocito.",
    2: "Daño endotelial de tipo inflamatorio directo, con lisis de las uniones estrechas capilares de origen alérgico local.",
  },
  "41111a37-8715-4ffe-9dda-b3a48138c017": {
    1: "Un cortocircuito (shunt) intrapulmonar de derecha a izquierda de carácter masivo, desencadenado por la atelectasia de absorción del nitrógeno alveolar residual.",
    2: "Un espasmo arterial cerebral directo, inducido por la hiperoxia, que inhibiría la síntesis del óxido nítrico endotelial a nivel de la corteza cerebral.",
    3: "Abolición del estímulo respiratorio hipóxico central a nivel del centro neumotáxico, secundaria a una estimulación vagal directa sobre dicho centro.",
  },
  "dc5bc5e7-74c8-4c7d-8823-1ac465d3b8a7": {
    0: "La infusión rápida de volumen estimularía de forma fisiológica la secreción de renina, la cual destruiría de forma directa a los receptores suprarrenales de aldosterona.",
    1: "La infusión salina de volumen debería provocar la máxima estimulación de la aldosterona plasmática, elevándola por encima de 100 ng/dL incluso en personas sanas sin patología.",
    2: "Se buscaría evaluar si el paciente desarrollaría un edema agudo de pulmón de carácter reversible, con el objetivo de documentar su reserva hemodinámica coronaria.",
  },
}
