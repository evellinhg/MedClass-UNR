"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, RotateCcw, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AmbientBackground } from "./ambient-background"
import { useLanguage } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"

interface DemoQuestion {
  materia: string
  statement: string
  options: string[]
  correctIndex: number
  explanation: string
}

const DEMO_QUESTION_COUNT = 5

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function QuizDemo() {
  const { t } = useLanguage()
  const [questions, setQuestions] = useState<DemoQuestion[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  async function loadQuestions() {
    setQuestions(null)
    setLoadError(false)

    const { data, error } = await supabase
      .from("questoes")
      .select("enunciado, opcoes, indice_correta, materia, opcoes_comentario")
      .eq("ativo", true)

    if (error || !data || data.length === 0) {
      setLoadError(true)
      return
    }

    const picked = shuffle(data).slice(0, DEMO_QUESTION_COUNT)
    setQuestions(
      picked.map((q) => ({
        materia: t.cronograma.materiaLabel[q.materia as string] ?? q.materia ?? "",
        statement: q.enunciado,
        options: q.opcoes,
        correctIndex: q.indice_correta,
        explanation: q.opcoes_comentario?.[q.indice_correta] ?? "",
      }))
    )
  }

  useEffect(() => {
    loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const question = questions?.[current]
  const isLast = questions !== null && current === questions.length - 1

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
    loadQuestions()
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

        {!questions && !loadError && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-white/50">
            <Loader2 className="h-6 w-6 animate-spin text-[#c6ff3a]" />
            <p className="text-sm">{t.quiz.loading}</p>
          </div>
        )}

        {loadError && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-sm text-white/50">{t.quiz.error}</p>
            <Button
              onClick={loadQuestions}
              variant="ghost"
              className="rounded-full border border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              {t.quiz.restart}
            </Button>
          </div>
        )}

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

                  {confirmed && question.explanation && (
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
