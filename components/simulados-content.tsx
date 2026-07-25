"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Trash2, Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SimuladoPlayer, type SimuladoConfig } from "@/components/simulado-player"
import { PracticeLauncher } from "@/components/practice-launcher"

interface Simulado {
  id: string
  name: string
  subjects: string[]
  questions: number
  createdAt: string
}

const mockSimulados: Simulado[] = [
  {
    id: "1",
    name: "Clínica Médica - Revisão",
    subjects: ["Clínica Médica"],
    questions: 50,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Cirurgia Geral + Emergência",
    subjects: ["Cirurgia Geral", "Emergência"],
    questions: 75,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Pediatria Completa",
    subjects: ["Pediatria"],
    questions: 40,
    createdAt: "2024-01-05",
  },
]

const subjects = [
  "Clínica Médica",
  "Cirurgia Geral",
  "Pediatria",
  "Ginecologia",
  "Emergência",
  "Radiologia",
  "Patologia",
]

export function SimuladosContent() {
  const searchParams = useSearchParams()
  const [simulados, setSimulados] = useState(mockSimulados)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("novo") === "true") setOpen(true)
  }, [searchParams])
  const [playerConfig, setPlayerConfig] = useState<SimuladoConfig | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    subjects: [] as string[],
    questions: 50,
  })

  const startPlayer = (config: SimuladoConfig) => {
    setPlayerConfig(config)
    setPlayerOpen(true)
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.subjects.length === 0) return

    const newSimulado: Simulado = {
      id: String(simulados.length + 1),
      name: formData.name,
      subjects: formData.subjects,
      questions: formData.questions,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setSimulados([newSimulado, ...simulados])
    setFormData({ name: "", subjects: [], questions: 50 })
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    setSimulados(simulados.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-brand">Simulados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie e resolva simulados personalizados
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Simulado</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Nome do Simulado
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Clínica Médica - Revisão"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecione as Matérias
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="questions" className="block text-sm font-medium text-foreground mb-1">
                  Quantidade de Questões
                </label>
                <input
                  id="questions"
                  type="number"
                  min="10"
                  max="200"
                  step="10"
                  value={formData.questions}
                  onChange={(e) =>
                    setFormData({ ...formData, questions: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Criar Simulado
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick-start: random question practice (distinct from a full simulado) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Praticar agora</h3>
        <p className="-mt-2 text-xs text-muted-foreground">
          Treino rápido com questões aleatórias, separado dos seus simulados abaixo.
        </p>
        <PracticeLauncher onStart={startPlayer} />
      </div>

      {/* Simulados List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Meus simulados</h3>
        {simulados.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum simulado criado ainda. Crie um novo para começar a praticar.
            </p>
          </div>
        ) : (
          simulados.map((simulado) => (
            <div
              key={simulado.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{simulado.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {simulado.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{simulado.questions} questões</span>
                  <span>Criado em {simulado.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                  aria-label="Iniciar simulado"
                  onClick={() => startPlayer({ label: simulado.name, count: simulado.questions, mode: "simulado" })}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(simulado.id)}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label="Deletar simulado"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <SimuladoPlayer open={playerOpen} onOpenChange={setPlayerOpen} config={playerConfig} />
    </div>
  )
}
