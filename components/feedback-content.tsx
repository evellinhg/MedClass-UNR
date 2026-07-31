"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Check, Loader2, MessageSquare } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { MATERIA_KEYS_BY_ANO, ANO_KEYS } from "@/lib/unr-curriculum"
import { supabase } from "@/lib/supabase"

type FeedbackTipoKey = "duvida" | "sugestao" | "erro"

const FEEDBACK_TIPOS: FeedbackTipoKey[] = ["duvida", "sugestao", "erro"]
const OUTRO_KEY = "outro"
const MATERIA_OPTIONS = [...ANO_KEYS.flatMap((ano) => MATERIA_KEYS_BY_ANO[ano]), OUTRO_KEY]

interface FeedbackEntry {
  id: string
  tipo: FeedbackTipoKey
  materia: string
  mensagem: string
  status: "pendente" | "respondido"
  respostaAdmin: string | null
  createdAt: Date
}

function getTypeColor(tipo: FeedbackTipoKey) {
  switch (tipo) {
    case "duvida":
      return "bg-primary/10 text-primary border-primary/20"
    case "sugestao":
      return "bg-success/10 text-success border-success/20"
    case "erro":
      return "bg-destructive/10 text-destructive border-destructive/20"
  }
}

function getTypeIcon(tipo: FeedbackTipoKey) {
  switch (tipo) {
    case "duvida":
      return "❓"
    case "sugestao":
      return "💡"
    case "erro":
      return "⚠️"
  }
}

export function FeedbackContent() {
  const { t } = useLanguage()
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState<FeedbackTipoKey>("duvida")
  const [materia, setMateria] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const materiaDisplay = (m: string) => t.cronograma.materiaLabel[m] ?? (m === OUTRO_KEY ? t.feedback.outro : m)

  const load = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setFeedbacks(
      (data ?? []).map((f) => ({
        id: f.id,
        tipo: f.tipo,
        materia: f.materia,
        mensagem: f.mensagem,
        status: f.status,
        respostaAdmin: f.resposta_admin,
        createdAt: new Date(f.created_at),
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async () => {
    if (!materia || !mensagem) return
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from("feedbacks")
      .insert({ user_id: userId, tipo, materia, mensagem })
      .select()
      .single()
    setSubmitting(false)

    if (error || !data) {
      alert("Erro ao enviar feedback. Tente novamente.")
      return
    }

    setFeedbacks((prev) => [
      {
        id: data.id,
        tipo: data.tipo,
        materia: data.materia,
        mensagem: data.mensagem,
        status: data.status,
        respostaAdmin: data.resposta_admin,
        createdAt: new Date(data.created_at),
      },
      ...prev,
    ])
    setTipo("duvida")
    setMateria("")
    setMensagem("")
    setSubmitted(true)

    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card className="border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">{t.feedback.enviarFeedback}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">{t.feedback.tipoDeFeedback}</label>
            <div className="mt-2 flex gap-3">
              {FEEDBACK_TIPOS.map((feedbackTipo) => (
                <button
                  key={feedbackTipo}
                  onClick={() => setTipo(feedbackTipo)}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    tipo === feedbackTipo
                      ? `${getTypeColor(feedbackTipo)} border`
                      : "border border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {t.feedback.tipoLabel[feedbackTipo]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">{t.feedback.materia}</label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">{t.feedback.selecioneMateria}</option>
              {MATERIA_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {materiaDisplay(m)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">{t.feedback.mensagem}</label>
            <textarea
              placeholder={t.feedback.mensagemPlaceholder}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="mt-2 min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!materia || !mensagem || submitting}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : submitted ? (
              <>
                <Check className="h-4 w-4" />
                {t.feedback.feedbackEnviado}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t.feedback.enviarFeedback}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Feedbacks List */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.feedback.historicoTitulo}</h2>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.dashboardNav.carregando}
          </div>
        ) : feedbacks.length === 0 ? (
          <Card className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">{t.feedback.nenhumFeedback}</p>
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
                    {getTypeIcon(feedback.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{materiaDisplay(feedback.materia)}</h3>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${getTypeColor(feedback.tipo)}`}
                      >
                        {t.feedback.tipoLabel[feedback.tipo]}
                      </span>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${
                          feedback.status === "respondido"
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {feedback.status === "respondido" ? t.feedback.statusRespondido : t.feedback.statusPendente}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{feedback.mensagem}</p>
                    <p className="text-xs text-muted-foreground">
                      {feedback.createdAt.toLocaleDateString(t.feedback.localeData, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {feedback.status === "respondido" && feedback.respostaAdmin && (
                      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t.feedback.respostaEquipe}
                        </p>
                        <p className="text-sm text-foreground">{feedback.respostaAdmin}</p>
                      </div>
                    )}
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
