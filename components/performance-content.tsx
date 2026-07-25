"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

interface WrongQuestion {
  id: string
  subject: string
  topic: string
  difficulty: "Fácil" | "Médio" | "Difícil"
}

const evolutionData = [
  { month: "Ago", score: 65, cutoff: 70 },
  { month: "Set", score: 68, cutoff: 70 },
  { month: "Out", score: 72, cutoff: 70 },
  { month: "Nov", score: 75, cutoff: 70 },
  { month: "Dez", score: 78, cutoff: 70 },
  { month: "Jan", score: 82, cutoff: 70 },
]

const topSubjects = [
  { subject: "Clínica Médica", score: 92 },
  { subject: "Cardiologia", score: 88 },
  { subject: "Pneumologia", score: 85 },
]

const weakestSubjects = [
  { subject: "Neurocirurgia", score: 64 },
  { subject: "Urologia", score: 68 },
  { subject: "Oftalmologia", score: 70 },
]

const mockWrongQuestions: WrongQuestion[] = [
  {
    id: "1",
    subject: "Neurocirurgia",
    topic: "Tumor Cerebral",
    difficulty: "Difícil",
  },
  {
    id: "2",
    subject: "Urologia",
    topic: "Litíase Renal",
    difficulty: "Médio",
  },
  {
    id: "3",
    subject: "Oftalmologia",
    topic: "Ceratocone",
    difficulty: "Difícil",
  },
  {
    id: "4",
    subject: "Neurocirurgia",
    topic: "Hérnia de Disco",
    difficulty: "Médio",
  },
]

export function PerformanceContent() {
  const [cutoffScore, setCutoffScore] = useState(70)
  const [isEditing, setIsEditing] = useState(false)
  const [tempCutoff, setTempCutoff] = useState(cutoffScore.toString())

  const handleSaveCutoff = () => {
    const value = parseFloat(tempCutoff)
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setCutoffScore(value)
      setIsEditing(false)
    }
  }

  const updatedEvolutionData = evolutionData.map((item) => ({
    ...item,
    cutoff: cutoffScore,
  }))

  const currentScore = updatedEvolutionData[updatedEvolutionData.length - 1]?.score || 0
  const isAboveCutoff = currentScore >= cutoffScore
  const scoreChange = currentScore - 65

  return (
    <div className="space-y-8">
      {/* Cutoff Score Control */}
      <Card className="border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Nota de Corte</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina a pontuação mínima esperada
            </p>
          </div>
          {!isEditing ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{cutoffScore}</p>
              </div>
              <Button
                onClick={() => {
                  setIsEditing(true)
                  setTempCutoff(cutoffScore.toString())
                }}
                variant="outline"
              >
                Editar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                value={tempCutoff}
                onChange={(e) => setTempCutoff(e.target.value)}
                className="w-24 text-center"
              />
              <Button onClick={handleSaveCutoff} size="sm">
                Salvar
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Score Status */}
      <Card
        className={`border p-6 ${
          isAboveCutoff
            ? "border-success/30 bg-success/5"
            : "border-warning/30 bg-warning/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {isAboveCutoff ? (
              <TrendingUp className="h-6 w-6 text-success" />
            ) : (
              <AlertCircle className="h-6 w-6 text-warning" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {isAboveCutoff ? "Acima da meta!" : "Abaixo da meta"}
            </p>
            <p className="text-sm text-muted-foreground">
              Sua média atual é {currentScore}, com {scoreChange > 0 ? "+" : ""}
              {scoreChange} pontos desde o início
            </p>
          </div>
        </div>
      </Card>

      {/* Evolution Chart */}
      <Card className="border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Evolução de Pontuação
        </h2>
        <ChartContainer
          config={{
            score: { label: "Sua Pontuação", color: "var(--primary)" },
            cutoff: { label: "Nota de Corte", color: "var(--destructive)" },
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={updatedEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <ChartTooltip />
              <ChartLegend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                name="Sua Pontuação"
              />
              <Line
                type="monotone"
                dataKey="cutoff"
                stroke="var(--destructive)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Nota de Corte"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Top vs Weakest Subjects */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Subjects */}
        <Card className="border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Melhores Matérias
          </h3>
          <div className="space-y-3">
            {topSubjects.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {item.subject}
                  </span>
                  <span className="text-sm font-bold text-success">
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weakest Subjects */}
        <Card className="border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Matérias para Focar
          </h3>
          <div className="space-y-3">
            {weakestSubjects.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {item.subject}
                  </span>
                  <span className="text-sm font-bold text-warning">
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Wrong Questions */}
      <Card className="border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Questões Erradas
        </h3>
        {mockWrongQuestions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhuma questão errada registrada
          </p>
        ) : (
          <div className="space-y-2">
            {mockWrongQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-accent"
              >
                <div>
                  <p className="font-medium text-foreground">{question.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {question.topic}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    question.difficulty === "Fácil"
                      ? "bg-success/20 text-success"
                      : question.difficulty === "Médio"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {question.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
