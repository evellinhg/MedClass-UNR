"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import confetti from "canvas-confetti"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareWarning,
  SkipForward,
  Strikethrough,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { calculatePoints } from "@/lib/scoring"
import { getPlanStatus, incrementTrialUsage, type PlanStatus } from "@/lib/plan-status"
import { getDifficultyColor } from "@/lib/difficulty-colors"
import { shuffle } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { registrarAtividadeHoje } from "@/lib/atividade-diaria"
import { getCachedQuestoesAtivas, setCachedQuestoesAtivas, filtrarPoolIds, type QuestaoCacheada } from "@/lib/questoes-cache"
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
import { useLanguage } from "@/lib/i18n"

interface Questao {
  id: string
  enunciado: string
  opcoes: string[]
  indice_correta: number
  materia: string | null
  parcial: string | null
  dificuldade: string | null
  justificativa: string | null
  opcoes_comentario: string[] | null
  mecanismo_pergunta: string | null
  mecanismo_opcoes: string[] | null
  mecanismo_indice_correta: number | null
}

export interface SimuladoConfig {
  label: string
  count: number
  materias?: string[]
  dificuldade?: string
  parcial?: string
  timerEnabled?: boolean
  mode?: "individual" | "simulado"
  questionIds?: string[]
  simuladoId?: string
  modoEstrito?: boolean
  tempoPorQuestaoSegundos?: number
  respostasIniciais?: (number | null)[]
  progressoInicial?: number
  readOnly?: boolean
}

type FeedbackTipo = "erro" | "duvida" | "sugestao"

const FEEDBACK_TIPOS: FeedbackTipo[] = ["erro", "duvida", "sugestao"]

async function getQuestoesAtivasPool(): Promise<QuestaoCacheada[]> {
  const cached = getCachedQuestoesAtivas()
  if (cached) return cached
  const { data } = await supabase.from("questoes").select("*").eq("ativo", true)
  const pool = (data as QuestaoCacheada[] | null) ?? []
  setCachedQuestoesAtivas(pool)
  return pool
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

const BONUS_POINTS = 10
const TIMEOUT_SENTINEL = -1
const NOTA_CORTE_APROVACAO = 60

export function SimuladoPlayer({ open, onOpenChange, config }: SimuladoPlayerProps) {
  const { t } = useLanguage()
  const feedbackTipoLabel: Record<FeedbackTipo, string> = {
    erro: t.simuladoPlayer.reportarErro,
    duvida: t.simuladoPlayer.duvida,
    sugestao: t.simuladoPlayer.sugestao,
  }
  const readOnly = !!config?.readOnly
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

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackTipo, setFeedbackTipo] = useState<FeedbackTipo>("duvida")
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sendingFeedback, setSendingFeedback] = useState(false)

  const [result, setResult] = useState<{ points: number; correct: number; wrong: number; answered: number } | null>(
    null
  )
  const [blockedStatus, setBlockedStatus] = useState<PlanStatus | null>(null)
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null)

  const pendingAnswerRef = useRef<number | null>(null)
  const currentIndexRef = useRef(0)
  const currentRef = useRef<Questao | null>(null)

  useEffect(() => { pendingAnswerRef.current = pendingAnswer }, [pendingAnswer])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

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
    setFeedbackModalOpen(false)
    setFeedbackSent(false)
    setBlockedStatus(null)

    const mode = config.mode ?? "individual"
    const isReadOnly = !!config.readOnly

    const selectCols =
      "id, enunciado, opcoes, indice_correta, materia, parcial, dificuldade, justificativa, opcoes_comentario, mecanismo_pergunta, mecanismo_opcoes, mecanismo_indice_correta"

    const applyResult = (pool: Questao[], ordered: boolean, effectiveCount: number, skipTrialUsage: boolean) => {
      const chosen = ordered ? pool.slice(0, effectiveCount) : shuffle(pool).slice(0, effectiveCount)
      setQuestions(chosen)
      const savedAnswers = config.respostasIniciais
      setAnswers(
        savedAnswers && savedAnswers.length === chosen.length ? savedAnswers : new Array(chosen.length).fill(null)
      )
      setEliminated(chosen.map(() => new Set<number>()))
      if (isReadOnly) {
        setMechanismStage("resolved")
      } else if (savedAnswers && savedAnswers.length === chosen.length && config.progressoInicial) {
        const idx = Math.max(0, Math.min(chosen.length - 1, config.progressoInicial))
        setCurrentIndex(idx)
        setMechanismStage(savedAnswers[idx] !== null ? "resolved" : "hidden")
      }
      setPhase(chosen.length === 0 ? "empty" : "playing")

      if (!skipTrialUsage && chosen.length > 0) {
        incrementTrialUsage(chosen.length)
      }
    }

    const loadQuestions = (effectiveCount: number, skipTrialUsage: boolean) => {
      if (config.questionIds && config.questionIds.length > 0) {
        supabase
          .from("questoes")
          .select(selectCols)
          .in("id", config.questionIds)
          .then(({ data }) => {
            const byId = new Map(((data as Questao[]) ?? []).map((q) => [q.id, q]))
            const ordered = config.questionIds!.map((id) => byId.get(id)).filter((q): q is Questao => !!q)
            applyResult(ordered, true, effectiveCount, skipTrialUsage)
          })
        return
      }

      getQuestoesAtivasPool().then((activePool) => {
        const ids = new Set(
          filtrarPoolIds(activePool, {
            materias: config.materias && config.materias.length > 0 ? config.materias : undefined,
            dificuldade: config.dificuldade,
            parcial: config.parcial,
          })
        )
        applyResult(activePool.filter((q) => ids.has(q.id)) as Questao[], false, effectiveCount, skipTrialUsage)
      })
    }

    if (isReadOnly) {
      loadQuestions(config.count, true)
      return
    }

    getPlanStatus().then((status) => {
      if (!status) return

      if (!status.hasFullAccess) {
        const blocked = status.accessExpired || status.questoesRemaining <= 0
        if (blocked) {
          setBlockedStatus(status)
          setPhase("blocked")
          return
        }
      }

      const effectiveCount = status.hasFullAccess ? config.count : Math.min(config.count, status.questoesRemaining)

      loadQuestions(effectiveCount, status.hasFullAccess)
    })
  }, [open, config])

  useEffect(() => {
    if (!open || !config?.timerEnabled || phase !== "playing" || readOnly) return
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [open, config?.timerEnabled, phase, startedAt, readOnly])

  // Persist progress so the training can be resumed later if closed before finishing
  useEffect(() => {
    if (phase !== "playing" || !config?.simuladoId || readOnly) return
    supabase
      .from("simulados")
      .update({ respostas: answers, progresso_index: currentIndex })
      .eq("id", config.simuladoId)
      .then(() => {})
  }, [answers, currentIndex, phase, config?.simuladoId, readOnly])

  // Modo estrito: countdown per question, resets when moving to a new (unanswered) question
  useEffect(() => {
    const limit = !readOnly && config?.modoEstrito ? config?.tempoPorQuestaoSegundos : undefined
    if (!open || phase !== "playing" || !limit || answers[currentIndex] != null) {
      setQuestionTimeLeft(null)
      return
    }
    setQuestionTimeLeft(limit)
    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => (prev === null || prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase, config?.modoEstrito, config?.tempoPorQuestaoSegundos, currentIndex, readOnly])

  useEffect(() => {
    if (questionTimeLeft !== 0) return
    const idx = currentIndexRef.current
    const pend = pendingAnswerRef.current
    const q = questions[idx]
    if (!q) return
    if (pend !== null) {
      setAnswers((prev) => {
        const next = [...prev]
        next[idx] = pend
        return next
      })
      setPendingAnswer(null)
      const isCorrect = pend === q.indice_correta
      if (isCorrect && q.mecanismo_pergunta && q.mecanismo_opcoes?.length) {
        setMechanismStage("asking")
        setMechanismAnswer(null)
      } else {
        setMechanismStage("resolved")
      }
    } else {
      setAnswers((prev) => {
        const next = [...prev]
        next[idx] = TIMEOUT_SENTINEL
        return next
      })
      goTo(idx + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionTimeLeft])

  const current = questions[currentIndex]
  currentRef.current = current ?? null
  const currentAnswer = answers[currentIndex] ?? null
  const answeredCount = answers.filter((a) => a !== null).length
  const currentEliminated = eliminated[currentIndex] ?? new Set<number>()

  const selectPending = (optionIdx: number) => {
    if (readOnly) return
    if (currentAnswer !== null) return
    if (currentEliminated.has(optionIdx)) return
    setPendingAnswer(optionIdx)
  }

  const toggleEliminate = (optionIdx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (readOnly) return
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
    if (readOnly) return
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
    if (readOnly) return
    if (mechanismAnswer !== null || !current) return
    setMechanismAnswer(idx)
    const isCorrect = idx === current.mecanismo_indice_correta
    setMechanismCorrectByQuestion((prev) => ({ ...prev, [currentIndex]: isCorrect }))
    if (isCorrect) setBonusPoints((b) => b + BONUS_POINTS)
  }

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(questions.length - 1, index))
    if (!readOnly && config?.modoEstrito && clamped < currentIndex) return
    setCurrentIndex(clamped)
    setConfirmingFinish(false)
    setPendingAnswer(null)
    setMechanismStage(readOnly ? "resolved" : answers[clamped] !== null ? "resolved" : "hidden")
    setMechanismAnswer(null)
  }

  const skip = () => {
    const next = answers.findIndex((a, i) => a === null && i > currentIndex)
    if (next !== -1) return goTo(next)
    if (config?.modoEstrito) return goTo(currentIndex + 1)
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
        subject: config?.materias?.join(", ") ?? config?.label ?? null,
        total_questions: answeredCount,
        correct_count: correct,
        wrong_count: wrong,
        duration_seconds: durationSeconds,
        points,
        simulado_id: config?.simuladoId ?? null,
      })
      if (config?.simuladoId) {
        await supabase
          .from("simulados")
          .update({ finished_at: new Date().toISOString(), progresso_index: null })
          .eq("id", config.simuladoId)
      }
      registrarAtividadeHoje()
    }
    setSaving(false)
    setResult({ points, correct, wrong, answered: answeredCount })
    setPhase("finished")
    if (config) {
      trackEvent(config.mode === "simulado" ? "simulado_finalizado" : "treino_finalizado", {
        correct,
        wrong,
        answered: answeredCount,
        points,
        durationSeconds,
      })
    }
  }

  const sendFeedback = async () => {
    if (!feedbackText.trim() || !current) return
    setSendingFeedback(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      // Roteado apenas para administradores: RLS de question_feedback restringe SELECT/UPDATE a admins.
      await supabase.from("question_feedback").insert({
        question_id: current.id,
        user_id: userData.user.id,
        tipo: feedbackTipo,
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

  const aprovado = accuracy >= NOTA_CORTE_APROVACAO

  useEffect(() => {
    if (phase !== "finished" || !result || !aprovado) return
    const duration = 2000
    const end = Date.now() + duration
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#c6ff3a", "#84cc16", "#0a1f00"] })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#c6ff3a", "#84cc16", "#0a1f00"] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, result, aprovado])

  const isCorrect = current && currentAnswer !== null && currentAnswer === current.indice_correta
  const showingExplanation = currentAnswer !== null && mechanismStage === "resolved"
  const dificuldadeCor = current?.dificuldade ? getDifficultyColor(current.dificuldade) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              {config?.label ?? t.treinamentos.badgeSimulado}
              {readOnly && (
                <Badge variant="secondary" className="font-normal">
                  {t.simuladoPlayer.somenteLeitura}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {questionTimeLeft !== null && phase === "playing" && (
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    questionTimeLeft <= 5 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
                  }`}
                >
                  <Timer className="h-3.5 w-3.5" />
                  {questionTimeLeft}s
                </span>
              )}
              {config?.timerEnabled && phase === "playing" && !readOnly && (
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Timer className="h-3.5 w-3.5" />
                  {formatElapsed(elapsed)}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {phase === "loading" && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.simuladoPlayer.preparando}
          </div>
        )}

        {phase === "blocked" && (
          <PlanRestrictedNotice
            tone={blockedStatus?.accessExpired ? "expired" : "limit"}
            title={blockedStatus?.accessExpired ? t.simuladoPlayer.tituloExpirado : t.simuladoPlayer.tituloLimite}
            description={
              blockedStatus?.accessExpired
                ? t.simuladoPlayer.descExpirado
                : (config?.mode ?? "individual") === "simulado"
                  ? t.simuladoPlayer.descLimiteSimulado
                  : t.simuladoPlayer.descLimiteIndividual
            }
          />
        )}

        {phase === "empty" && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t.simuladoPlayer.semQuestoesSuficientes}
          </div>
        )}

        {phase === "playing" && current && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {t.simuladoPlayer.questaoXdeY(currentIndex + 1, questions.length)} · {answeredCount} {t.simuladoPlayer.respondidas}
                  {bonusPoints > 0 && <span className="ml-2 text-primary">+{bonusPoints} {t.simuladoPlayer.bonusLabel}</span>}
                </span>
                <div className="flex items-center gap-1.5">
                  {dificuldadeCor && current.dificuldade && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${dificuldadeCor.borderSoft} ${dificuldadeCor.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${dificuldadeCor.dot}`} />
                      {current.dificuldade}
                    </span>
                  )}
                  {current.materia && (
                    <Badge variant="secondary">{t.cronograma.materiaLabel[current.materia] ?? current.materia}</Badge>
                  )}
                </div>
              </div>

              {/* Mechanism follow-up question */}
              {mechanismStage === "asking" && current.mecanismo_pergunta && current.mecanismo_opcoes ? (
                <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {t.simuladoPlayer.provaQueNaoFoiSorte}
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
                        ? t.simuladoPlayer.perfeitoBonus(BONUS_POINTS)
                        : t.simuladoPlayer.quaseMecanismo}
                    </div>
                  )}
                  <Button
                    variant="gradient"
                    className="w-full"
                    disabled={mechanismAnswer === null}
                    onClick={() => setMechanismStage("resolved")}
                  >
                    {t.simuladoPlayer.continuar}
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
                          className={`flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                            readOnly ? "" : "cursor-pointer"
                          } ${
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
                            {!showState && !readOnly && (
                              <button
                                onClick={(e) => toggleEliminate(idx, e)}
                                aria-label={t.simuladoPlayer.riscarAlternativa}
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

                  {!readOnly && currentAnswer === null && (
                    <Button variant="gradient" className="w-full" disabled={pendingAnswer === null} onClick={confirmAnswer}>
                      {t.simuladoPlayer.confirmar}
                    </Button>
                  )}

                  {readOnly && currentAnswer === null && (
                    <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                      {t.simuladoPlayer.naoRespondida}
                    </p>
                  )}

                  {showingExplanation && currentAnswer !== null && (
                    <div
                      className={`rounded-lg border p-3 text-sm ${
                        isCorrect
                          ? "border-success/30 bg-success/10 text-foreground"
                          : "border-warning/30 bg-warning/10 text-foreground"
                      }`}
                    >
                      <p className="font-semibold">
                        {isCorrect ? t.simuladoPlayer.respostaCorreta : t.simuladoPlayer.respostaIncorreta}
                      </p>
                      {current.justificativa && <p className="mt-1 text-muted-foreground">{current.justificativa}</p>}
                    </div>
                  )}

                  {showingExplanation && current.opcoes_comentario && current.opcoes_comentario.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.simuladoPlayer.comentariosPorAlternativa}
                      </p>
                      {current.opcoes.map((opcao, idx) => {
                        const comentario = current.opcoes_comentario?.[idx]
                        if (!comentario) return null
                        const isCorrectOption = idx === current.indice_correta
                        const isSelected = currentAnswer === idx
                        return (
                          <div
                            key={idx}
                            className={`rounded-md border p-2 text-xs ${
                              isCorrectOption
                                ? "border-success/40 bg-success/5"
                                : isSelected && !isCorrectOption
                                  ? "border-destructive/40 bg-destructive/5"
                                  : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`mt-0.5 shrink-0 font-semibold ${isCorrectOption ? "text-success" : isSelected ? "text-destructive" : "text-muted-foreground"}`}>
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <p className="text-muted-foreground">{comentario}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {confirmingFinish && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{t.simuladoPlayer.aindaHaQuestoes(questions.length - answeredCount)}</span>
                </div>
              )}
            </div>

            {/* Action bar — always visible, never pushed off-screen */}
            <div className="flex shrink-0 items-center gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0 || (!readOnly && !!config?.modoEstrito)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {!readOnly && (
                <Button variant="outline" className="gap-1.5" onClick={skip}>
                  <SkipForward className="h-4 w-4" />
                  {t.simuladoPlayer.pular}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === questions.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setFeedbackModalOpen(true)
                  setFeedbackSent(false)
                  setFeedbackText("")
                  setFeedbackTipo("duvida")
                }}
              >
                <MessageSquareWarning className="h-4 w-4" />
                {t.simuladoPlayer.feedbackBtn}
              </Button>
              {readOnly ? (
                <Button variant="gradient" className="ml-auto flex-1" onClick={() => onOpenChange(false)}>
                  {t.simuladoPlayer.fechar}
                </Button>
              ) : (
                <Button variant="gradient" className="ml-auto flex-1" onClick={finish} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmingFinish ? t.simuladoPlayer.finalizarMesmoAssim : t.simuladoPlayer.finalizar}
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === "finished" && result && (
          <div className="space-y-4 py-2 text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                aprovado ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              <Trophy className={`h-7 w-7 ${aprovado ? "text-success" : "text-destructive"}`} />
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${aprovado ? "text-success" : "text-destructive"}`}>
                {aprovado ? t.simuladoPlayer.aprovado : t.simuladoPlayer.reprovado}
              </p>
              <p className="mt-1 text-3xl font-bold text-gradient-brand">{result.points} pts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.simuladoPlayer.acertosErros(result.correct, result.wrong, accuracy)}
                {bonusPoints > 0 && t.simuladoPlayer.bonusExtra(bonusPoints)}
              </p>
              <p className="mt-3 text-sm text-foreground">
                {aprovado ? t.simuladoPlayer.mensagemAprovado : t.simuladoPlayer.mensagemReprovado}
              </p>
            </div>
            <Button variant="gradient" className="w-full" onClick={() => onOpenChange(false)}>
              {t.simuladoPlayer.fechar}
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Feedback modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.simuladoPlayer.enviarFeedbackTitulo}</DialogTitle>
          </DialogHeader>
          {feedbackSent ? (
            <p className="text-sm text-success">{t.simuladoPlayer.enviadoAviso}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                {FEEDBACK_TIPOS.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFeedbackTipo(tipo)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      feedbackTipo === tipo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-foreground hover:bg-accent"
                    }`}
                  >
                    {feedbackTipoLabel[tipo]}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={t.simuladoPlayer.feedbackPlaceholder}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-24"
              />
              <Button
                className="w-full"
                variant="gradient"
                onClick={sendFeedback}
                disabled={sendingFeedback || !feedbackText.trim()}
              >
                {sendingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : t.simuladoPlayer.enviar}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
