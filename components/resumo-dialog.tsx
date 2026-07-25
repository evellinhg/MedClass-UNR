"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BookMarked, Download, Loader2, NotebookPen, StickyNote, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAreaIcon } from "@/lib/area-icons"
import { ResumoCorpo } from "@/lib/resumo-corpo"
import type { Resumo, ResumoAnotacao } from "@/lib/resumos-types"

interface ResumoDialogProps {
  resumoId: string | null
  onClose: () => void
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function ResumoDialog({ resumoId, onClose }: ResumoDialogProps) {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [anotacoes, setAnotacoes] = useState<ResumoAnotacao[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [painelAberto, setPainelAberto] = useState(false)
  const [secaoNota, setSecaoNota] = useState("Geral")
  const [textoNota, setTextoNota] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const conteudoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!resumoId) return
    let cancelado = false
    setLoading(true)
    setPainelAberto(false)

    const load = async () => {
      const [{ data: userData }, { data: resumoData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("materiais_resumos").select("*").eq("id", resumoId).maybeSingle(),
      ])
      if (cancelado) return
      const uid = userData.user?.id ?? null
      setUserId(uid)
      setResumo((resumoData as Resumo) ?? null)

      if (uid) {
        const { data: notasData } = await supabase
          .from("materiais_resumo_anotacoes")
          .select("*")
          .eq("resumo_id", resumoId)
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
        if (!cancelado) setAnotacoes((notasData as ResumoAnotacao[]) ?? [])
      }
      if (!cancelado) setLoading(false)
    }
    load()
    return () => {
      cancelado = true
    }
  }, [resumoId])

  const opcoesSecao = useMemo(() => ["Geral", ...(resumo?.secoes.map((s) => s.titulo) ?? [])], [resumo])

  const handleAdicionarNota = async () => {
    if (!resumo || !userId || !textoNota.trim() || salvando) return
    setSalvando(true)
    const { data, error } = await supabase
      .from("materiais_resumo_anotacoes")
      .insert({ resumo_id: resumo.id, user_id: userId, secao: secaoNota, texto: textoNota.trim() })
      .select()
      .single()
    setSalvando(false)
    if (error || !data) return
    setAnotacoes((prev) => [data as ResumoAnotacao, ...prev])
    setTextoNota("")
  }

  const handleExcluirNota = async (id: string) => {
    setAnotacoes((prev) => prev.filter((n) => n.id !== id))
    await supabase.from("materiais_resumo_anotacoes").delete().eq("id", id)
  }

  const handleBaixarPdf = async () => {
    if (!resumo || !conteudoRef.current || gerandoPdf) return
    setGerandoPdf(true)
    try {
      const [{ default: html2canvas }, { jsPDF, GState }, marcaDagua] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
        carregarImagem("/logo-icon.png"),
      ])
      const canvas = await html2canvas(conteudoRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const larguraMarca = pageWidth * 0.45
      const alturaMarca = larguraMarca * (marcaDagua.naturalHeight / marcaDagua.naturalWidth)
      const desenharMarcaDagua = () => {
        pdf.saveGraphicsState()
        pdf.setGState(new GState({ opacity: 0.08 }))
        pdf.addImage(
          marcaDagua,
          "PNG",
          (pageWidth - larguraMarca) / 2,
          (pageHeight - alturaMarca) / 2,
          larguraMarca,
          alturaMarca
        )
        pdf.restoreGraphicsState()
      }

      let restante = imgHeight
      let posicaoY = 0

      pdf.addImage(imgData, "PNG", 0, posicaoY, imgWidth, imgHeight)
      desenharMarcaDagua()
      restante -= pageHeight

      while (restante > 0) {
        posicaoY = restante - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, posicaoY, imgWidth, imgHeight)
        desenharMarcaDagua()
        restante -= pageHeight
      }

      pdf.save(`${resumo.titulo}.pdf`)
    } finally {
      setGerandoPdf(false)
    }
  }

  const Icon = getAreaIcon(resumo?.especialidade)

  return (
    <Dialog open={!!resumoId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="flex h-[95vh] w-full max-w-6xl flex-col gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{resumo?.titulo ?? "Resumo"}</DialogTitle>

        <div className="flex shrink-0 items-center justify-between gap-3 bg-primary px-5 py-4 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="h-5 w-5 shrink-0" />
            <h2 className="truncate text-base font-semibold sm:text-lg">{resumo?.titulo ?? "Carregando..."}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={handleBaixarPdf}
              disabled={!resumo || gerandoPdf}
            >
              {gerandoPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Baixar PDF
            </Button>
            <Button
              size="sm"
              variant={painelAberto ? "default" : "secondary"}
              className="gap-1.5"
              onClick={() => setPainelAberto((v) => !v)}
              disabled={!resumo}
            >
              <NotebookPen className="h-4 w-4" />
              Anotações
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto bg-background">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : !resumo ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Resumo não encontrado.</p>
            ) : (
              <div ref={conteudoRef} className="space-y-6 bg-background p-6">
                {resumo.secoes.map((secao, i) => (
                  <section key={i}>
                    <h3 className="mb-2 text-base font-semibold text-primary">{secao.titulo}</h3>
                    <div className="rounded-md border-l-4 border-primary/50 bg-muted/40 px-4 py-3">
                      <ResumoCorpo texto={secao.corpo} />
                    </div>
                  </section>
                ))}

                <section>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-primary">
                    <StickyNote className="h-4 w-4" />
                    Anotações
                  </h3>
                  <div
                    className="min-h-32 rounded-md border border-border px-4 py-3"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--border) 28px)",
                    }}
                  >
                    {anotacoes.length === 0 ? (
                      <p className="text-sm italic text-muted-foreground">
                        Nenhuma anotação ainda. Use o botão "Anotações" para adicionar.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {[...anotacoes].reverse().map((nota) => (
                          <p key={nota.id} className="text-sm leading-relaxed text-foreground">
                            <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                              {nota.secao}
                            </span>
                            {nota.texto}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {resumo.bibliografia.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-primary">
                      <BookMarked className="h-4 w-4" />
                      Bibliografia
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {resumo.bibliografia.map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>

          {painelAberto && resumo && (
            <div className="flex w-80 shrink-0 flex-col border-l border-border bg-card">
              <div className="border-b border-border p-4">
                <p className="text-sm font-semibold text-foreground">Anotações</p>
                <p className="text-xs text-muted-foreground">{anotacoes.length} nota(s)</p>
              </div>

              <div className="space-y-2 border-b border-border p-4">
                <p className="text-xs font-medium text-muted-foreground">Nova nota</p>
                <Select value={secaoNota} onValueChange={setSecaoNota}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesSecao.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Escreva uma anotação rápida..."
                  value={textoNota}
                  onChange={(e) => setTextoNota(e.target.value)}
                  className="min-h-20 resize-none"
                />
                <Button className="w-full gap-1.5" onClick={handleAdicionarNota} disabled={!textoNota.trim() || salvando}>
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Adicionar
                </Button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {anotacoes.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Adicione notas para registrar pontos importantes deste tema.
                  </p>
                ) : (
                  anotacoes.map((nota) => (
                    <div key={nota.id} className="group rounded-md border border-border p-2.5">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-medium uppercase tracking-wide text-primary">
                          {nota.secao}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleExcluirNota(nota.id)}
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          aria-label="Excluir anotação"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-foreground">{nota.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
