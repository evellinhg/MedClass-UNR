"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, RotateCcw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AmbientBackground } from "./ambient-background"
import { useLanguage } from "@/lib/i18n"

interface DemoQuestion {
  area: string
  statement: string
  options: string[]
  correctIndex: number
  explanation: string
}

// As questões do quiz permanecem sempre em português: refletem a prova real do Enamed/Revalida, que é aplicada em português.
const questions: DemoQuestion[] = [
  {
    area: "Clínica Médica",
    statement:
      "Homem, 58 anos, hipertenso, comparece à consulta de rotina com pressão arterial de 168x104 mmHg em duas aferições distintas, sem sintomas associados. Já usa losartana 50mg 2x/dia com boa adesão. Qual a conduta mais adequada?",
    options: [
      "Manter a dose atual e reavaliar em 6 meses.",
      "Associar um segundo anti-hipertensivo de classe diferente (ex: anlodipino).",
      "Suspender a losartana e iniciar betabloqueador isolado.",
      "Solicitar apenas mudança de estilo de vida, sem ajuste medicamentoso.",
    ],
    correctIndex: 1,
    explanation:
      "Com PA não controlada em uso otimizado de monoterapia, a conduta preconizada é a associação de um segundo fármaco de classe distinta, potencializando o efeito anti-hipertensivo.",
  },
  {
    area: "Pediatria",
    statement:
      "Lactente de 8 meses é levado à UBS para consulta de puericultura. A mãe relata que a criança já senta sem apoio, mas ainda não engatinha. Nesse contexto do desenvolvimento neuropsicomotor, a conduta é:",
    options: [
      "Encaminhar imediatamente para neurologia infantil por atraso grave.",
      "Considerar dentro da normalidade e manter acompanhamento de rotina.",
      "Solicitar neuroimagem para investigar possível paralisia cerebral.",
      "Iniciar fisioterapia motora obrigatória antes dos 12 meses.",
    ],
    correctIndex: 1,
    explanation:
      "Sentar sem apoio ocorre por volta dos 6-8 meses e engatinhar entre 8-10 meses; a ausência de engatinhar aos 8 meses está dentro da faixa esperada de desenvolvimento.",
  },
  {
    area: "Cirurgia",
    statement:
      "Paciente de 34 anos dá entrada no PS com dor abdominal em fossa ilíaca direita há 18 horas, associada a náuseas e febre baixa. Ao exame, dor à descompressão em ponto de McBurney. Qual a hipótese diagnóstica mais provável e a conduta inicial?",
    options: [
      "Diverticulite aguda; iniciar antibioticoterapia ambulatorial.",
      "Apendicite aguda; indicar apendicectomia após estabilização.",
      "Cólica renal; solicitar apenas analgesia e liberar para casa.",
      "Gastroenterite aguda; hidratação oral e observação domiciliar.",
    ],
    correctIndex: 1,
    explanation:
      "Dor em FID com sinais de irritação peritoneal em ponto de McBurney é o quadro clássico de apendicite aguda, cujo tratamento definitivo é cirúrgico.",
  },
  {
    area: "Ginecologia",
    statement:
      "Mulher de 45 anos relata ciclos menstruais irregulares há 8 meses, com fogachos e sudorese noturna ocasional. Nega sangramento intenso ou dor pélvica. Qual a principal hipótese e conduta inicial?",
    options: [
      "Climatério; orientação e acompanhamento, sem necessidade de exames imediatos.",
      "Gravidez ectópica; solicitar beta-hCG e USG transvaginal de urgência.",
      "Miomatose uterina; indicar histerectomia.",
      "Hiperplasia endometrial; biópsia endometrial obrigatória imediata.",
    ],
    correctIndex: 0,
    explanation:
      "O quadro de irregularidade menstrual associada a sintomas vasomotores em mulher de 45 anos é característico da transição menopáusica (climatério), quadro clínico que não exige investigação de urgência.",
  },
  {
    area: "Medicina Preventiva",
    statement:
      "Em uma Unidade Básica de Saúde, identifica-se um surto de 6 casos de diarreia aguda em crianças da mesma escola em uma semana. Qual a primeira medida de saúde pública a ser tomada pela equipe?",
    options: [
      "Aguardar mais casos para confirmar se realmente é um surto.",
      "Notificar o caso às autoridades sanitárias e iniciar investigação epidemiológica.",
      "Encaminhar todos os casos diretamente para internação hospitalar.",
      "Prescrever antibiótico empírico para todas as crianças da escola.",
    ],
    correctIndex: 1,
    explanation:
      "Diante de agregação de casos sugestiva de surto, a conduta correta é a notificação compulsória imediata e a investigação epidemiológica, para identificar a fonte e conter a disseminação.",
  },
]

export function QuizDemo() {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[current]
  const isLast = current === questions.length - 1

  function handleConfirm() {
    if (selected === null) return
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
    <section className="relative overflow-hidden bg-[#0a0a0a] py-24">
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

        {/* Progress dots */}
        {!finished && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 max-w-16 rounded-full transition-colors duration-300 ${
                  i < current
                    ? "bg-[#c6ff3a]"
                    : i === current
                      ? "bg-[#c6ff3a]"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!finished ? (
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
                <span className="rounded-full border border-[#c6ff3a]/30 bg-[#c6ff3a]/10 px-2.5 py-1 text-[#bef264]">
                  {question.area}
                </span>
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

              {confirmed && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-pretty rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-relaxed text-white/50"
                >
                  {question.explanation}
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
          ) : (
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
                {score >= 4 ? t.quiz.resultGood : t.quiz.resultBad}
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
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
