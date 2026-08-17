"use client"

import { useState } from "react"
import { Check, Loader2, MessageSquareWarning, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"

type FeedbackTipoKey = "duvida" | "sugestao" | "erro"

const FEEDBACK_TIPOS: FeedbackTipoKey[] = ["duvida", "sugestao", "erro"]

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

interface Props {
  /** Identifica o caso na tabela feedbacks (reaproveita a coluna "materia"). */
  desafioTitulo: string
}

export function DesafioFeedbackDialog({ desafioTitulo }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<FeedbackTipoKey>("duvida")
  const [mensagem, setMensagem] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTipo("duvida")
      setMensagem("")
      setSubmitted(false)
    }
  }

  const handleSubmit = async () => {
    if (!mensagem.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    setSubmitting(true)
    const { error } = await supabase.from("feedbacks").insert({
      user_id: userId,
      tipo,
      materia: desafioTitulo,
      mensagem: mensagem.trim(),
    })
    setSubmitting(false)

    if (error) {
      alert("Erro ao enviar feedback. Tente novamente.")
      return
    }
    setSubmitted(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        size="sm"
        className="gap-1.5 border-0 bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] shadow-[0_0_10px_rgba(198,255,58,0.55),0_0_22px_rgba(132,204,22,0.35)] transition-shadow hover:shadow-[0_0_14px_rgba(198,255,58,0.8),0_0_30px_rgba(132,204,22,0.55)]"
        onClick={() => setOpen(true)}
      >
        <MessageSquareWarning className="h-3.5 w-3.5" />
        {t.desafiosClinicos.enviarFeedbackCta}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.desafiosClinicos.feedbackDialogTitulo}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Check className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">{t.feedback.feedbackEnviado}</p>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <p className="text-sm text-muted-foreground">{t.desafiosClinicos.feedbackDialogDescricao}</p>

            <div>
              <label className="text-sm font-medium text-foreground">{t.feedback.tipoDeFeedback}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEEDBACK_TIPOS.map((feedbackTipo) => (
                  <button
                    key={feedbackTipo}
                    type="button"
                    onClick={() => setTipo(feedbackTipo)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{t.feedback.mensagem}</label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder={t.feedback.mensagemPlaceholder}
                className="min-h-28"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {submitted ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t.desafiosClinicos.voltar}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleSubmit} disabled={!mensagem.trim() || submitting} className="gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t.feedback.enviarFeedback}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
