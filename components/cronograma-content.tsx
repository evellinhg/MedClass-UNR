"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"

interface RoutineEntry {
  id: string
  subject: string
  time: string
  days: string[]
}

const DAYS_OF_WEEK = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
const WEEKDAY_BY_GETDAY = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const mockRoutines: RoutineEntry[] = [
  { id: "1", subject: "Cardiologia", time: "14:00", days: ["Seg", "Qua", "Sex"] },
  { id: "2", subject: "Neurocirurgia", time: "09:00", days: ["Ter", "Qui"] },
  { id: "3", subject: "Urgência e Emergência", time: "16:30", days: ["Seg", "Ter", "Qua", "Qui", "Sex"] },
]

export function CronogramaContent() {
  const [routines, setRoutines] = useState<RoutineEntry[]>(mockRoutines)
  const [subject, setSubject] = useState("")
  const [time, setTime] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const handleAddRoutine = () => {
    if (!subject || !time || selectedDays.length === 0) return

    const newRoutine: RoutineEntry = {
      id: Date.now().toString(),
      subject,
      time,
      days: selectedDays,
    }

    setRoutines([...routines, newRoutine])
    setSubject("")
    setTime("")
    setSelectedDays([])
  }

  const handleRemoveRoutine = (id: string) => {
    setRoutines(routines.filter((r) => r.id !== id))
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const upcomingSessions = useMemo(() => {
    const sessions: { date: Date; routine: RoutineEntry }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let offset = 0; offset < 14 && sessions.length < 5; offset++) {
      const date = new Date(today)
      date.setDate(date.getDate() + offset)
      const label = WEEKDAY_BY_GETDAY[date.getDay()]

      routines
        .filter((r) => r.days.includes(label))
        .forEach((routine) => sessions.push({ date, routine }))
    }

    return sessions.slice(0, 5)
  }, [routines])

  const scheduledDates = useMemo(
    () => (date: Date) => routines.some((r) => r.days.includes(WEEKDAY_BY_GETDAY[date.getDay()])),
    [routines]
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Form Card */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            Criar Rotina de Estudo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Matéria</label>
              <Input
                placeholder="Ex: Cardiologia, Cirurgia..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Horário</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                Dias da Semana
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      selectedDays.includes(day)
                        ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                        : "border border-input bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="gradient" onClick={handleAddRoutine} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Rotina
            </Button>
          </div>
        </Card>

        {/* Routines List */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Rotinas Cadastradas
          </h2>

          {routines.length === 0 ? (
            <Card className="border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma rotina cadastrada ainda.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => (
                <Card
                  key={routine.id}
                  className="border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {routine.subject}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{routine.time}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {routine.days.map((day) => (
                          <span
                            key={day}
                            className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {day}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar view */}
      <div className="space-y-6">
        <Card className="border border-border bg-card p-4">
          <Calendar
            mode="single"
            className="mx-auto"
            modifiers={{ hasSession: scheduledDates }}
            modifiersClassNames={{
              hasSession: "bg-primary/15 text-primary font-semibold rounded-md",
            }}
          />
        </Card>

        <Card className="border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            Próximas sessões
          </h3>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sessão agendada.</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session, idx) => (
                <div
                  key={`${session.routine.id}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.routine.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-primary">{session.routine.time}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
