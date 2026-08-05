"use client"

import { useEffect, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ptBR, es } from "date-fns/locale"
import { Loader2, ChevronLeft, ChevronRight, MessageSquarePlus, Check, Send, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"
import type { CalendarioEvento, CalendarioEventoTipo } from "@/lib/calendario-types"

type Visao = "mes" | "semana"

const TIPO_COR: Record<CalendarioEventoTipo, { dot: string; badge: string; text: string; border: string }> = {
  inscricao: { dot: "bg-blue-500", badge: "bg-blue-500/15", text: "text-blue-600", border: "border-blue-500" },
  prova: { dot: "bg-red-500", badge: "bg-red-500/15", text: "text-red-600", border: "border-red-500" },
  comunidade: { dot: "bg-emerald-500", badge: "bg-emerald-500/15", text: "text-emerald-600", border: "border-emerald-500" },
  cursado: { dot: "bg-amber-500", badge: "bg-amber-500/15", text: "text-amber-600", border: "border-amber-500" },
}

export function CalendarioContent() {
  const { t, lang } = useLanguage()
  const localeDf = lang === "es" ? es : ptBR

  const [loading, setLoading] = useState(true)
  const [eventos, setEventos] = useState<CalendarioEvento[]>([])
  const [visao, setVisao] = useState<Visao>("mes")
  const [mesAtual, setMesAtual] = useState(() => startOfMonth(new Date()))
  const [semanaAtual, setSemanaAtual] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)

  const [sugestaoAberta, setSugestaoAberta] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [dataSugerida, setDataSugerida] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erroSugestao, setErroSugestao] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: eventosData }, { data: userData }] = await Promise.all([
        supabase.from("calendario_eventos").select("*").eq("ativo", true).order("data", { ascending: true }),
        supabase.auth.getUser(),
      ])
      setEventos((eventosData as CalendarioEvento[]) ?? [])
      if (userData.user?.email) setEmail(userData.user.email)
      setLoading(false)
    }
    load()
  }, [])

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, CalendarioEvento[]>()
    for (const evento of eventos) {
      const key = evento.data
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(evento)
    }
    return map
  }, [eventos])

  const eventosDoDiaSelecionado = useMemo(() => {
    if (!diaSelecionado) return []
    return eventosPorDia.get(format(diaSelecionado, "yyyy-MM-dd")) ?? []
  }, [diaSelecionado, eventosPorDia])

  const diasDaSemana = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(semanaAtual, i)), [semanaAtual])

  const diasDaGrade = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 1 })
    const fim = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: inicio, end: fim })
  }, [mesAtual])

  const handleHoje = () => {
    setMesAtual(startOfMonth(new Date()))
    setSemanaAtual(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const handleSugestaoOpenChange = (next: boolean) => {
    setSugestaoAberta(next)
    if (!next) {
      setMensagem("")
      setDataSugerida("")
      setEnviado(false)
      setErroSugestao(null)
    }
  }

  const handleEnviarSugestao = async () => {
    setErroSugestao(null)
    if (!mensagem.trim()) {
      setErroSugestao(t.calendario.sugestaoMensagemObrigatoria)
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    setEnviando(true)
    const { error } = await supabase.from("calendario_sugestoes").insert({
      user_id: userData.user.id,
      nome: nome.trim() || userData.user.email || "",
      email,
      mensagem: mensagem.trim(),
      data_sugerida: dataSugerida || null,
      status: "pendente",
    })
    setEnviando(false)

    if (error) {
      setErroSugestao(t.calendario.sugestaoErro)
      return
    }
    setEnviado(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.calendario.carregando}
      </div>
    )
  }

  const renderEventChip = (evento: CalendarioEvento) => (
    <span
      key={evento.id}
      className={`block truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight ${TIPO_COR[evento.tipo].badge} ${TIPO_COR[evento.tipo].text}`}
    >
      {evento.hora ? `${evento.hora} · ` : ""}
      {evento.titulo}
    </span>
  )

  return (
    // Escapa do container max-w-7xl do DashboardLayout pra ocupar a largura toda da tela.
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-8 lg:px-12">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gradient-brand sm:text-3xl">{t.calendario.titulo}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.calendario.subtitulo}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setVisao("mes")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              visao === "mes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {t.calendario.visaoMes}
          </button>
          <button
            type="button"
            onClick={() => setVisao("semana")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              visao === "semana" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {t.calendario.visaoSemana}
          </button>
        </div>
      </div>

      {/* Legenda de tipos */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.keys(TIPO_COR) as CalendarioEventoTipo[]).map((tipo) => (
          <span key={tipo} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${TIPO_COR[tipo].dot}`} />
            {t.calendario.tipoLabel[tipo]}
          </span>
        ))}
      </div>

      {/* Navegação de período */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (visao === "mes" ? setMesAtual((d) => subMonths(d, 1)) : setSemanaAtual((d) => subWeeks(d, 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (visao === "mes" ? setMesAtual((d) => addMonths(d, 1)) : setSemanaAtual((d) => addWeeks(d, 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleHoje} className="ml-1">
            {t.calendario.hoje}
          </Button>
        </div>
        <p className="text-base font-semibold capitalize text-foreground sm:text-lg">
          {visao === "mes"
            ? format(mesAtual, "MMMM yyyy", { locale: localeDf })
            : `${format(diasDaSemana[0], "d MMM", { locale: localeDf })} – ${format(diasDaSemana[6], "d MMM yyyy", { locale: localeDf })}`}
        </p>
      </div>

      {visao === "mes" ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 gap-px bg-border">
            {diasDaGrade.slice(0, 7).map((dia) => (
              <div
                key={`cabecalho-${dia.toISOString()}`}
                className="bg-muted/40 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {format(dia, "EEE", { locale: localeDf })}
              </div>
            ))}
            {diasDaGrade.map((dia) => {
              const doDia = eventosPorDia.get(format(dia, "yyyy-MM-dd")) ?? []
              const hoje = isSameDay(dia, new Date())
              const foraDoMes = !isSameMonth(dia, mesAtual)
              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  onClick={() => setDiaSelecionado(dia)}
                  className={`flex min-h-[110px] flex-col items-start gap-1 bg-card p-2 text-left transition-colors hover:bg-accent sm:min-h-[130px] sm:p-2.5 ${
                    foraDoMes ? "opacity-40" : ""
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      hoje ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {format(dia, "d")}
                  </span>
                  <div className="flex w-full flex-col gap-1 overflow-hidden">
                    {doDia.slice(0, 2).map(renderEventChip)}
                    {doDia.length > 2 && (
                      <span className="text-[11px] font-medium text-muted-foreground">+{doDia.length - 2}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-7 gap-px bg-border">
            {diasDaSemana.map((dia) => {
              const hoje = isSameDay(dia, new Date())
              return (
                <div key={`cabecalho-${dia.toISOString()}`} className="bg-muted/40 py-2.5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {format(dia, "EEE", { locale: localeDf })}
                  </p>
                  <p className={`text-sm font-semibold ${hoje ? "text-primary" : "text-foreground"}`}>{format(dia, "d")}</p>
                </div>
              )
            })}
            {diasDaSemana.map((dia) => {
              const doDia = eventosPorDia.get(format(dia, "yyyy-MM-dd")) ?? []
              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  onClick={() => setDiaSelecionado(dia)}
                  className="flex min-h-[320px] flex-col items-start gap-1.5 bg-card p-2 text-left transition-colors hover:bg-accent sm:p-2.5"
                >
                  {doDia.length === 0 ? (
                    <span className="mt-2 w-full text-center text-xs text-muted-foreground/60">—</span>
                  ) : (
                    doDia.map(renderEventChip)
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setSugestaoAberta(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-5 py-3 text-sm font-semibold text-[#0a1f00] shadow-lg shadow-primary/20 transition-transform hover:scale-105"
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span className="hidden sm:inline">{t.calendario.ctaSugestao}</span>
      </button>

      {/* Modal do dia */}
      <Dialog open={!!diaSelecionado} onOpenChange={(v) => !v && setDiaSelecionado(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {diaSelecionado ? format(diaSelecionado, "d 'de' MMMM 'de' yyyy", { locale: localeDf }) : ""}
            </DialogTitle>
          </DialogHeader>
          {eventosDoDiaSelecionado.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.calendario.modalDiaSemEventos}</p>
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto py-1">
              {eventosDoDiaSelecionado.map((evento) => {
                const cor = TIPO_COR[evento.tipo]
                return (
                  <div key={evento.id} className={`rounded-lg border-l-4 ${cor.border} border-y border-r border-border bg-card p-3`}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={`rounded-full ${cor.badge} ${cor.text} px-2 py-0.5 text-[11px] font-medium`}>
                        {t.calendario.tipoLabel[evento.tipo]}
                      </span>
                      {evento.hora && <span className="text-xs text-muted-foreground">{evento.hora}</span>}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{evento.titulo}</p>
                    {evento.descricao && <p className="mt-1 text-sm text-muted-foreground">{evento.descricao}</p>}
                    {evento.link && (
                      <a
                        href={evento.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {t.calendario.saibaMais}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiaSelecionado(null)}>
              {t.calendario.fechar}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de sugestão */}
      <Dialog open={sugestaoAberta} onOpenChange={handleSugestaoOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.calendario.sugestaoDialogTitulo}</DialogTitle>
          </DialogHeader>

          {enviado ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">{t.calendario.sugestaoEnviada}</p>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <p className="text-sm text-muted-foreground">{t.calendario.sugestaoDialogDescricao}</p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t.calendario.sugestaoMensagem}</label>
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder={t.calendario.sugestaoMensagemPlaceholder}
                  className="min-h-28"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t.calendario.sugestaoDataSugerida}</label>
                <Input type="date" value={dataSugerida} onChange={(e) => setDataSugerida(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={email || ""} />
              </div>

              {erroSugestao && <p className="text-sm text-destructive">{erroSugestao}</p>}
            </div>
          )}

          <DialogFooter>
            {enviado ? (
              <Button variant="outline" onClick={() => handleSugestaoOpenChange(false)}>
                {t.calendario.voltar}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSugestaoOpenChange(false)}>
                  {t.calendario.cancelar}
                </Button>
                <Button variant="gradient" onClick={handleEnviarSugestao} disabled={enviando} className="gap-1.5">
                  {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {enviando ? t.calendario.sugestaoEnviando : t.calendario.sugestaoEnviar}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
