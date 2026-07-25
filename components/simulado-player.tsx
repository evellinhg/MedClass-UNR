"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircleQuestion,
  SkipForward,
  Strikethrough,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { calculatePoints } from "@/lib/scoring"
import { getPlanStatus, incrementTrialUsage, FREE_SIMULADO_MAX_QUESTIONS, type PlanStatus } from "@/lib/plan-status"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { HighlightableText } from "@/components/highlightable-text"
import { PlanRestrictedNotice } from "@/components/plan-restricted-notice"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Questao {
  id: string
  enunciado: string
  opcoes: string[]
  indice_correta: number
  materia: string | null
  area: string | null
  justificativa: string | null
  mecanismo_pergunta: string | null
  mecanismo_opcoes: string[] | null
  mecanismo_indice_correta: number | null
}

export interface SimuladoConfig {
  label: string
  count: number
  areas?: string[]
  dificuldade?: string
  prova?: string
  timerEnabled?: boolean
  mode?: "individual" | "simulado"
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

interface SimuladoPlayerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: SimuladoConfig | null
}

type Phase = "loading" | "playing" | "empty" | "finished" | "blocked"

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const BONUS_POINTS = 10

export function SimuladoPlayer({ open, onOpenChange, config }: SimuladoPlayerProps) {
  const [phase, setPhase] = useState<Phase>("loading")
  const [questions, setQuestions] = useState<Questao[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null)
  const [eliminated, setEliminated] = useState<Set<number>[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [confirmingFinish, setConfirmingFinish] = useState(false)
  const [saving, setSaving] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const [mechanismStage, setMechanismStage] = useState<"hidden" | "asking" | "resolved">("hidden")
  const [mechanismAnswer, setMechanismAnswer] = useState<number | null>(null)
  const [mechanismCorrectByQuestion, setMechanismCorrectByQuestion] = useState<Record<number, boolean>>({})
  const [bonusPoints, setBonusPoints] = useState(0)

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const [result, setResult] = useState<{ points: number; correct: number; wrong: number; answered: number } | null>(
    null
  )
  const [blockedStatus, setBlockedStatus] = useState<PlanStatus | null>(null)

  useEffect(() => {
    if (!open || !config) return

    setPhase("loading")
    setCurrentIndex(0)
    setConfirmingFinish(false)
    setResult(null)
    setStartedAt(Date.now())
    setElapsed(0)
    setPendingAnswer(null)
    setMechanismStage("hidden")
    setMechanismAnswer(null)
    setMechanismCorrectByQuestion({})
    setBonusPoints(0)
    setFeedbackOpen(false)
    setFeedbackSent(false)
    setBlockedStatus(null)

    const mode = config.mode ?? "individual"

    getPlanStatus().then((status) => {
      if (!status) return

      if (!status.hasFullAccess) {
        const blocked =
          status.isTrialExpired ||
          (mode === "simulado" && status.simuladosRemaining <= 0) ||
          (mode === "individual" && status.questoesRemaining <= 0)
        if (blocked) {
          setBlockedStatus(status)
          setPhase("blocked")
          return
        }
      }

      const effectiveCount = status.hasFullAccess
        ? config.count
        : mode === "simulado"
          ? Math.min(config.count, FREE_SIMULADO_MAX_QUESTIONS)
          : Math.min(config.count, status.questoesRemaining)

      let query = supabase
        .from("questoes")
        .select(
          "id, enunciado, opcoes, indice_correta, materia, area, justificativa, mecanismo_pergunta, mecanismo_opcoes, mecanismo_indice_correta"
        )
        .limit(200)
      if (config.areas && config.areas.length > 0) query = query.in("area", config.areas)
      if (config.dificuldade && config.dificuldade !== "aleatorio") query = query.eq("dificuldade", config.dificuldade)
      if (config.prova) query = query.eq("prova", config.prova)

      query.then(({ data }) => {
        const pool = (data as Questao[]) ?? []
        const shuffled = shuffle(pool).slice(0, effectiveCount)
        setQuestions(shuffled)
        setAnswers(new Array(shuffled.length).fill(null))
        setEliminated(shuffled.map(() => new Set<number>()))
        setPhase(shuffled.length === 0 ? "empty" : "playing")

        if (shuffled.length > 0 && !status.hasFullAccess) {
          incrementTrialUsage(mode === "simulado" ? "simulado" : "questao", mode === "simulado" ? 1 : shuffled.length)
        }
      })
    })
  }, [open, config])

  useEffect(() => {
    if (!open || !config?.timerEnabled || phase !== "playing") return
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [open, config?.timerEnabled, phase, startedAt])

  const current = questions[currentIndex]
  const currentAnswer = answers[currentIndex] ?? null
  const answeredCount = answers.filter((a) => a !== null).length
  const currentEliminated = eliminated[currentIndex] ?? new Set<number>()

  const selectPending = (optionIdx: number) => {
    if (currentAnswer !== null) return
    if (currentEliminated.has(optionIdx)) return
    setPendingAnswer(optionIdx)
  }

  const toggleEliminate = (optionIdx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentAnswer !== null) return
    setEliminated((prev) => {
      const next = [...prev]
      const set = new Set(next[currentIndex])
      if (set.has(optionIdx)) set.delete(optionIdx)
      else {
        set.add(optionIdx)
        if (pendingAnswer === optionIdx) setPendingAnswer(null)
      }
      next[currentIndex] = set
      return next
    })
  }

  const confirmAnswer = () => {
    if (pendingAnswer === null || !current) return
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = pendingAnswer
      return next
    })
    const isCorrect = pendingAnswer === current.indice_correta
    setPendingAnswer(null)

    if (isCorrect && current.mecanismo_pergunta && current.mecanismo_opcoes?.length) {
      setMechanismStage("asking")
      setMechanismAnswer(null)
    } else {
      setMechanismStage("resolved")
    }
  }

  const answerMechanism = (idx: number) => {
    if (mechanismAnswer !== null || !current) return
    setMechanismAnswer(idx)
    const isCorrect = idx === current.mecanismo_indice_correta
    setMechanismCorrectByQuestion((prev) => ({ ...prev, [currentIndex]: isCorrect }))
    if (isCorrect) setBonusPoints((b) => b + BONUS_POINTS)
  }

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)))
    setConfirmingFinish(false)
    setPendingAnswer(null)
    setMechanismStage(answers[index] !== null ? "resolved" : "hidden")
    setMechanismAnswer(null)
  }

  const skip = () => {
    const next = answers.findIndex((a, i) => a === null && i > currentIndex)
    if (next !== -1) return goTo(next)
    const fromStart = answers.findIndex((a) => a === null)
    if (fromStart !== -1) return goTo(fromStart)
    goTo(currentIndex + 1)
  }

  const finish = async () => {
    if (answeredCount < questions.length && !confirmingFinish) {
      setConfirmingFinish(true)
      return
    }

    const correct = questions.filter((q, i) => answers[i] === q.indice_correta).length
    const wrong = answeredCount - correct
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    const points = calculatePoints({ correct, wrong, totalQuestions: answeredCount, durationSeconds }) + bonusPoints

    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user && answeredCount > 0) {
      await supabase.from("simulado_attempts").insert({
        user_id: userData.user.id,
        subject: config?.areas?.join(", ") ?? config?.label ?? null,
        total_questions: answeredCount,
        correct_count: correct,
        wrong_count: wrong,
        duration_seconds: durationSeconds,
        points,
      })
    }
    setSaving(false)
    setResult({ points, correct, wrong, answered: answeredCount })
    setPhase("finished")
  }

  const sendFeedback = async () => {
    if (!feedbackText.trim() || !current) return
    setSendingFeedback(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from("question_feedback").insert({
        question_id: current.id,
        user_id: userData.user.id,
        message: feedbackText.trim(),
      })
    }
    setSendingFeedback(false)
    setFeedbackSent(true)
    setFeedbackText("")
  }

  const accuracy = useMemo(() => {
    if (!result || result.answered === 0) return 0
    return Math.round((result.correct / result.answered) * 100)
  }, [result])

  const isCorrect = current && currentAnswer !== null && currentAnswer === current.indice_correta
  const showingExplanation = currentAnswer !== null && mechanismStage === "resolved"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>{config?.label ?? "Simulado"}</DialogTitle>
            {config?.timerEnabled && phase === "playing" && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Timer className="h-3.5 w-3.5" />
                {formatElapsed(elapsed)}
              </span>
            )}
          </div>
        </DialogHeader>

        {phase === "loading" && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando questões...
          </div>
        )}

        {phase === "blocked" && (
          <PlanRestrictedNotice
            tone={blockedStatus?.isTrialExpired ? "expired" : "limit"}
            title={blockedStatus?.isTrialExpired ? "Seu plano gratuito expirou" : "Limite do plano gratuito atingido"}
            description={
              blockedStatus?.isTrialExpired
                ? "Para continuar treinando e seguir rumo à sua aprovação, escolha um dos nossos planos disponíveis."
                : (config?.mode ?? "individual") === "simulado"
                  ? "O plano gratuito permite até 2 simulados de até 10 questões. Assine um plano para simulados ilimitados."
                  : "O plano gratuito permite até 10 questões individuais. Assine um plano para praticar sem limites."
            }
          />
        )}

        {phase === "empty" && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Ainda não há questões suficientes cadastradas no banco de questões para essa opção.
          </div>
        )}

        {phase === "playing" && current && (
          <div className="space-y-4">
            {/* Navigator */}
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, i) => {
                const answered = answers[i] !== null
                const correct = answered && answers[i] === q.indice_correta
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(i)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      i === currentIndex ? "ring-2 ring-primary" : ""
                    } ${
                      !answered
                        ? "border border-border text-muted-foreground hover:bg-accent"
                        : correct
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Questão {currentIndex + 1} de {questions.length} · {answeredCount} respondida(s)
                {bonusPoints > 0 && <span className="ml-2 text-primary">+{bonusPoints} bônus</span>}
              </span>
              {current.area && <Badge variant="secondary">{current.area}</Badge>}
            </div>

            {/* Mechanism follow-up question */}
            {mechanismStage === "asking" && current.mecanismo_pergunta && current.mecanismo_opcoes ? (
              <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Prova que não foi sorte!
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{current.mecanismo_pergunta}</p>
                </div>
                <div className="space-y-2">
                  {current.mecanismo_opcoes.map((opcao, idx) => {
                    const isSelected = mechanismAnswer === idx
                    const isCorrectOption = idx === current.mecanismo_indice_correta
                    const showState = mechanismAnswer !== null
                    return (
                      <button
                        key={idx}
                        onClick={() => answerMechanism(idx)}
                        disabled={mechanismAnswer !== null}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                          showState && isCorrectOption
                            ? "border-success bg-success/10 text-foreground"
                            : showState && isSelected
                              ? "border-destructive bg-destructive/10 text-foreground"
                              : "border-border bg-card hover:bg-accent"
                        }`}
                      >
                        <span>{opcao}</span>
                        {showState && isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                      </button>
                    )
                  })}
                </div>
                {mechanismAnswer !== null && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      mechanismCorrectByQuestion[currentIndex]
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {mechanismCorrectByQuestion[currentIndex]
                      ? `Perfeito! 🎯 Você realmente domina esse conceito! +${BONUS_POINTS} pontos bônus`
                      : "Quase! O mecanismo correto está destacado acima."}
                  </div>
                )}
                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={mechanismAnswer === null}
                  onClick={() => setMechanismStage("resolved")}
                >
                  Continuar
                </Button>
              </div>
            ) : (
              <>
                <HighlightableText text={current.enunciado} />

                <div className="space-y-2">
                  {current.opcoes.map((opcao, idx) => {
                    const isPending = pendingAnswer === idx
                    const isSelected = currentAnswer === idx
                    const isCorrectOption = idx === current.indice_correta
                    const showState = currentAnswer !== null
                    const isElim = currentEliminated.has(idx)
                    return (
                      <div
                        key={idx}
                        onClick={() => selectPending(idx)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                          showState && isCorrectOption
                            ? "border-success bg-success/10 text-foreground"
                            : showState && isSelected
                              ? "border-destructive bg-destructive/10 text-foreground"
                              : isPending
                                ? "border-primary bg-primary/10 text-foreground"
                                : isElim
                                  ? "border-border bg-muted/50 text-muted-foreground opacity-60"
                                  : "border-border hover:bg-accent"
                        } ${currentAnswer !== null ? "cursor-default" : ""}`}
                      >
                        <span className={isElim ? "line-through" : ""}>{opcao}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {showState && isCorrectOption && <CheckCircle2 className="h-4 w-4 text-success" />}
                          {showState && isSelected && !isCorrectOption && (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          {!showState && (
                            <button
                              onClick={(e) => toggleEliminate(idx, e)}
                              aria-label="Riscar alternativa"
                              className={`rounded-md border p-1.5 transition-colors ${
                                isElim
                                  ? "border-destructive/50 text-destructive"
                                  : "border-border text-muted-foreground hover:bg-accent"
                              }`}
                            >
                              <Strikethrough className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {currentAnswer === null && (
                  <Button variant="gradient" className="w-full" disabled={pendingAnswer === null} onClick={confirmAnswer}>
                    Confirmar
                  </Button>
                )}

                {showingExplanation && (
                  <div
                    className={`rounded-lg border p-3 text-sm ${
                      isCorrect
                        ? "border-success/30 bg-success/10 text-foreground"
                        : "border-warning/30 bg-warning/10 text-foreground"
                    }`}
                  >
                    <p className="font-semibold">
                      {isCorrect ? "🎉 Muito bem! Resposta correta." : "❌ Essa alternativa não está correta."}
                    </p>
                    {current.justificativa && <p className="mt-1 text-muted-foreground">{current.justificativa}</p>}
                  </div>
                )}
              </>
            )}

            {confirmingFinish && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Ainda há {questions.length - answeredCount} questão(ões) não respondida(s). Finalizar mesmo assim?
                </span>
              </div>
            )}

            {feedbackOpen && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                {feedbackSent ? (
                  <p className="text-sm text-success">Dúvida enviada! Nossa equipe vai revisar essa questão.</p>
                ) : (
                  <>
                    <Textarea
                      placeholder="Descreva sua dúvida ou o erro encontrado nesta questão..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="min-h-16"
                    />
                    <Button size="sm" variant="outline" onClick={sendFeedback} disabled={sendingFeedback || !feedbackText.trim()}>
                      {sendingFeedback ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enviar"}
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button variant="outline" size="icon" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={skip}>
                <SkipForward className="h-4 w-4" />
                Pular
              </Button>
              <Button variant="outline" size="icon" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === questions.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Enviar dúvida ou feedback"
                onClick={() => {
                  setFeedbackOpen((v) => !v)
                  setFeedbackSent(false)
                }}
              >
                <MessageCircleQuestion className="h-4 w-4" />
              </Button>
              <Button variant="gradient" className="ml-auto flex-1" onClick={finish} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmingFinish ? "Finalizar mesmo assim" : "Finalizar"}
              </Button>
            </div>
          </div>
        )}

        {phase === "finished" && result && (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient-brand">{result.points} pts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.correct} acertos, {result.wrong} erros — {accuracy}% de aproveitamento
                {bonusPoints > 0 && ` · +${bonusPoints} de bônus`}
              </p>
            </div>
            <Button variant="gradient" className="w-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
