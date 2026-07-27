"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Search, Timer } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS, DIFFICULTIES, PROVAS, EDICOES } from "@/lib/quiz-config"
import { getAreaColor } from "@/lib/area-colors"
import { getDifficultyColor } from "@/lib/difficulty-colors"
import { getQuestoesJaRespondidas } from "@/lib/questoes-ja-respondidas"
import { getPlanStatus, FREE_QUESTOES_LIMIT, type PlanStatus } from "@/lib/plan-status"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlanRestrictedNotice } from "@/components/plan-restricted-notice"
import type { SimuladoConfig } from "@/components/simulado-player"

interface PracticeLauncherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (config: SimuladoConfig) => void
}

const QUANTITIES = [5, 10, 20, 30, 50]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function PracticeLauncher({ open, onOpenChange, onStart }: PracticeLauncherProps) {
  const [starting, setStarting] = useState(false)
  const [dificuldade, setDificuldade] = useState("aleatorio")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [prova, setProva] = useState(PROVAS[0])
  const [edicao, setEdicao] = useState("")
  const [count, setCount] = useState(10)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [apenasIneditas, setApenasIneditas] = useState(true)
  const [available, setAvailable] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const [planLoading, setPlanLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setPlanLoading(true)
    getPlanStatus().then((status) => {
      setPlanStatus(status)
      setPlanLoading(false)
      if (status && !status.hasFullAccess) {
        const cap = Math.min(10, status.questoesRemaining || 10)
        setCount((c) => Math.min(c, cap || 1))
      }
    })
  }, [open])

  const isBlocked = !!planStatus && !planStatus.canPracticeIndividual
  const restrictedPresets =
    planStatus && !planStatus.hasFullAccess ? QUANTITIES.filter((q) => q <= planStatus.questoesRemaining) : null
  const quantityOptions =
    restrictedPresets === null
      ? QUANTITIES
      : restrictedPresets.length > 0
        ? restrictedPresets
        : planStatus && planStatus.questoesRemaining > 0
          ? [planStatus.questoesRemaining]
          : []

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
    setAvailable(null)
  }

  const handleVerify = async () => {
    setChecking(true)
    let query = supabase.from("questoes").select("id").eq("ativo", true)
    if (selectedAreas.length > 0 && selectedAreas.length < AREAS.length) query = query.in("area", selectedAreas)
    if (dificuldade !== "aleatorio") query = query.eq("dificuldade", dificuldade)
    if (prova) query = query.eq("prova", prova)
    if (edicao) query = query.eq("edicao", edicao)
    const { data: pool } = await query

    let ids = ((pool as { id: string }[] | null) ?? []).map((q) => q.id)
    if (apenasIneditas) {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const jaRespondidas = await getQuestoesJaRespondidas(userData.user.id)
        ids = ids.filter((id) => !jaRespondidas.has(id))
      }
    }

    setAvailable(ids.length)
    setChecking(false)
  }

  useEffect(() => {
    setAvailable(null)
  }, [dificuldade, prova, edicao, apenasIneditas])

  const handleStart = async () => {
    const label =
      selectedAreas.length === 0 || selectedAreas.length === AREAS.length
        ? `Questões aleatórias · ${prova}`
        : `${selectedAreas.join(", ")} · ${prova}`

    setStarting(true)
    const { data: userData } = await supabase.auth.getUser()
    const areasFiltro = selectedAreas.length > 0 && selectedAreas.length < AREAS.length ? selectedAreas : undefined

    let questionIds: string[] | undefined
    let simuladoId: string | undefined

    if (userData.user) {
      let query = supabase.from("questoes").select("id").eq("ativo", true).limit(500)
      if (areasFiltro) query = query.in("area", areasFiltro)
      if (dificuldade !== "aleatorio") query = query.eq("dificuldade", dificuldade)
      if (prova) query = query.eq("prova", prova)
      if (edicao) query = query.eq("edicao", edicao)
      const { data: pool } = await query
      let poolIds = ((pool as { id: string }[] | null) ?? []).map((q) => q.id)
      if (apenasIneditas) {
        const jaRespondidas = await getQuestoesJaRespondidas(userData.user.id)
        poolIds = poolIds.filter((id) => !jaRespondidas.has(id))
      }
      questionIds = shuffle(poolIds).slice(0, count)

      const { data: inserted } = await supabase
        .from("simulados")
        .insert({
          user_id: userData.user.id,
          nome: label,
          areas: areasFiltro ?? [],
          dificuldade: dificuldade !== "aleatorio" ? dificuldade : null,
          prova: prova || null,
          quantidade_questoes: questionIds.length,
          questao_ids: questionIds,
          modo: "individual",
        })
        .select("id")
        .single()
      simuladoId = inserted?.id
    }

    setStarting(false)
    onStart({
      label,
      count,
      areas: areasFiltro,
      dificuldade,
      prova,
      edicao: edicao || undefined,
      timerEnabled,
      mode: "individual",
      questionIds,
      simuladoId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar treino de questões</DialogTitle>
        </DialogHeader>

        {planLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isBlocked ? (
          <PlanRestrictedNotice
            tone={planStatus?.isTrialExpired ? "expired" : "limit"}
            title={
              planStatus?.isTrialExpired
                ? "Seu plano gratuito expirou"
                : "Limite de questões individuais atingido"
            }
            description={
              planStatus?.isTrialExpired
                ? "Para continuar treinando e seguir rumo à sua aprovação, escolha um dos nossos planos disponíveis."
                : "O plano gratuito permite até 10 questões individuais. Assine um plano para praticar sem limites."
            }
          />
        ) : (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nível</Label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => {
                const cor = getDifficultyColor(d.value)
                const ativo = dificuldade === d.value
                const isEspecifica = d.value !== "aleatorio"
                return (
                  <button
                    key={d.value}
                    onClick={() => setDificuldade(d.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      isEspecifica ? cor.hoverGlow : "hover:shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                    } ${
                      ativo
                        ? isEspecifica
                          ? `${cor.activeBg} border-transparent text-white`
                          : "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                        : isEspecifica
                          ? `${cor.borderSoft} text-foreground hover:bg-accent`
                          : "border border-input text-foreground hover:bg-accent"
                    }`}
                  >
                    {isEspecifica && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ativo ? "bg-white" : cor.dot}`} />}
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Área (nenhuma selecionada = todas as 5 juntas)</Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAreas((prev) => (prev.length === AREAS.length ? [] : [...AREAS]))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-[0_0_18px_rgba(139,92,246,0.45)] ${
                  selectedAreas.length === AREAS.length
                    ? "border-transparent bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                    : "border-input text-foreground hover:bg-accent"
                }`}
              >
                Todas
              </button>
              {AREAS.map((area) => {
                const cor = getAreaColor(area)
                const ativo = selectedAreas.includes(area)
                return (
                  <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${cor.hoverGlow} ${
                      ativo ? `${cor.activeBg} border-transparent text-white` : `${cor.borderSoft} text-foreground hover:bg-accent`
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ativo ? "bg-white" : cor.dot}`} />
                    {area}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Questões</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setApenasIneditas(true)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  apenasIneditas ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                }`}
              >
                Excluir já respondidas
              </button>
              <button
                type="button"
                onClick={() => setApenasIneditas(false)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  !apenasIneditas ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                }`}
              >
                Todas as questões
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prova</Label>
            <div className="flex gap-2">
              {PROVAS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setProva(p)
                    setEdicao("")
                    setAvailable(null)
                  }}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    prova === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {prova === "REVALIDA" && (
            <div className="space-y-2">
              <Label>Edição</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEdicao("")
                    setAvailable(null)
                  }}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    edicao === ""
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-foreground hover:bg-accent"
                  }`}
                >
                  Qualquer
                </button>
                {EDICOES.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setEdicao(e)
                      setAvailable(null)
                    }}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      edicao === e
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-foreground hover:bg-accent"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Quantidade de questões</Label>
            <div className="flex flex-wrap gap-2">
              {quantityOptions.map((q) => (
                <button
                  key={q}
                  onClick={() => setCount(q)}
                  className={`h-9 w-12 rounded-lg border text-sm font-medium transition-colors ${
                    count === q
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-foreground hover:bg-accent"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            {planStatus && !planStatus.hasFullAccess && (
              <p className="text-xs text-muted-foreground">
                Plano gratuito: {planStatus.questoesRemaining} de {FREE_QUESTOES_LIMIT} questões individuais
                restantes.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Cronômetro</p>
                <p className="text-xs text-muted-foreground">Mostra o tempo decorrido durante o treino</p>
              </div>
            </div>
            <Switch checked={timerEnabled} onCheckedChange={setTimerEnabled} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleVerify} disabled={checking}>
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Verificar
            </Button>
            {available !== null && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {available} questões disponíveis
              </span>
            )}
          </div>
        </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isBlocked ? "Fechar" : "Cancelar"}
          </Button>
          {!isBlocked && !planLoading && (
            <Button variant="gradient" onClick={handleStart} disabled={quantityOptions.length === 0 || starting} className="gap-1.5">
              {starting && <Loader2 className="h-4 w-4 animate-spin" />}
              Iniciar Treino
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
