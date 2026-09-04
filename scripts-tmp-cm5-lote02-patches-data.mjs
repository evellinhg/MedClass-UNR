// Patches manuais (não geradas por subagente, que travou 3x neste lote) para
// o viés de tamanho em clinica_medica_5, lote 02/11. Cada entrada só edita os
// índices de `opcoes` listados; indice_correta e o texto da alternativa
// correta nunca são tocados. `opcoes_comentario` só é editado nos poucos
// casos onde havia um bug de correspondência real (marcado com nota).
export const PATCHES = {
  "bf062ccc-cd64-42d1-b849-501d0c449644": {
    0: "Hipotiroidismo primario manifiesto, definido por TSH elevada asociada a T4 libre DISMINUIDA; se indicaría iniciar dosis plenas de levotiroxina (1.6 µg/kg/día) para normalizar rápidamente la función tiroidea.",
    1: "Síndrome del eutiroideo enfermo, un patrón de T3 baja con T4 y TSH normales o descendidos típico de pacientes críticos internados; correspondería suspender los controles tiroideos y repetirlos recién en la fase de convalecencia.",
    3: "Hipotiroidismo subclínico, pero con conducta expectante pura sin tratamiento hasta que la TSH supere el umbral de 10 mUI/L, reservando el inicio de levotiroxina solo para ese escenario más avanzado.",
  },
  "5c73b504-0dec-443e-acea-e7c5b046192a": {
    0: "Esquema 2HR/4H, es decir, 2 meses de Isoniacida y Rifampicina diaria seguidos de 4 meses de Isoniacida diaria de consolidación, omitiendo Pirazinamida y Etambutol en la fase intensiva inicial.",
    1: "Esquema de monoterapia con Estreptomicina intramuscular interdiaria durante exactamente 12 meses consecutivos, una modalidad terapéutica clásica previa a la introducción de los esquemas combinados actuales.",
    2: "Esquema de triple asociación con Amoxicilina, Claritromicina y Metronidazol diarios por 14 días bajo estricta observación domiciliaria, análogo al régimen utilizado para la erradicación de Helicobacter pylori.",
  },
  "a96c1596-d4e8-4083-b1ea-525725ff83cc": {
    0: "El metronidazol a dosis de 1.5 gramos diarios por vía endovenosa por 30 días, un nitroimidazol de reconocida acción bactericida anaeróbica y antiparasitaria frente a amebas y Giardia; contraindicado en la anemia ferropénica.",
    2: "El mebendazol oral a dosis fija de 100 mg cada 12 horas por un período de 14 días, antihelmíntico de acción intraluminal indicado para nematodos como áscaris y oxiuros, sin requerimiento de controles hepáticos.",
    3: "La ivermectina a dosis de 200 µg/kg en dosis única, antiparasitario de amplio espectro útil en ectoparasitosis como la sarna y en helmintiasis como la estrongiloidiasis; contraindicada de forma absoluta en el asma bronquial activa.",
  },
  "f6cdfc86-ec4c-4d5a-9ef4-bd801f318b63": {
    0: "La trombina, que se activa a partir de la protrombina y actúa como el procoagulante por excelencia al convertir el fibrinógeno en monómeros de fibrina soluble para formar el coágulo primario, liberando además productos de degradación gástrica.",
    1: "La hefestina intestinal, una ferroxidasa enterocitaria encargada del metabolismo de absorción de hierro, que se activaría a partir del plasminógeno y eliminaría de forma selectiva fosfolípidos ácidos basolaterales.",
    3: "El factor XIII, cuyo precursor sería el fibrinógeno y que liberaría monómeros de haptocorrina soluble al estabilizar e insolubilizar la malla de fibrina.",
  },
  "fd37cd1b-da0b-48a9-95a4-0c4b63e612bd": {
    0: "Inhibición directa de los canales de calcio del esfínter de Oddi, lo que disminuiría la resistencia mecánica hepatobiliar y con ello, de forma indirecta, la presión del sistema venoso portal.",
    1: "Bloqueo selectivo de receptores alfa-1 hepáticos, que promovería una vasodilatación sinusoidal directa masiva y reduciría así la resistencia intrahepática al flujo portal.",
    2: "Estimulación de receptores dopaminérgicos entéricos, que promovería la excreción directa urinaria de sodio y agua libre, disminuyendo indirectamente el volumen circulante y la presión portal.",
  },
  "9a7f77b5-3c27-48d0-b50e-aef1dea62200": {
    0: "Cristales de colesterol, con morfología característica de placas rectangulares con muescas en los ángulos, formados por hipercolesterolemia familiar homocigota no tratada.",
    2: "Cristales de urato monosódico, de morfología en aguja y birrefringencia fuertemente negativa, originados por una síntesis aumentada de ácido úrico secundaria al consumo elevado de carnes rojas.",
    3: "Cristales de pirofosfato cálcico, de morfología romboidal y birrefringencia débilmente positiva, depositados en el contexto de una hipofosfatasia primaria hereditaria.",
  },
  "842b6f97-9616-4905-a5ad-1a7b63a9998d": {
    0: "Prácticamente el 100% de los pacientes desarrollan diabetes insípida central de forma hiperaguda en los primeros dos meses del diagnóstico de base.",
    2: "La histiocitosis estimularía de forma crónica la síntesis hipotalámica de ADH, por lo que el cuadro cursaría siempre con un SIADH severo y orina concentrada en lugar de diluida.",
    3: "No existe ninguna relación patogénica descrita entre la Histiocitosis X y el desarrollo de diabetes insípida central a lo largo de la evolución de la enfermedad.",
  },
  "ef2b61ed-66e5-4ec2-9d44-e9f049c2006b": {
    0: "Ceftriaxona 2 g cada 24 horas EV en monoterapia por 7 días, esquema de elección clásico para la artritis gonocócica por Neisseria gonorrhoeae; si se sospecha SAMR, añadir ampicilina por vía oral.",
    1: "Penicilina G sódica 24 millones de unidades/día EV, esquema histórico de elección para la neurosífilis y la amigdalitis estreptocócica; si se sospecha SAMR, añadir estreptomicina durante las primeras 2 semanas.",
    2: "Clindamicina 600 mg cada 8 horas por vía oral de forma exclusiva durante 2 semanas en monoterapia, como alternativa práctica y ambulatoria al tratamiento endovenoso prolongado.",
  },
  "9716e0a2-6ab5-45fd-852a-a6b20fdb7afa": {
    0: "Cambiar el diagnóstico de base a lupus inducido por fármacos, dado el fallo terapéutico observado, y reiniciar el tratamiento con antihistamínicos dirigido a ese nuevo cuadro.",
    1: "Indicar pulsos diarios de ciclofosfamida oral de forma indefinida, duplicando la dosis habitual con el objetivo de superar la refractariedad celular observada tras el esquema inicial.",
    2: "Suspender de inmediato todo tratamiento médico activo dada la falta de respuesta y derivar a la paciente exclusivamente a cuidados paliativos.",
  },
  "c0dbd7dd-f4fe-4fc5-ba98-1fe94c62fbd7": {
    0: "Carcinoma suprarrenal primario autónomo, en el cual la producción autónoma de cortisol suprimiría de forma completa la ACTH plasmática hasta valores menores a 5-10 pg/mL, por un mecanismo de retroalimentación negativa ultrarrápida sobre el eje hipotálamo-hipofisario.",
    2: "Hiperplasia suprarrenal congénita por déficit de 11-beta-hidroxilasa, entidad caracterizada por acumulación de desoxicorticosterona y andrógenos suprarrenales, que se manifiesta clínicamente con virilización progresiva aislada, hipertensión arterial e hipopotasemia.",
    3: "Síndrome de Cushing Ectópico, en el cual el tumor neuroendocrino bronquial secretor de ACTH presentaría, de forma paradójica, una extrema sensibilidad a la supresión por glucocorticoides sintéticos administrados a dosis elevadas.",
  },
  "049509c3-c1c0-4118-bf7f-40ed23109cd5": {
    0: "Solicitar anticuerpos anti-ADN nativo y determinación del factor C1q del complemento sérico, estudios de utilidad clásica para el diagnóstico y seguimiento de la nefritis lúpica en pacientes con LES.",
    1: "Solicitar un perfil lipídico completo y anticuerpos antitiroglobulina y antiperoxidasa (TPO), útiles para el descarte de xantomas asociados a dislipidemia y de patología tiroidea autoinmune.",
    2: "Solicitar uricemia y su determinación en orina de 24 horas junto con creatinfosfoquinasa (CPK) total, estudios orientados a evaluar hiperuricemia y daño muscular, respectivamente.",
  },
  "ef0a7d43-e924-4dcf-9945-1f1aebe6b69a": {
    0: "Linfoma de Burkitt, asociado a la translocación t(8;14) con sobreexpresión del oncogén c-MYC, y con riesgo elevado de síndrome de lisis tumoral precoz espontáneo dado su comportamiento clínicamente muy agresivo desde el inicio.",
    1: "Leucemia Mieloide Aguda, neoplasia mieloide caracterizada por sobreexpresión del gen NPM1 y por la presencia de blastos leucémicos superiores al 20% en médula ósea, con riesgo elevado de coagulopatía intravascular diseminada severa.",
    2: "Linfoma del Manto, entidad que asocia de forma patognomónica la translocación t(11;14) con sobreexpresión de ciclina D1, y que conlleva riesgo característico de poliposis linfomatosa intestinal invasiva.",
  },
  "c04a1aa8-a1c4-406b-b1ca-bb646dd0ba37": {
    1: "Shock Obstructivo por taponamiento cardíaco traumático diferido, en el cual la compresión progresiva del corazón por el derrame pericárdico generaría típicamente taquicardia extrema compensatoria e ingurgitación yugular marcada.",
    2: "Shock Cardiogénico agudo por rotura miocárdica de origen reflejo, secundario a una falla aguda de la función de bomba cardíaca equivalente a la observada tras un infarto agudo de miocardio extenso.",
    3: "Shock Hipovolémico hemorrágico agudo por sangrado intratecal, cuadro que se compensaría de forma refleja mediante taquicardia severa y vasoconstricción periférica intensa por estimulación simpática.",
  },
  "35aaa32f-03b0-481b-ae6e-87a3d7ad1416": {
    0: "Positividad para marcadores de estirpe muscular lisa como la desmina y la actina de músculo liso (SMA), hallazgo característico de neoplasias mesenquimatosas contráctiles como el leiomiosarcoma.",
    1: "Presencia de marcadores mesoteliales específicos como Calretinina, Wilms Tumor-1 (WT1) y Podoplanina, propios del mesotelioma pleural maligno asociado clásicamente a la exposición ocupacional al asbesto.",
    3: "Marcadores de diferenciación de células plasmáticas como CD138 e inmunoglobulina IgG de restricción clonal, hallazgos característicos de proliferaciones clonales plasmocitarias como el mieloma múltiple.",
  },
  "fee47a57-5cb8-4e1a-bc06-873923e8a96b": {
    0: "Reemplazar de forma completa e inmediata los requerimientos de nutrición enteral del paciente mediante la absorción de nutrientes a través de la mucosa respiratoria humidificada.",
    2: "Lograr una desnitrogenación total y sostenida del espacio alveolar que anularía por completo el requerimiento fisiológico de surfactante pulmonar endógeno.",
    3: "Permitir la administración exclusiva de oxígeno seco y frío, con el objetivo de inducir una vasoconstricción local de tipo cicatrizal en la mucosa de la vía aérea.",
  },
  "65cb24af-604c-4d11-af45-eefe6e65fe54": {
    0: "Dexametasona por vía endovenosa en infusión continua, corticoide sistémico de alta potencia sin selectividad ileal; los corticoides deberían continuarse de por vida a dosis estables para prevenir las recidivas del brote.",
    2: "Beclometasona por vía tópica rectal, asumiendo que la totalidad de la enfermedad de Crohn se localiza preferentemente en la mucosa anal y rectal profunda, de forma análoga a la colitis ulcerosa distal.",
    3: "Prednisona oral de forma indefinida, combinada con suplementos profilácticos de hierro por vía endovenosa para prevenir la anemia asociada al uso crónico de corticoides sistémicos.",
  },
  "38a7e35e-31d4-4a5b-93c0-d8615082cd6b": {
    1: "Inyección endovenosa continua de dosis terapéuticas plenas de heparina no fraccionada de bajo peso molecular, fármaco que acelera la neutralización de la trombina por la antitrombina III en la cascada de la coagulación.",
  },
  "3f059c18-01cb-4737-83d5-1247b11d1d05": {
    0: "Monoartritis de rodilla de carga con líquido articular de características no inflamatorias; en este contexto se sospecharía Borrelia burgdorferi como agente causal y se preferiría solicitar radiología convencional con incidencia de Schüller para el estudio inicial.",
    2: "Poliartritis simétrica migratoria de manos de instalación aguda; se sospecharía infección por parvovirus B19 y se preferiría realizar una ecografía bidimensional Doppler de partes blandas sin contraste para guiar el diagnóstico.",
    3: "Oligoartritis asimétrica destructiva de las articulaciones interfalángicas distales; se sospecharía Pasteurella multocida como agente causal y se preferiría solicitar una gammagrafía ósea con Tecnecio 99 para localizar el foco.",
  },
  "332c5308-1647-4aff-a1d3-83a90d8ac14c": {
    0: "Quimismo gástrico basal y estimulado con pentagastrina de control, prueba invasiva que evalúa cuantitativamente la secreción de ácido clorhídrico gástrico del paciente.",
    2: "Determinación cualitativa de pepsinógeno I en sangre, considerando que su elevación en el contexto post-tratamiento confirmaría la persistencia activa de la bacteria en la mucosa gástrica.",
    3: "Serología para anticuerpos IgG anti-H. pylori, asumiendo que la ausencia de anticuerpos específicos detectados en sangre tras el tratamiento confirmaría de forma fiable la erradicación bacteriana.",
  },
  "71d4b3fa-5d6e-4c2d-851e-34a822acd6c7": {
    1: "Suspender de inmediato la anticoagulación durante 48 horas en pleno período agudo del TEP para poder extraer la muestra de sangre sin interferencias farmacológicas, reanudando luego la terapia anticoagulante habitual.",
    2: "Realizar los estudios de trombofilia de forma urgente dentro de las primeras 24 horas del evento agudo, bajo el argumento de que los niveles de los factores procoagulantes se encuentran en ese momento máximamente elevados.",
    3: "Realizar los estudios exclusivamente mientras el paciente se encuentra recibiendo dosis máximas acumuladas de acenocumarol, asumiendo que este fármaco estabilizaría in vitro los niveles de antitrombina.",
  },
  "c6cbf2c0-31be-411a-9605-2d6d79406bd5": {
    1: "Esofagitis eosinofílica severa, entidad que cursaría con anillos esofágicos concéntricos y estrías longitudinales típicas en pacientes jóvenes con antecedentes atópicos; tratamiento de elección con budesonida tópica deglutida.",
    2: "Esofagitis herpética por HSV-1, caracterizada endoscópicamente por múltiples úlceras pequeñas 'en sacabocados' de bordes bien definidos separadas por mucosa sana; tratamiento de elección con Aciclovir por vía endovenosa.",
    3: "Esofagitis por citomegalovirus (CMV), que se presentaría con úlceras gigantes, únicas o múltiples, profundas y de trayecto longitudinal; tratamiento de primera línea con Ganciclovir endovenoso.",
  },
  "87d7b972-060d-4d2f-b254-0d6c1ee4c51d": {
    0: "Disección de la arteria carótida interna derecha, cuadro que puede manifestarse con cefalea focal ipsilateral, síndrome de Horner y síntomas visuales transitorios; se debería realizar una angiografía cerebral por sustracción digital de forma inmediata e indicar infusión continua de heparina no fraccionada.",
    1: "Glaucoma agudo de ángulo cerrado, entidad oftalmológica que cursa típicamente con dolor ocular extremo, ojo rojo de consistencia pétrea a la palpación y pupila en midriasis media arreactiva; se debería indicar pilocarpina oftálmica tópica junto con iridotomía láser periférica de urgencia.",
    3: "Migraña clásica refractaria al tratamiento analgésico habitual; se debería indicar ergotamina por vía endovenosa de forma inmediata y realizar una punción lumbar diagnóstica para descartar meningitis concomitante.",
  },
  "688b1480-6b39-46b1-ac63-084173aa3004": {
    1: "Recurrencia de la Enfermedad de Crohn sobre el reservorio ileal, producida por el depósito de inmunocomplejos en el segmento de íleon proximal previamente sano; requeriría la resección quirúrgica urgente del reservorio afectado.",
    2: "Síndrome de intestino corto postquirúrgico, atribuible a la atrofia vellositaria progresiva por desuso entérico del segmento remanente; se trataría únicamente mediante una dieta baja en residuos de forma sostenida.",
    3: "Colitis pseudomembranosa del reservorio por Clostridioides difficile; requeriría el inicio de una infusión continua de vancomicina por vía endovenosa a dosis elevadas.",
  },
  "a3173c0e-6f2a-4dca-9a0e-1cdb53e4745d": {
    0: "Sí, se debería iniciar de inmediato tratamiento antibiótico con amoxicilina-clavulánico, justificado únicamente por la edad avanzada del paciente como factor de riesgo independiente.",
    1: "Sí, se deberían indicar antibióticos empíricos a todo paciente con EPOC que refiera cualquier incremento, por mínimo que sea, de su disnea habitual respecto del basal.",
    3: "No, la indicación de antibióticos en la exacerbación de EPOC exigiría de forma obligatoria la demostración de infiltrados pulmonares nuevos en la radiografía de tórax.",
  },
  "9a69abff-c431-4371-8300-cb1e0836d761": {
    1: "Área valvular mitral menor de 1.0 cm2 con un gradiente diastólico medio mayor de 10 mmHg, valores que corresponden en realidad a los criterios ecocardiográficos clásicos de severidad de la estenosis MITRAL.",
    2: "Área valvular aórtica menor de 2.0 cm2 o un gradiente medio transvalvular sistólico menor de 20 mmHg, valores que en realidad corresponden al rango de una estenosis aórtica leve, muy por debajo del umbral establecido de severidad.",
    3: "Presencia de un flujo regurgitante diastólico masivo en el tracto de salida con un tiempo de hemipresión (PHT) menor de 200 ms, hallazgo ecocardiográfico específico de severidad de la insuficiencia aórtica y no de la estenosis.",
  },
  "9144d67b-04bc-4636-a4f1-9b5e72362bcc": {
    0: "No cumple los criterios, ya que los partos prematuros ocurridos por preeclampsia o eclampsia estarían explícitamente excluidos de la definición de morbilidad obstétrica del Síndrome Antifosfolipídico.",
    2: "Solo cumple de forma parcial por el antecedente trombótico venoso, ya que la pérdida fetal recurrente espontánea del primer trimestre carecería de valor diagnóstico independiente en esta enfermedad.",
    3: "No cumple los criterios, debido a que el diagnóstico requeriría de forma obligatoria la coexistencia simultánea de trombosis arterial cerebral e infarto agudo de miocardio.",
  },
  "570da267-b616-406c-952f-a5db9cd65502": {
    1: "Colectomía segmentaria limitada exclusivamente al colon descendente, preservando el resto del marco cólico y el recto sin resecar.",
    2: "Coloproctectomía total con ileostomía definitiva de Brooke, técnica que eximiría al paciente de cualquier seguimiento endoscópico futuro de por vida al eliminar la totalidad del colon y recto.",
    3: "Colectomía total con anastomosis ileorrectal, preservando el recto sin necesidad de seguimiento endoscópico posterior del muñón rectal remanente.",
  },
  "a23f1143-ca0d-417b-b820-5bcade15a9e8": {
    0: "Debido a la secreción paraneoplásica de hormona antidiurética (ADH) por parte de las células endoteliales de la pared aórtica disecada, generando un cuadro de SIADH agudo severo.",
    1: "Porque el compromiso de la aorta ascendente causa de forma sistemática isquemia mesentérica distal por oclusión directa de la arteria mesentérica inferior.",
    3: "Debido a la alta prevalencia de obstrucción linfática mediastínica con desarrollo consecuente de linfedema agudo de ambos miembros superiores.",
  },
  "c6b5dbe4-3773-4d06-ae7c-c6ddc3693d77": {
    0: "Peritonitis bacteriana primaria espontánea (PBE), producida por la translocación bacteriana de Escherichia coli a través de la pared intestinal en el contexto de una ascitis cirrótica masiva preexistente.",
    1: "Peritonitis química de origen urémico, producida por la acumulación intraluminal de cristales de oxalato tras la rotura traumática de la vejiga y el consecuente derrame de orina hacia la cavidad libre.",
    2: "Peritonitis tuberculosa de curso crónico, caracterizada por una ascitis de predominio linfocítico con niveles elevados de adenosina deaminasa (ADA) en el líquido peritoneal.",
  },
  "76ed3cfe-d8c5-486a-a84b-fca287e35496": {
    0: "Aumento en la excreción fraccional de potasio a nivel de la nefrona proximal, de carácter exclusivamente pasivo, secundario a la esclerosis progresiva de los glomérulos remanentes.",
    1: "Degradación masiva y constitutiva de la bomba Na-K-ATPasa de la membrana de los eritrocitos, lo que retendría el potasio en su interior de forma compensatoria.",
    3: "Atrofia selectiva y progresiva de la corteza suprarrenal, que anularía por completo la acción periférica de los mineralocorticoides sobre el manejo renal del potasio.",
  },
  "88ef8b7f-9a35-47ed-8ef5-9b01fb5d9867": {
    1: "Porque la levotiroxina bloquearía de forma irreversible los receptores adrenales de cortisol a nivel retiniano, provocando ceguera permanente por necrosis de la retina.",
    2: "Porque las hormonas tiroideas deberían administrarse exclusivamente por vía endovenosa asociadas a fludrocortisona, con el objetivo de evitar el desarrollo de un bocio multinodular secundario.",
    3: "Porque la hidrocortisona inactivaría por completo la acción de la tiroxina sobre sus receptores periféricos, anulando la efectividad global del tratamiento sustitutivo tiroideo.",
  },
  "6bb3d811-d925-4f8b-9f8c-bab8751b792a": {
    0: "Ceftriaxona combinada con azitromicina por vía oral, sin agregar corticoides, esquema estándar dirigido a los gérmenes típicos y atípicos de la neumonía adquirida en la comunidad.",
    1: "Pentamidina inhalada de forma mensual junto con oxigenoterapia de alto flujo administrada de manera aislada, sin asociar tratamiento antimicrobiano sistémico.",
    2: "Ganciclovir por vía endovenosa asociado a metilprednisolona, dirigido al control de una neumonitis viral activa por citomegalovirus.",
  },
  "2bd944d7-1ad4-4ff9-b62b-9e363d0b64ba": {
    0: "La velocidad de incremento de la bilirrubina plasmática es superior a 5 mg/dL por día, reflejando una hemólisis activa y sostenida en el neonato.",
    2: "La ictericia aparece dentro de las primeras 12 a 24 horas posteriores al nacimiento, siendo este el momento típico de presentación del cuadro fisiológico.",
    3: "La ictericia persiste de forma ininterrumpida por más de 3 semanas, acompañada de coluria y acolia, como parte de la evolución natural y esperada del cuadro fisiológico.",
  },
  "62b4eceb-1d7d-49cc-bbc7-1857cc647745": {
    1: "Erisipela del miembro inferior derecho, secundaria a una obstrucción linfática aguda causada por Streptococcus pyogenes, con edema de predominio inflamatorio.",
    2: "Rotura de un quiste de Baker poplíteo, con extravasación del líquido sinovial hacia los planos de la fascia posterior de la pierna.",
    3: "Edema angioneurótico idiopático de presentación unilateral, mediado por el depósito tisular local de inmunoglobulinas de tipo IgE.",
  },
  "3a1b5169-4317-47ec-a560-a0597061f04e": {
    0: "Estudio genético de la mutación JAK2, orientado a descartar una trombocitemia esencial coexistente como causa alternativa de la anemia ferropénica.",
    2: "Estudio del gen regulador de la conductancia transmembrana de la fibrosis quística (CFTR); si resultara positivo, permitiría descartar por completo el diagnóstico de enfermedad celíaca.",
    3: "Cariotipo convencional con bandas G, orientado a detectar una trisomía del cromosoma 21 no diagnosticada previamente en la paciente.",
  },
  "fca37a9a-9b0d-4241-875d-b9b9674d3f96": {
    0: "Falsos positivos por el consumo de lácteos pasteurizados y suplementos de calcio; falsos negativos por la ingesta continuada de AINEs, que aceleran el tránsito gastrointestinal.",
    1: "Falsos positivos asociados al ayuno prolongado de más de 48 horas; falsos negativos por la presencia de anticuerpos monoclonales anti-globina humana séricos circulantes en el colon.",
    2: "No existirían falsos positivos ni negativos, ya que el reactivo de guayaco se uniría de forma covalente e irreversible exclusivamente a la transferrina humana del colon proximal.",
  },
  "c78dae19-ec7a-4d68-87de-15d0ae3c7077": {
    0: "Infarto agudo de miocardio con elevación del ST de cara anterior, clasificación funcional de Killip y Kimball IV.",
    1: "Ruptura espontánea de esófago distal (Síndrome de Boerhaave), con clasificación de Mackler positiva.",
    3: "Tromboembolismo pulmonar masivo, con una clasificación de Wells de probabilidad alta.",
  },
  "be4d9afb-894e-4a35-b719-df09567d29bb": {
    0: "Duplicar la dosis a 30 mg/día cada vez que la paciente realice ejercicio físico moderado, con el objetivo de prevenir microlesiones musculares inducidas por el esfuerzo.",
    2: "Suspender de forma abrupta e inmediata el tratamiento con prednisona, con el fin de evitar la supresión sostenida del eje adrenal.",
    3: "Mantener la dosis fija de 15 mg/día de forma indefinida durante los primeros 5 años de seguimiento, sin realizar ningún descenso progresivo de dosis.",
  },
  "8db81b6f-f2da-4e19-8ce3-173fb6ba7e3e": {
    1: "Insuficiencia renal aguda de tipo obstructivo, secundaria a la precipitación urinaria de cristales de bismuto.",
    2: "Bloqueo auriculoventricular de tercer grado de instalación inmediata, atribuido al depósito agudo de material amiloide extracelular en el sistema de conducción.",
    3: "Fibrosis pulmonar intersticial difusa e irreversible, asociada a cardiotoxicidad de tipo secundaria a antraciclinas.",
  },
  "9f3a87bc-5529-4142-a5b1-0cc29f07bdce": {
    0: "La realización de una ligadura de la arteria esplénica de urgencia mediante laparotomía exploradora inmediata, sin límite de tiempo establecido para el procedimiento.",
    1: "La inyección masiva de 50 mL de adrenalina periesofágica a ciegas, administrada a través de la piel de la región distal del cuello.",
    2: "La inducción de hipotermia sistémica moderada mediante inmersión corporal en agua helada, mantenida de forma continua durante 48 horas.",
  },
  "8bc7feb9-3490-4e22-be78-b72ade72ed7e": {
    0: "Hepatopatía crónica subyacente clasificada como Child-Pugh C, asociada a una úlcera péptica gástrica de localización proximal.",
    1: "Cualquier úlcera duodenal posterior que presente un tamaño superior a 1 cm, independientemente de la respuesta obtenida al tratamiento médico o endoscópico instaurado.",
  },
  "5476b45a-68c6-4da9-8137-4964595c3d5e": {
    0: "Pericarditis constrictiva, en la cual el chasquido representaría el frote pericárdico característico auscultado durante la fase de diástole tardía.",
    1: "Estenosis aórtica congénita de válvula bicúspide de grado leve, asociada a un pulso periférico de tipo parvus et tardus.",
    2: "Insuficiencia mitral severa de instalación aguda, en la cual el chasquido cercano al segundo ruido indicaría la rotura del músculo papilar anterior.",
  },
  "6570fd34-17e4-4c19-9edd-c77eb490f3cf": {
    1: "Se definen por una proliferación lítica bacteriana intestinal de curso crónico que deprime de forma transitoria a los megacariocitos medulares, con evolución benigna y espontánea en 48 horas.",
    2: "Son el resultado exclusivo de mutaciones de novo del gen de la espectrina en el cromosoma X de pacientes jóvenes, sin riesgo de malignización hematológica asociado.",
    3: "Asocian de manera característica al debut hematomas musculares gigantes e indoloros del psoas, con KPTT y TP normales, evolucionando posteriormente hacia hemólisis por crioaglutininas de rango térmico frío.",
  },
  "379ddd27-85b6-4828-9e26-b484278960d3": {
    1: "Escleroterapia con alcohol absoluto de forma aislada, considerada la terapia de primera línea actual por su bajo índice reportado de perforación gástrica.",
    2: "Aplicación exclusiva de argón plasma (APC), evitando las sondas de contacto térmico dado que estas causarían fístulas aortoentéricas de forma masiva.",
    3: "Inyección exclusiva de solución fisiológica fría, considerando que la hipotermia local inducida detendría el sangrado arterial en la totalidad de los casos.",
  },
  "74ccd514-f303-401a-b2e8-0ad86b5b5047": {
    1: "Signo de Murphy, hallazgo semiológico que sugeriría una localización apendicular de tipo mesocelíaca.",
    2: "Maniobra del obturador, cuya positividad sugeriría una apendicitis de localización retroperitoneal pura.",
    3: "Signo de Cullen, cuya presencia sugeriría una apendicitis de localización pélvica profunda.",
  },
  "8ead4a66-9b07-424a-b591-fecad95d4697": {
    0: "La saliva posee una concentración de transcortina (CBG) sumamente elevada, que estabilizaría de forma artificial al cortisol libre y permitiría su medición directa mediante radioinmunoanálisis.",
    1: "La saliva de los pacientes con Cushing es particularmente rica en glucosa libre, lo que estimularía de forma cruzada la secreción compensatoria de la glándula parótida.",
    2: "La producción salival de cortisol a la medianoche dependería de forma exclusiva del feedback positivo ejercido por la progesterona de origen ovárico.",
  },
  "e06a36b1-4750-4f36-9e92-2e394a57494d": {
    0: "Tiroidectomía total de urgencia, seguida de una ablación empírica inmediata con yodo radiactivo (I-131), sin confirmación citológica previa.",
    2: "Iniciar un tratamiento sustitutivo de prueba con dosis plenas de levotiroxina, con el objetivo de suprimir la TSH y reducir el tamaño del nódulo, repitiendo la ecografía de control en 12 meses.",
    3: "Solicitud de una gammagrafía tiroidea urgente con tecnecio-99, orientada a descartar un adenoma tóxico autónomo ('nódulo caliente') como causa del hallazgo.",
  },
  "d677e04c-d4c9-4f67-aec9-a59b504183f1": {
    1: "Soplo de Rivero-Carvallo, hallazgo que confirmaría el diagnóstico de una estenosis tricuspídea asociada a cortocircuito interauricular.",
    2: "Soplo de Austin-Flint, que confirmaría una insuficiencia aórtica severa asociada a una estenosis mitral de tipo funcional.",
    3: "Soplo de Carey-Coombs, que confirmaría una valvulitis mitral aguda de origen reumático en fase febril activa.",
  },
  "274c1bf6-81a2-41fc-8c6e-186e9635b418": {
    0: "Colocación inmediata de una derivación portosistémica transyugular (TIPS) de urgencia en la guardia, sin expansión plasmática previa.",
    2: "Realizar paracentesis evacuadora y expandir la volemia de forma exclusiva con dextrano de bajo peso molecular, administrado en dosis fijas de 100 mL.",
    3: "Administración de una infusión continua de terlipresina asociada a restricción absoluta de líquidos, sin realizar paracentesis evacuadora.",
  },
  "3e1af59c-05ae-4be8-ba9e-270656bdaed8": {
    0: "La rápida corrección del sodio destruiría de forma directa las vainas de mielina del puente de Varolio, por un fenómeno de desmielinización osmótica central.",
    1: "La dextrosa al 5% causaría una acidosis láctica cerebral selectiva que destruiría de forma irreversible los astrocitos de la corteza motora.",
    3: "El sodio sérico descendió por debajo de su umbral crítico de polarización de los canales de calcio presinápticos de la corteza cerebral.",
  },
  "6108783d-f9b5-44cd-a692-3eea9d9ab0be": {
    0: "Derivar de urgencia a cirugía para realizar una anastomosis porto-cava profiláctica de tipo selectiva.",
    2: "Iniciar carvedilol a dosis máximas de 25 mg/día, asociado a tratamiento profiláctico mensual con ceftriaxona por vía endovenosa.",
    3: "Iniciar de inmediato ligadura endoscópica con bandas de forma ambulatoria, dado el riesgo elevado de resangrado atribuido a estas várices.",
  },
  "9ab51e1c-60a7-451b-90fe-3469bcfffdf7": {
    0: "Inmersión en formaldehído al 10% durante 12 horas, utilizando virus latentes de Hepatitis B como patrón estandarizado de control biológico.",
    1: "Irradiación gamma acelerada, utilizando quistes viables de Entamoeba histolytica como patrón biológico de destrucción celular.",
    3: "Calor seco mediante estufa de Pasteur, utilizando esporas de Clostridium tetani como patrón estandarizado de control biológico.",
  },
  "08e80352-ac29-4489-8b49-22e658713b3c": {
    1: "Tos seca de carácter progresivo de 3 meses de evolución, rinitis crónica de tipo mucosa y dolor retroesternal difuso.",
    2: "Prurito generalizado persistente, astenia de intensidad marcada y dolor en las adenopatías desencadenado tras el consumo de alcohol.",
    3: "Aparición de eritema nudoso en ambos miembros inferiores, náuseas de predominio matutino y debilidad muscular de localización proximal.",
  },
  "77a5e15f-31b2-42a9-8dc8-ab861efd22e1": {
    0: "Intoxicación aguda por antidepresivos tricíclicos, mediada por bloqueo de la recaptación de serotonina; se confirmaría mediante el dosaje de litio sérico.",
    1: "Síndrome anticolinérgico agudo por intoxicación con Atropa belladona, producido por estimulación del sistema parasimpático; se confirmaría mediante examen de orina de 24 horas para atropina.",
    2: "Shock anafiláctico secundario a picadura de insectos himenópteros, producido por liberación masiva de histamina de origen endotelial; se confirmaría mediante biopsia de piel.",
  },
  "f869aa34-7cd4-4fa3-a518-842176205191": {
    0: "Está contraindicado por el riesgo inminente de inducir una acidosis láctica metabólica secundaria a un bloqueo renal del metabolismo de la piridoxina.",
    1: "Está contraindicado porque se asociaría a un riesgo del 100% de inducir una pancreatitis aguda hemorrágica por reflujo biliar.",
    3: "Está contraindicado debido a que el flumazenil metabolizaría al diazepam en metabolitos tóxicos hepáticos, capaces de producir una insuficiencia hepática fulminante.",
  },
  "2c005987-3ce0-49f6-a48e-c834b4c6a05c": {
    1: "Producción ectópica de TSH homóloga por parte de células pluripotenciales de un teratoma ovárico (Struma ovarii).",
    2: "Destrucción autoinmune selectiva mediada por linfocitos T CD8+ citotóxicos dirigidos contra los receptores de TSH, impidiendo de forma permanente la síntesis de hormonas tiroideas.",
    3: "Mutación de ganancia de función de carácter somático en el gen del receptor de TSH, que provocaría su activación constitutiva independiente de ligandos autoinmunes.",
  },
  "96d0e195-f89d-44f3-bdde-26ac3914f5ef": {
    0: "Supresión del eje hipotálamo-hipófiso-adrenal por el uso crónico de corticoides inhalados, considerándose un defecto de origen puramente hipotalámico central.",
    1: "Insuficiencia suprarrenal de causa secundaria, en la cual la respuesta de la aldosterona se mantendría normalizada porque la zona glomerular dependería del eje hipotálamo-hipofisario anterior.",
    2: "Resistencia periférica completa al receptor de glucocorticoides de tipo 2, caracterizada por una hiperplasia adrenal masiva compensatoria.",
  },
  "eb8b64e5-42bc-4a7e-8c0f-718d5155fe3f": {
    0: "El lavado requeriría 30 minutos de inmersión pasiva de las manos, mientras que la fricción con alcohol exigiría un secado inmediato mediante aire caliente.",
    1: "Ambos procedimientos deberían realizarse por un tiempo mínimo idéntico de 5 minutos continuos, utilizando un cepillo de cerdas duras.",
    3: "Lavado con agua y jabón durante 10 segundos; fricción con solución de alcohol durante 5 segundos.",
  },
  "667af1b4-0be1-4002-975d-bc1b60e839f5": {
    1: "El déficit de cortisol estimularía de forma selectiva a las enzimas del ciclo de la urea, acumulando amonio gaseoso que precipitaría como lactato de amonio en el suero.",
    2: "El cortisol bloquearía de forma constitutiva a la enzima lactato deshidrogenasa; su ausencia promovería la síntesis masiva de lactato a pesar de mantenerse una excelente perfusión tisular.",
    3: "La falta de corticoides impediría la filtración del lactato a nivel de los glomérulos renales, acumulándose de forma pasiva en el compartimiento extracelular.",
  },
  "1d12ed67-07cf-488e-b5c4-34ece3b773b0": {
    1: "Ausencia completa de linfocitos T intraepiteliales, con hiperplasia asociada de folículos B; se asociaría al desarrollo de un linfoma de Burkitt.",
    2: "Fenotipo de linfocitos T normales, con coexpresión conservada de CD3, CD4 y CD8; se asociaría al desarrollo de un adenocarcinoma gástrico de tipo difuso.",
    3: "Infiltración masiva de células plasmáticas productoras de IgG4; se asociaría al desarrollo de una colangitis autoinmune de tipo esclerosante.",
  },
  "c58210fe-f4de-4e56-82fd-02e3376d0439": {
    0: "La presencia de anticuerpos confirmaría de forma inequívoca la curación definitiva de la enfermedad, permitiendo suspender el control por imágenes de seguimiento.",
    1: "Se debería suspender de inmediato el aporte de levotiroxina, considerando que el anticuerpo destruiría la hormona exógena administrada.",
    2: "El hallazgo de Anti-Tg elevados indicaría la conversión del carcinoma diferenciado en un linfoma primario de tiroides agresivo, refractario al tratamiento quirúrgico.",
  },
  "0665ae36-52e2-4276-83ca-6a5e56b72565": {
    0: "Es patognomónico de la rotura traumática de un quiste hidatídico hepático hacia la cavidad peritoneal libre.",
    1: "Indica una colecistitis aguda litiásica supurada con empiema vesicular, secundaria a la impactación de un cálculo en el conducto cístico.",
    2: "Se produce por una hepatitis aguda viral autolimitada que generaría una distensión compensadora refleja de la arteria cística.",
  },
  "54a0459a-233b-4dcb-b197-c92e43a4740c": {
    0: "Duplicar la dosis de metimazol, con el objetivo de acelerar el aclaramiento de las hormonas tiroideas que estarían consumiendo a los leucocitos circulantes.",
    1: "Continuar el metimazol por vía oral, bajo cobertura estricta con corticoides sistémicos administrados a dosis inmunosupresoras plenas.",
    2: "Rotar de inmediato el tratamiento a Propiltiouracilo a dosis equivalentes, asumiendo que no existiría reactividad cruzada para esta complicación hematológica.",
  },
  "a6bc4df6-7d48-482b-a6dc-00637f1af9dd": {
    0: "Indicar de forma inmediata el implante de un cardiodesfibrilador automático (CDI), asumiendo que el paciente posee un riesgo de muerte del 100% en las próximas semanas.",
    2: "No realizar ninguna intervención farmacológica ni de dispositivos, dado que el paciente se encuentra asintomático y el riesgo de muerte súbita sería inexistente en clase funcional I.",
    3: "Efectuar de forma urgente una ablación por catéter empírica de toda la región apical del ventrículo izquierdo, y suspender la levotiroxina de forma definitiva.",
  },
  "e2b6a4e7-0c7c-4447-a274-14735026d1ed": {
    0: "Es una neoplasia gástrica in situ de carácter multifocal; se trata mediante gastrectomía total profiláctica de urgencia.",
    2: "Se genera por el depósito de inmunocomplejos circulantes de tipo IgG; se trata de forma exclusiva con corticoides administrados a altas dosis (prednisona 1 mg/kg).",
    3: "Es un proceso inflamatorio de base infecciosa por Helicobacter pylori; se trata mediante terapia concomitante cuádruple con bismuto.",
  },
  "830635d0-070c-4982-afc1-18f8708f7f04": {
    0: "Síndrome de sobrellenado nefrótico secundario a una glomerulonefritis membranosa.",
    1: "Edema medicamentoso puro, secundario al consumo crónico de corticoides sistémicos.",
    2: "Edema de origen linfático de instalación aguda en el postoperatorio.",
  },
  "39ab4f04-3933-4b3b-8504-6fc9e0e6b23e": {
    1: "Están indicadas con el objetivo de disolver de forma física e inmediata el trombo plaquetario ya organizado a nivel de la arteria femoral común.",
    2: "Las estatinas actuarían estimulando la síntesis pancreática de insulina, reduciendo de forma directa la glucotoxicidad a nivel infrapatelar.",
    3: "Su único efecto sería prevenir de forma local la absorción micelar de vitaminas liposolubles a nivel del íleon terminal.",
  },
  "355ef205-1ed5-4c25-883b-3cb33f5ced26": {
    0: "Recuento absoluto de leucocitos totales superior a 1000/mm³ con predominio linfocitario; siendo el patógeno más común el Mycobacterium tuberculosis.",
    1: "Presencia de abundantes esporas micóticas de Candida albicans en el líquido ascítico, con recuento de PMN dentro de valores normales.",
    3: "Cultivo polimicrobiano positivo para Bacteroides fragilis y Clostridium perfringens, asociado a un recuento de PMN inferior a 100/mm³.",
  },
  "f59fe918-39e7-4a0d-be2b-9d3c70945e6f": {
    0: "La vasoconstricción sistémica inicial, mediada por la liberación de endotelina-1, provocaría un aumento compensatorio del gasto cardíaco con incremento de la diuresis.",
    1: "La filtración capilar glomerular aumentaría de forma brusca por la pérdida del tono de la arteriola aferente, provocando una poliuria de tipo refractario.",
    3: "La síntesis excesiva de vasopresina de origen central destruiría de forma directa las acuaporinas tipo 2 presentes en los túbulos colectores renales.",
  },
  "5fe866e6-3785-4c59-92a1-133193c58e00": {
    0: "Linfoma esofágico primario; se asocia de forma exclusiva a la infección por Helicobacter pylori y se localiza preferentemente en la unión gastroesofágica.",
    1: "Adenocarcinoma de esófago; se asocia de forma clásica al tabaquismo pesado y ocurre de manera predominante en el tercio superior del esófago.",
    3: "Gastroblastoma mucinoso; secundario a la ingesta crónica y sostenida de antiácidos a base de calcio.",
  },
  "919dbf2f-51fd-4563-aaa6-88664a4fa109": {
    0: "Estenosis aórtica severa de origen reumático calcificado, que asociaría un taponamiento pericárdico de curso crónico.",
    2: "Disección de aorta descendente (Stanford B), que comprimiría de forma mecánica el esófago y la arteria pulmonar izquierda.",
    3: "Hematoma intramural estable, tratado con dosis excesivas de diuréticos de asa.",
  },
  "d47ae2c3-3368-4a9d-a325-5c470a193190": {
    0: "Previene de forma absoluta la adquisición de la tuberculosis pulmonar en la edad adulta; su única contraindicación sería un peso al nacer inferior a 4 kg.",
    2: "Es una vacuna sintética recombinante de tipo acelular, que se asociaría a un 99% de riesgo de inducir una hepatitis fulminante bacteriana por reflujo biliar.",
    3: "Su único fin sería negativizar la prueba de PPD para facilitar el ingreso escolar del niño, sin poseer ninguna contraindicación clínica de relevancia.",
  },
  "8895da7f-0d6c-4efb-8d2b-f147109186d8": {
    1: "Necrosis isquémica miocárdica de tipo focal, producida por microespasmo coronario inducido por la acumulación tisular de yodo radioactivo.",
    2: "Infiltración directa de células acidófilas tumorales hipofisarias de localización ectópica en el septum interventricular distal.",
    3: "Se produce por un depósito extracelular amiloide masivo de cadenas pesadas de inmunoglobulinas, estimuladas de forma cruzada por el exceso de GH.",
  },
  "6aa68207-71a5-4589-a316-82a1e64cf055": {
    0: "Efectuar una tiroidectomía descompresiva de urgencia, con el objetivo de liberar la vía aérea colapsada por el mixedema perilaríngeo restrictivo.",
    2: "Iniciar de inmediato una infusión de solución fisiológica hipertónica al 3% para corregir el sodio a una velocidad mayor a 2 mEq/L por hora, combinada con diuréticos de asa.",
    3: "Iniciar una infusión rápida de levotiroxina endovenosa a dosis de 500 µg en bolo de forma aislada, y calentar de forma activa a la paciente con mantas térmicas de alta presión.",
  },
  "8060afa8-022a-46cc-aa9c-18c0dc987116": {
    0: "El AINE estimularía la bomba H-K-ATPasa, atrapando protones de cloro en el citoplasma celular y destruyendo directamente sus organelos.",
    1: "La inhibición de la COX-2 disminuiría el recuento plaquetario de forma selectiva a nivel de las fositas gástricas.",
    3: "El AINE se uniría al receptor de gastrina, impidiendo la salida de sodio y agua de la célula y causando un edema celular de tipo osmótico.",
  },
  "c9e1d33c-4add-4db4-9960-1480c666066e": {
    0: "Metronidazol 500 mg cada 8 horas asociado a Bismuto 120 mg cada 6 horas, administrados como monoterapia combinada aislada durante 21 días.",
    1: "IBP a dosis convencional una vez al día por la mañana, asociado a Amoxicilina 1 g tres veces al día, durante un período acortado de 5 días.",
    3: "IBP a dosis estándar cada 12 horas, asociado a Levofloxacina 500 mg cada 24 horas y Tetraciclina 500 mg cada 6 horas, durante 7 días.",
  },
  "ce99e5bd-19f9-4a84-bd14-ef9cea760de1": {
    1: "Loperamida, administrada inmediatamente antes de introducir el endoscopio, con el objetivo de abolir el peristaltismo a nivel colónico.",
    2: "Omeprazol en bolo, actuando como proquinético directo que aceleraría el vaciamiento gástrico en menos de 5 minutos.",
    3: "Neostigmina endovenosa en bolo, con el objetivo de inducir una contracción masiva del esfínter esofágico inferior y detener el sangrado por compresión mecánica.",
  },
  "6ea8fbf9-58fd-49ac-ae57-4d69d4d6c27d": {
    1: "El alcohol disminuiría la absorción intestinal de purinas dietarias, pero bloquearía de forma absoluta la resorción ósea mediada por los osteoclastos.",
    2: "El alcohol destruiría las células miodérmicas del bazo que contienen xantina deshidrogenasa, bloqueando de forma secundaria la filtración de la bilis.",
    3: "El alcohol activaría la vía de las pentosas fosfato reduciendo la síntesis de la enzima PRPP sintetasa, lo que precipitaría los cristales por hipocomplementemia tisular activa.",
  },
  "08a0b3ef-d7a7-45dc-8088-8fbf4cc627fa": {
    1: "La destrucción de la corteza adrenal liberaría pigmentos de lipofuscina que viajarían por el torrente circulatorio y se depositarían de forma física en los queratinocitos basales de la piel.",
    2: "La alta concentración de potasio sérico activaría de forma directa la transcripción del gen de la tirosinasa a nivel de la dermis superficial.",
    3: "El déficit de aldosterona generaría una vasoconstricción periférica extrema, que acumularía metabolitos oxidados de tonalidad oscura en la epidermis.",
  },
  "53e818cd-728f-44e7-a929-cd1f81327df8": {
    0: "Déficit de Antitrombina III; la warfarina estimularía de forma directa la agregación de plaquetas gigantes a nivel de la microcirculación capilar dérmica.",
    2: "Trombocitopenia inducida por heparina de tipo II; el acenocumarol induciría la síntesis hepática de anticuerpos IgG dirigidos contra el factor plaquetario 4 (FP4).",
    3: "Mutación del Factor V de Leiden; los corticoides inducirían una resistencia tisular periférica transitoria a los anticoagulantes orales.",
  },
}

// bug de correspondência real encontrado ao ler o lote (não é vies de
// tamanho): as opções [2] e [3] de 8bc7feb9 tinham os comentários trocados
// entre si -- o comentário "Correcto" estava na opção errada (vagotomía) e
// o "Incorrecto" na opção que na verdade é a correta.
export const COMENTARIO_FIXES = {
  "8bc7feb9-3490-4e22-be78-b72ade72ed7e": {
    2: "Incorrecto. En la cirugía de urgencia por HDA, el único objetivo es detener el sangrado de forma rápida y segura (control de daños). Intentar realizar procedimientos curativos complejos simultáneos (como vagotomías o antrectomías) prolonga el tiempo operatorio de forma innecesaria e incrementa drásticamente la morbimortalidad en un paciente críticamente inestable.",
    3: "Correcto. Según las pautas de la cátedra, las indicaciones clásicas de cirugía de urgencia en la HDA no varicosa son: 1) hemorragia grave no compensada tras la reposición de volumen inicial y requerimiento de transfusión de >=4 unidades de sangre; 2) hemorragia persistente compensada en la que fracasó la hemostasia endoscópica; y 3) hemorragia recidivante grave que reinicia tras un segundo intento de tratamiento endoscópico fallido. El objetivo principal de la cirugía en agudo es únicamente la hemostasia local directa (controlar el sangrado) para disminuir la mortalidad.",
  },
}
