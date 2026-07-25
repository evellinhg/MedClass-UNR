"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Search, Timer, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS, DIFFICULTIES, PROVAS } from "@/lib/quiz-config"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlanRestrictedNotice } from "@/components/plan-restricted-notice"
import type { SimuladoConfig } from "@/components/simulado-player"

interface PracticeLauncherProps {
  onStart: (config: SimuladoConfig) => void
}

const QUANTITIES = [5, 10, 20, 30, 50]

export function PracticeLauncher({ onStart }: PracticeLauncherProps) {
  const [open, setOpen] = useState(false)
  const [dificuldade, setDificuldade] = useState("aleatorio")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [prova, setProva] = useState(PROVAS[0])
  const [count, setCount] = useState(10)
  const [timerEnabled, setTimerEnabled] = useState(false)
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
    let query = supabase.from("questoes").select("id", { count: "exact", head: true })
    if (selectedAreas.length > 0 && selectedAreas.length < AREAS.length) query = query.in("area", selectedAreas)
    if (dificuldade !== "aleatorio") query = query.eq("dificuldade", dificuldade)
    if (prova) query = query.eq("prova", prova)
    const { count: total } = await query
    setAvailable(total ?? 0)
    setChecking(false)
  }

  useEffect(() => {
    setAvailable(null)
  }, [dificuldade, prova])

  const handleStart = () => {
    const label =
      selectedAreas.length === 0 || selectedAreas.length === AREAS.length
        ? `Questões aleatórias · ${prova}`
        : `${selectedAreas.join(", ")} · ${prova}`

    onStart({
      label,
      count,
      areas: selectedAreas.length > 0 && selectedAreas.length < AREAS.length ? selectedAreas : undefined,
      dificuldade,
      prova,
      timerEnabled,
      mode: "individual",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50">
          <Zap className="h-5 w-5 text-primary" />
          <p className="mt-2 font-medium text-foreground">Praticar Agora</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Responda questões aleatórias — configure nível, área e prova
          </p>
        </div>
      </DialogTrigger>

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
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDificuldade(d.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    dificuldade === d.value
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                      : "border border-input text-foreground hover:bg-accent"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Área (nenhuma selecionada = todas as 5 juntas)</Label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedAreas.includes(area)
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                      : "border border-input text-foreground hover:bg-accent"
                  }`}
                >
                  {area}
                </button>
              ))}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            {isBlocked ? "Fechar" : "Cancelar"}
          </Button>
          {!isBlocked && !planLoading && (
            <Button variant="gradient" onClick={handleStart} disabled={quantityOptions.length === 0}>
              Iniciar Treino
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
