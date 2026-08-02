"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AmbientBackground } from "./ambient-background"
import { useLanguage } from "@/lib/i18n"

interface DemoQuestion {
  materiaKey: string
  statement: string
  options: string[]
  correctIndex: number
  explanations: string[]
}

// Conjunto fixo de questões reais do banco, iguais para todos os visitantes
// (não sorteadas), pra manter a demonstração da landing leve e previsível.
const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    materiaKey: "crescimento_desenvolvimento",
    statement: "La selección natural es:",
    options: [
      "la reproducción diferencial de los individuos portadores de distintos genotipos de una población, en interacción con su ambiente",
      "el éxito reproductivo diferencial que resulta de la interacción entre los organismos y su ambiente",
      "a+b son correctas",
      "a+b son falsas",
    ],
    correctIndex: 2,
    explanations: [
      "Incorrecta. La afirmación es verdadera y define la selección natural desde el punto de vista genético poblacional, pero no es la única correcta.",
      "Incorrecta. La afirmación también es verdadera y define la selección natural clásica, pero no es la única correcta.",
      "¡Correcta! Ambas alternativas (A y B) son formas válidas y complementarias de describir la selección natural. Esta actúa a través del éxito reproductivo diferencial basado en la interacción del genotipo/fenotipo con las presiones del ambiente.",
      "Incorrecta. Las alternativas A y B son científicamente correctas.",
    ],
  },
  {
    materiaKey: "nutricao",
    statement: "El epitelio del esófago es",
    options: [
      "Estratificado plano queratinizado",
      "Estratificado plano no queratinizado",
      "Estratificado plano",
      "Simple cúbico",
    ],
    correctIndex: 1,
    explanations: [
      "Incorrecto. El epitelio queratinizado es típico de la piel, no del esófago.",
      "Correcto. El esófago está revestido por epitelio estratificado plano no queratinizado, que protege contra la abrasión de los alimentos.",
      "Incorrecto. Falta especificar que es no queratinizado, que es la característica distintiva del epitelio esofágico.",
      "Incorrecto. El epitelio simple cúbico se encuentra en glándulas y túbulos, no en el esófago.",
    ],
  },
  {
    materiaKey: "sexualidade_genero_reproducao",
    statement: "Cuál de las siguientes medidas es correcta en relación a la anatomía del útero:",
    options: ["Altura 7 cm", "Espesor 10 cm", "Ancho 12 cm", "Altura 25 cm"],
    correctIndex: 0,
    explanations: [
      "Correcto. La altura (longitud) normal del útero es de aproximadamente 7 cm en la mujer nulípara.",
      "Incorrecto. El espesor del útero es de aproximadamente 2 a 3 cm, no 10 cm.",
      "Incorrecto. El ancho del útero es de aproximadamente 4 a 5 cm, no 12 cm.",
      "Incorrecto. 25 cm sobreestima ampliamente la altura real del útero, que es de aproximadamente 7 cm.",
    ],
  },
  {
    materiaKey: "trabalho_tempo_livre",
    statement: "Los receptores simpáticos en el músculo liso bronquiolar son:",
    options: ["Beta 1", "Beta 2", "Alfa 1", "Alfa 2"],
    correctIndex: 1,
    explanations: [
      "Incorrecto. Beta 1 son cardíacos, no bronquiales.",
      "Correcto. El músculo liso bronquiolar tiene receptores BETA 2. Su activación produce BRONCODILATACIÓN (relajación del músculo liso).",
      "Incorrecto. Alfa 1 produce contracción del músculo liso vascular.",
      "Incorrecto. Alfa 2 son autorreceptores presinápticos.",
    ],
  },
  {
    materiaKey: "ser_humano_meio",
    statement: "¿Cuál es el límite que separa el peritoneo medial del lateral o zona 1 y 2?",
    options: [
      "Línea imaginaria que pasa por el vértice de las vértebras.",
      "Línea imaginaria que pasa por los cuerpos vertebrales.",
      "Prolongación de la línea axilar anterior.",
      "Línea imaginaria que pasa por las apófisis espinosas de las vértebras.",
    ],
    correctIndex: 1,
    explanations: [
      "Incorrecta. No es el reparo anatómico clásico utilizado para delimitar las zonas del retroperitoneo.",
      "¡Correcta! El límite entre la zona 1 (medial) y la zona 2 (lateral) del retroperitoneo está dado por una línea imaginaria que pasa por los cuerpos vertebrales.",
      "Incorrecta. Esa línea delimita la zona 2 (lateral) de la zona 3 (pélvica), no la zona 1 de la 2.",
      "Incorrecta. Las apófisis espinosas no constituyen el reparo estándar para esta división retroperitoneal.",
    ],
  },
  {
    materiaKey: "injuria",
    statement: "Todos los siguientes enunciados respecto a los fármacos que son ácidos débiles son correctos, excepto:",
    options: [
      "Tienden a acumularse en zonas de pH alto",
      "Estos fármacos se unen principalmente a la albúmina",
      "En el tratamiento de la intoxicación con los mismos podría resultar útil acidificar la orina",
      "El pKa de los mismos es próximo a 7.4",
    ],
    correctIndex: 2,
    explanations: [
      "Es una afirmación verdadera (no es la excepción buscada). Los ácidos débiles se ionizan más en un medio con pH superior a su pKa; al ionizarse pierden liposolubilidad y quedan atrapados (ion trapping) en el compartimento de pH alto, por lo que tienden a acumularse allí.",
      "Es una afirmación verdadera (no es la excepción buscada). La mayoría de los fármacos ácidos débiles se unen predominantemente a la albúmina plasmática, la proteína transportadora principal para compuestos ácidos.",
      "Esta es la afirmación incorrecta (la excepción buscada). Para tratar una intoxicación por un ácido débil conviene alcalinizar la orina, no acidificarla: al elevar el pH urinario por encima del pKa del fármaco, este se ioniza más, pierde reabsorción tubular y queda atrapado en la orina, favoreciendo su excreción.",
      "Es una afirmación verdadera (no es la excepción buscada). El pKa de la mayoría de los fármacos ácidos débiles de uso clínico suele encontrarse en un rango cercano al pH fisiológico, lo que determina su grado de ionización en el organismo.",
    ],
  },
  {
    materiaKey: "defesa",
    statement: "Marque la opción correcta con respecto a ulcera duodenal:",
    options: [
      "Duele cuando el paciente consume alimentos.",
      "Suele dar vómitos.",
      "Da pérdida significativa de peso.",
      "Suele dar frecuentemente dolor nocturno.",
    ],
    correctIndex: 3,
    explanations: [
      "Incorrecto. El dolor de la úlcera duodenal típicamente mejora con la ingesta de alimentos (se calma con la comida y reaparece horas después).",
      "Incorrecto. No es un síntoma característico de la úlcera duodenal.",
      "Incorrecto. Los pacientes con úlcera duodenal suelen ganar peso debido a que comen para calmar el dolor, a diferencia de la gástrica.",
      "¡Correcto! Es característico de la úlcera duodenal el dolor nocturno o con el estómago vacío (despierta al paciente de madrugada).",
    ],
  },
  {
    materiaKey: "clinica_medica_4",
    statement: "El contorno radiológico del mediastino derecho está constituido, de superior a inferior, por:",
    options: [
      "Vena innominada derecha, vena cava inferior y aurícula derecha",
      "Vena innominada derecha, vena cava superior, aurícula derecha y vena cava inferior",
      "Vena innominada izquierda, vena cava superior y aurícula izquierda",
      "Vena innominada izquierda, cayado aórtico y ventrículo izquierdo",
    ],
    correctIndex: 1,
    explanations: [
      "Incorrecta. Esta opción omite un componente clave del contorno mediastínico derecho: la vena cava superior, que se ubica entre la vena innominada derecha y la aurícula derecha.",
      "Correcta. El contorno del mediastino derecho en la radiografía de tórax está constituido, de superior a inferior, por la vena innominada (braquiocefálica) derecha, la vena cava superior, la aurícula derecha y, en su porción más inferior, la sombra de la vena cava inferior.",
      "Incorrecta. La vena innominada izquierda, la vena cava superior y la aurícula izquierda no conforman el contorno del mediastino DERECHO.",
      "Incorrecta. La vena innominada izquierda, el cayado aórtico y el ventrículo izquierdo constituyen estructuras del contorno del mediastino IZQUIERDO, no del derecho.",
    ],
  },
  {
    materiaKey: "otorrinolaringologia",
    statement: "Indique cuál es la causa por la que los pacientes adultos presentan otitis con derrame seroso unilateral.",
    options: [
      "Un proceso neoplásico de la rinofaringe produce compresión o invasión de la trompa de Eustaquio.",
      "Por la disposición de la trompa de Eustaquio horizontal y de mayor diámetro.",
      "La adenoiditis compromete el orificio nasal de la trompa de Eustaquio y ocasiona este derrame.",
      "Se debe a un mecanismo autoinmune por alteración del complejo mayor y activación de mecanismos inflamatorios luego de una otitis media aguda.",
    ],
    correctIndex: 0,
    explanations: [
      "Correcto. Ante una otitis media serosa UNILATERAL en el adulto, la primera sospecha es un proceso neoplásico de la rinofaringe (linfoma o carcinoma nasofaríngeo, asociado a EBV) que comprime o invade la trompa de Eustaquio, impidiendo la ventilación del oído medio.",
      "Incorrecto. La disposición horizontal y de mayor diámetro de la trompa de Eustaquio corresponde al LACTANTE y al niño pequeño, no al adulto.",
      "Incorrecto. La adenoiditis compromete el orificio NASAL de la trompa de Eustaquio y es causa típica de otitis serosa en la INFANCIA, no en el adulto.",
      "Incorrecto. La otitis media serosa postinflamatoria suele ser bilateral y de resolución espontánea; no existe un mecanismo autoinmune primario que explique un derrame unilateral del adulto.",
    ],
  },
]

export function QuizDemo() {
  const { t } = useLanguage()
  const questions = useMemo(
    () =>
      DEMO_QUESTIONS.map((q) => ({
        ...q,
        materia: t.cronograma.materiaLabel[q.materiaKey] ?? q.materiaKey,
      })),
    [t]
  )
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[current]
  const isLast = current === questions.length - 1

  function handleConfirm() {
    if (selected === null || !question) return
    setConfirmed(true)
    if (selected === question.correctIndex) setScore((s) => s + 1)
  }

  function handleNext() {
    if (isLast) {
      setFinished(true)
      return
    }
    setCurrent((c) => c + 1)
    setSelected(null)
    setConfirmed(false)
  }

  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setConfirmed(false)
    setScore(0)
    setFinished(false)
  }

  return (
    <section className="relative overflow-hidden bg-[#12140f] py-24">
      <AmbientBackground />

      <div className="relative mx-auto max-w-3xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 px-4 py-1.5 text-sm text-[#c6ff3a]">
            {t.quiz.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.quiz.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            {t.quiz.subtitle}
          </p>
        </motion.div>

        {questions && (
          <>
            {/* Progress dots */}
            {!finished && (
              <div className="mb-6 flex items-center justify-center gap-2">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 max-w-16 rounded-full transition-colors duration-300 ${
                      i <= current ? "bg-[#c6ff3a]" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!finished && question ? (
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm sm:p-8"
                >
                  <div className="mb-1 flex items-center justify-between text-xs text-white/40">
                    <span>{t.quiz.questionLabel} {current + 1} {t.quiz.of} {questions.length}</span>
                    {question.materia && (
                      <span className="rounded-full border border-[#c6ff3a]/30 bg-[#c6ff3a]/10 px-2.5 py-1 text-[#bef264]">
                        {question.materia}
                      </span>
                    )}
                  </div>

                  <p className="mb-6 mt-4 text-pretty text-lg font-medium leading-relaxed text-white">
                    {question.statement}
                  </p>

                  <div className="space-y-3">
                    {question.options.map((option, i) => {
                      const isSelected = selected === i
                      const isCorrect = confirmed && i === question.correctIndex
                      const isWrong = confirmed && isSelected && i !== question.correctIndex

                      return (
                        <button
                          key={i}
                          disabled={confirmed}
                          onClick={() => setSelected(i)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                            isCorrect
                              ? "border-green-400/50 bg-green-500/10 text-green-200"
                              : isWrong
                                ? "border-red-400/50 bg-red-500/10 text-red-200"
                                : isSelected
                                  ? "border-[#c6ff3a]/50 bg-[#c6ff3a]/10 text-white"
                                  : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.05]"
                          } ${confirmed ? "cursor-default" : "cursor-pointer"}`}
                        >
                          <span>{option}</span>
                          {isCorrect && <Check className="h-4 w-4 shrink-0 text-green-400" />}
                          {isWrong && <X className="h-4 w-4 shrink-0 text-red-400" />}
                        </button>
                      )
                    })}
                  </div>

                  {confirmed && selected !== null && question.explanations[selected] && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-pretty rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-relaxed text-white/50"
                    >
                      {question.explanations[selected]}
                    </motion.p>
                  )}

                  <div className="mt-6 flex justify-end">
                    {!confirmed ? (
                      <Button
                        onClick={handleConfirm}
                        disabled={selected === null}
                        className="rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d] disabled:opacity-40"
                      >
                        {t.quiz.confirm}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
                      >
                        {isLast ? t.quiz.seeResult : t.quiz.next}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : finished ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-sm sm:p-12"
                >
                  <p className="text-sm font-medium uppercase tracking-wide text-[#bef264]">{t.quiz.resultLabel}</p>
                  <p className="mt-3 text-6xl font-extrabold text-white">
                    {score}<span className="text-white/30">/{questions.length}</span>
                  </p>
                  <p className="mx-auto mt-4 max-w-md text-white/50">
                    {score >= Math.ceil(questions.length * 0.6) ? t.quiz.resultGood : t.quiz.resultBad}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={handleRestart}
                      variant="ghost"
                      className="rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t.quiz.restart}
                    </Button>
                    <Button
                      asChild
                      className="rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
                    >
                      <Link href="#pricing">{t.quiz.ctaFinal}</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  )
}
