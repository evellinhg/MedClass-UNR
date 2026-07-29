"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Clock, CalendarDays, Loader2, Route, LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { TrilhaAtivaContent } from "@/components/trilha-ativa-content"
import type { CronogramaRotina, CronogramaTrilha } from "@/lib/cronograma-types"
import { useLanguage } from "@/lib/i18n"

const QUANTIDADES = [10, 20, 30, 50]

// Chaves canônicas dos dias da semana (o que fica salvo no banco).
// A ordem aqui é a ordem de exibição (segunda a domingo).
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
// getDay() do JS retorna 0=domingo..6=sábado — este array traduz esse índice para a chave canônica.
const DAY_KEY_BY_GETDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

const PALETTE = [
  { dot: "bg-purple-500", badge: "bg-purple-500/15", text: "text-purple-600" },
  { dot: "bg-blue-500", badge: "bg-blue-500/15", text: "text-blue-600" },
  { dot: "bg-emerald-500", badge: "bg-emerald-500/15", text: "text-emerald-600" },
  { dot: "bg-amber-500", badge: "bg-amber-500/15", text: "text-amber-600" },
  { dot: "bg-pink-500", badge: "bg-pink-500/15", text: "text-pink-600" },
]

function colorForArea(area: string) {
  let hash = 0
  for (let i = 0; i < area.length; i++) hash = area.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function CronogramaContent() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [trilhaAtivaId, setTrilhaAtivaId] = useState<string | null>(null)
  const [trilhasDisponiveis, setTrilhasDisponiveis] = useState<CronogramaTrilha[]>([])
  const [entrandoTrilha, setEntrandoTrilha] = useState<string | null>(null)

  const [routines, setRoutines] = useState<CronogramaRotina[]>([])
  const [area, setArea] = useState(AREAS[0])
  const [horario, setHorario] = useState("")
  const [quantidade, setQuantidade] = useState(20)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setLoading(false)
      return
    }
    const [{ data: rotinasData }, { data: profileData }, { data: trilhasData }] = await Promise.all([
      supabase
        .from("cronograma_rotinas")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("cronograma_trilha_id").eq("id", userData.user.id).single(),
      supabase.from("cronograma_trilhas").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    ])
    setRoutines((rotinasData as CronogramaRotina[]) ?? [])
    setTrilhaAtivaId((profileData as { cronograma_trilha_id: string | null } | null)?.cronograma_trilha_id ?? null)
    setTrilhasDisponiveis((trilhasData as CronogramaTrilha[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleAddRoutine = async () => {
    if (!area || !horario || selectedDays.length === 0) return
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setSaving(false)
      return
    }
    const { error } = await supabase.from("cronograma_rotinas").insert({
      user_id: userData.user.id,
      area,
      horario,
      dias_semana: selectedDays,
      quantidade_questoes: quantidade,
    })
    setSaving(false)
    if (error) {
      alert(`${t.cronograma.erroSalvarRotina}: ${error.message}`)
      return
    }
    setHorario("")
    setSelectedDays([])
    setQuantidade(20)
    load()
  }

  const handleRemoveRoutine = async (id: string) => {
    await supabase.from("cronograma_rotinas").delete().eq("id", id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  const handleEntrarTrilha = async (trilha: CronogramaTrilha) => {
    if (!confirm(t.cronograma.entrarTrilhaConfirm(trilha.nome))) return
    setEntrandoTrilha(trilha.id)
    const { error } = await supabase.rpc("set_cronograma_trilha", { p_trilha_id: trilha.id })
    setEntrandoTrilha(null)
    if (error) {
      alert(`${t.cronograma.entrarTrilhaErro}: ${error.message}`)
      return
    }
    setTrilhaAtivaId(trilha.id)
  }

  const upcomingSessions = useMemo(() => {
    const sessions: { date: Date; routine: CronogramaRotina }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let offset = 0; offset < 14 && sessions.length < 6; offset++) {
      const date = new Date(today)
      date.setDate(date.getDate() + offset)
      const key = DAY_KEY_BY_GETDAY[date.getDay()]
      routines.filter((r) => r.dias_semana.includes(key)).forEach((routine) => sessions.push({ date, routine }))
    }
    return sessions.slice(0, 6)
  }, [routines])

  const areasUsadas = useMemo(() => Array.from(new Set(routines.map((r) => r.area))), [routines])

  const modifiers = useMemo(() => {
    const m: Record<string, (date: Date) => boolean> = {}
    areasUsadas.forEach((a) => {
      m[`area_${a}`] = (date: Date) =>
        routines.some((r) => r.area === a && r.dias_semana.includes(DAY_KEY_BY_GETDAY[date.getDay()]))
    })
    return m
  }, [areasUsadas, routines])

  const modifiersClassNames = useMemo(() => {
    const c: Record<string, string> = {}
    areasUsadas.forEach((a) => {
      const cor = colorForArea(a)
      c[`area_${a}`] = `${cor.badge} ${cor.text} font-semibold rounded-md`
    })
    return c
  }, [areasUsadas])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.cronograma.carregando}
      </div>
    )
  }

  if (trilhaAtivaId) {
    return <TrilhaAtivaContent trilhaId={trilhaAtivaId} onSair={() => setTrilhaAtivaId(null)} />
  }

  return (
    <div className="space-y-8">
      {trilhasDisponiveis.length > 0 && (
        <Card className="border border-primary/20 bg-gradient-to-br from-[#c6ff3a]/5 to-[#84cc16]/5 p-5">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Route className="h-5 w-5 text-primary" />
            {t.cronograma.trilhasTitulo}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{t.cronograma.trilhasSubtitulo}</p>
          <div className="space-y-2">
            {trilhasDisponiveis.map((trilha) => (
              <div
                key={trilha.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{trilha.nome}</p>
                  {trilha.descricao && <p className="text-xs text-muted-foreground">{trilha.descricao}</p>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={entrandoTrilha === trilha.id}
                  onClick={() => handleEntrarTrilha(trilha)}
                >
                  {entrandoTrilha === trilha.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogIn className="h-3.5 w-3.5" />
                  )}
                  {t.cronograma.entrar}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">{t.cronograma.criarRotinaTitulo}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t.cronograma.area}</label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">{t.cronograma.horario}</label>
                <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="mt-2" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{t.cronograma.questoesPorSessao}</label>
                <div className="flex flex-wrap gap-2">
                  {QUANTIDADES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantidade(q)}
                      className={`h-9 w-12 rounded-lg border text-sm font-medium transition-colors ${
                        quantidade === q
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">{t.cronograma.diasDaSemana}</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_KEYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00]"
                          : "border border-input bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {t.cronograma.diasSemanaLabel[day]}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="gradient" onClick={handleAddRoutine} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {t.cronograma.adicionarRotina}
              </Button>
            </div>
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t.cronograma.rotinasCadastradas}</h2>
            {routines.length === 0 ? (
              <Card className="border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">{t.cronograma.nenhumaRotina}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {routines.map((routine) => {
                  const cor = colorForArea(routine.area)
                  return (
                    <Card key={routine.id} className="border border-border bg-card p-4 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${cor.dot}`} />
                            <h3 className="font-semibold text-foreground">{routine.area}</h3>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {routine.horario}
                            </span>
                            <span>{routine.quantidade_questoes} {t.cronograma.questoesPorSessaoLabel}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {routine.dias_semana.map((day) => (
                              <span
                                key={day}
                                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${cor.badge} ${cor.text}`}
                              >
                                {t.cronograma.diasSemanaLabel[day] ?? day}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveRoutine(routine.id)}
                          className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-border bg-card p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
            />
            {areasUsadas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-border pt-3">
                {areasUsadas.map((a) => {
                  const cor = colorForArea(a)
                  return (
                    <span key={a} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${cor.dot}`} />
                      {a}
                    </span>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {t.cronograma.proximasSessoes}
            </h3>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.cronograma.nenhumaSessao}</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session, idx) => {
                  const cor = colorForArea(session.routine.area)
                  return (
                    <div
                      key={`${session.routine.id}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${cor.dot}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{session.routine.area}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.date.toLocaleDateString(t.cronograma.localeData, {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary">{session.routine.horario}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
