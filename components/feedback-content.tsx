"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Check } from "lucide-react"

interface FeedbackEntry {
  id: string
  type: "Dúvida" | "Sugestão" | "Erro"
  subject: string
  message: string
  createdAt: Date
}

const mockFeedback: FeedbackEntry[] = [
  {
    id: "1",
    type: "Dúvida",
    subject: "Cardiologia",
    message: "Qual é a diferença entre insuficiência cardíaca sistólica e diastólica?",
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "2",
    type: "Sugestão",
    subject: "Neurocirurgia",
    message: "Seria interessante adicionar mais casos clínicos práticos sobre hérnia de disco.",
    createdAt: new Date("2025-01-10"),
  },
  {
    id: "3",
    type: "Erro",
    subject: "Pneumologia",
    message: "A resposta da questão 42 está marcada como errada, mas a resposta A também é correta.",
    createdAt: new Date("2025-01-05"),
  },
]

const SUBJECTS = [
  "Cardiologia",
  "Neurocirurgia",
  "Pneumologia",
  "Clínica Médica",
  "Urgência e Emergência",
  "Outro",
]

const FEEDBACK_TYPES = ["Dúvida", "Sugestão", "Erro"] as const

export function FeedbackContent() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>(mockFeedback)
  const [type, setType] = useState<"Dúvida" | "Sugestão" | "Erro">("Dúvida")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!subject || !message) return

    const newFeedback: FeedbackEntry = {
      id: Date.now().toString(),
      type,
      subject,
      message,
      createdAt: new Date(),
    }

    setFeedbacks([newFeedback, ...feedbacks])
    setType("Dúvida")
    setSubject("")
    setMessage("")
    setSubmitted(true)

    setTimeout(() => setSubmitted(false), 3000)
  }

  const getTypeColor = (feedbackType: string) => {
    switch (feedbackType) {
      case "Dúvida":
        return "bg-primary/10 text-primary border-primary/20"
      case "Sugestão":
        return "bg-success/10 text-success border-success/20"
      case "Erro":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeIcon = (feedbackType: string) => {
    switch (feedbackType) {
      case "Dúvida":
        return "❓"
      case "Sugestão":
        return "💡"
      case "Erro":
        return "⚠️"
      default:
        return "📝"
    }
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card className="border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Enviar Feedback
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Tipo de Feedback
            </label>
            <div className="mt-2 flex gap-3">
              {FEEDBACK_TYPES.map((feedbackType) => (
                <button
                  key={feedbackType}
                  onClick={() => setType(feedbackType)}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    type === feedbackType
                      ? `${getTypeColor(feedbackType)} border`
                      : "border border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {feedbackType}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Matéria
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione uma matéria</option>
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Mensagem
            </label>
            <textarea
              placeholder="Descreva seu feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!subject || !message}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitted ? (
              <>
                <Check className="h-4 w-4" />
                Feedback Enviado!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Feedbacks List */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Histórico de Feedback
        </h2>

        {feedbacks.length === 0 ? (
          <Card className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum feedback enviado ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className="border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {getTypeIcon(feedback.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {feedback.subject}
                      </h3>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${getTypeColor(feedback.type)}`}
                      >
                        {feedback.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feedback.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feedback.createdAt.toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
