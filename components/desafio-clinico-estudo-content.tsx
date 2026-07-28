"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, Loader2, RotateCcw, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getDesafioIcon, coverGradientFor } from "@/lib/desafio-icons"
import type { DesafioClinico, DesafioClinicoPergunta, DesafioCategoria } from "@/lib/desafios-types"
import { trackEvent } from "@/lib/analytics"
import { Button } from "@/components/ui/button"

const CATEGORIA_LABELS: Record<DesafioCategoria, string> = {
  anamnese: "Anamnese",
  exame_fisico: "Exame Físico",
  exames_complementares: "Exames Complementares",
  diagnostico: "Diagnóstico",
  conduta: "Conduta Terapêutica",
}

function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}h ${m}m ${s}s`
}

interface Props {
  desafioId: string
}

export function DesafioClinicoEstudoContent({ desafioId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const origemEtapaId = searchParams.get("origemEtapaId")
  const [desafio, setDesafio] = useState<DesafioClinico | null>(null)
  const [perguntas, setPerguntas] = useState<DesafioClinicoPergunta[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [respondidas, setRespondidas] = useState<Record<string, boolean>>({})
  const [selecaoAtual, setSelecaoAtual] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [finalizado, setFinalizado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: desafioData }, { data: perguntasData }] = await Promise.all([
        supabase.from("desafios_clinicos").select("*").eq("id", desafioId).single(),
        supabase
          .from("desafios_clinicos_perguntas")
          .select("*")
          .eq("desafio_id", desafioId)
          .order("ordem", { ascending: true }),
      ])
      setDesafio((desafioData as DesafioClinico) ?? null)
      setPerguntas((perguntasData as DesafioClinicoPergunta[]) ?? [])
      setLoading(false)
      startRef.current = Date.now()
    }
    load()
  }, [desafioId])

  useEffect(() => {
    if (finalizado) return
    const interval = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [finalizado])

  const perguntaAtual = perguntas[currentIndex]
  const jaRespondida = perguntaAtual ? !!respondidas[perguntaAtual.id] : false

  useEffect(() => {
    if (!perguntaAtual) return
    setSelecaoAtual(respostas[perguntaAtual.id] ?? null)
  }, [perguntaAtual, respostas])

  const acertosAtuais = useMemo(() => {
    return perguntas.reduce((acc, p) => {
      const resposta = respostas[p.id]
      if (!resposta) return acc
      const alt = p.alternativas.find((a) => a.id === resposta)
      return acc + (alt?.correta ? 1 : 0)
    }, 0)
  }, [perguntas, respostas])

  function handleResponder() {
    if (!perguntaAtual || !selecaoAtual) return
    setRespostas((prev) => ({ ...prev, [perguntaAtual.id]: selecaoAtual }))
    setRespondidas((prev) => ({ ...prev, [perguntaAtual.id]: true }))
  }

  async function handleFinalizar() {
    setSalvando(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id
    if (userId) {
      await supabase.from("desafios_clinicos_historico").insert({
        user_id: userId,
        desafio_id: desafioId,
        acertos: acertosAtuais,
        total: perguntas.length,
        duracao_segundos: elapsed,
        origem_trilha_etapa_id: origemEtapaId,
      })
      trackEvent("desafio_finalizado", {
        desafio_id: desafioId,
        acertos: acertosAtuais,
        total: perguntas.length,
        duracao_segundos: elapsed,
      })
    }
    setSalvando(false)
    setFinalizado(true)
  }

  function handleEstudarNovamente() {
    setRespostas({})
    setRespondidas({})
    setSelecaoAtual(null)
    setCurrentIndex(0)
    setFinalizado(false)
    setElapsed(0)
    startRef.current = Date.now()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando desafio...
      </div>
    )
  }

  if (!desafio) {
    return (
      <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">Desafio clínico não encontrado.</p>
        <Link href="/dashboard/desafios-clinicos" className="mt-3 inline-block text-sm text-primary">
          Voltar aos desafios
        </Link>
      </div>
    )
  }

  const Icon = getDesafioIcon(desafio.icone)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/desafios-clinicos"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div>
          <p className="text-right text-xs text-muted-foreground">Desafio Clínico</p>
          <p className="text-right font-mono text-sm font-medium text-foreground">{formatTimer(elapsed)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div
            className={`flex h-72 flex-col justify-end overflow-hidden rounded-lg bg-gradient-to-br ${coverGradientFor(
              desafio.id
            )} p-5`}
          >
            <Icon className="mb-auto mt-2 h-14 w-14 self-center text-white/90" strokeWidth={1.5} />
            <h1 className="text-xl font-bold leading-tight text-white drop-shadow">{desafio.titulo}</h1>
            {desafio.area && <p className="mt-1 text-sm text-white/80">{desafio.area}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição do caso
            </h2>
            <p className="text-sm leading-relaxed text-foreground">{desafio.descricao_caso}</p>
          </div>

          {finalizado ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
                <h2 className="text-lg font-bold text-foreground">Estudo concluído!</h2>
                <p className="mt-1 text-3xl font-bold text-gradient-brand">
                  {acertosAtuais}/{perguntas.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">respostas corretas · tempo {formatTimer(elapsed)}</p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button variant="outline" onClick={handleEstudarNovamente} className="gap-1.5">
                    <RotateCcw className="h-4 w-4" />
                    Estudar novamente
                  </Button>
                  <Button onClick={() => router.push("/dashboard/desafios-clinicos")}>Voltar aos desafios</Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Resumo detalhado das perguntas
                </h2>
                <div className="space-y-5">
                  {perguntas.map((pergunta, index) => {
                    const respostaId = respostas[pergunta.id]
                    const respostaCorreta = pergunta.alternativas.find((a) => a.correta)
                    const acertou = respostaId
                      ? pergunta.alternativas.find((a) => a.id === respostaId)?.correta
                      : false
                    return (
                      <div key={pergunta.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                        <div className="mb-2 flex items-center gap-2">
                          {acertou ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {CATEGORIA_LABELS[pergunta.categoria]}
                          </span>
                          <span className="text-xs text-muted-foreground">Pergunta {index + 1}</span>
                        </div>
                        <p className="mb-2 text-sm font-medium text-foreground">{pergunta.enunciado}</p>
                        <div className="space-y-1 text-xs">
                          <p className={acertou ? "text-emerald-500" : "text-red-500"}>
                            Sua resposta:{" "}
                            {pergunta.alternativas.find((a) => a.id === respostaId)?.texto ?? "Não respondida"}
                          </p>
                          {!acertou && (
                            <p className="text-emerald-500">Resposta correta: {respostaCorreta?.texto}</p>
                          )}
                        </div>
                        {pergunta.explicacao && (
                          <p className="mt-2 rounded-lg bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
                            {pergunta.explicacao}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {desafio.bibliografia.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Referências bibliográficas
                  </h2>
                  <ul className="space-y-1.5">
                    {desafio.bibliografia.map((ref) => (
                      <li key={ref.titulo}>
                        {ref.url ? (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {ref.titulo}
                          </a>
                        ) : (
                          <span className="text-sm text-foreground">{ref.titulo}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : perguntaAtual ? (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {CATEGORIA_LABELS[perguntaAtual.categoria]}
                </span>
                <span className="text-xs text-muted-foreground">
                  Pergunta {currentIndex + 1} de {perguntas.length}
                </span>
              </div>

              <p className="mb-4 text-sm font-medium leading-relaxed text-foreground">{perguntaAtual.enunciado}</p>

              <div className="space-y-2">
                {perguntaAtual.alternativas.map((alt) => {
                  const selecionada = selecaoAtual === alt.id
                  let style =
                    "border-input hover:border-primary/50 text-foreground"
                  if (jaRespondida) {
                    if (alt.correta) style = "border-emerald-500 bg-emerald-500/10 text-foreground"
                    else if (selecionada) style = "border-red-500 bg-red-500/10 text-foreground"
                    else style = "border-input opacity-60 text-foreground"
                  } else if (selecionada) {
                    style = "border-primary bg-primary/10 text-foreground"
                  }
                  return (
                    <button
                      key={alt.id}
                      disabled={jaRespondida}
                      onClick={() => setSelecaoAtual(alt.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${style}`}
                    >
                      <span>{alt.texto}</span>
                      {jaRespondida && alt.correta && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                      {jaRespondida && !alt.correta && selecionada && (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {jaRespondida && perguntaAtual.explicacao && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
                  {perguntaAtual.explicacao}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  Anterior
                </Button>

                {!jaRespondida ? (
                  <Button disabled={!selecaoAtual} onClick={handleResponder}>
                    Responder
                  </Button>
                ) : currentIndex < perguntas.length - 1 ? (
                  <Button onClick={() => setCurrentIndex((i) => i + 1)}>Próxima</Button>
                ) : (
                  <Button disabled={salvando} onClick={handleFinalizar} className="gap-1.5">
                    {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                    Finalizar
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
              <p className="text-muted-foreground">Este desafio ainda não possui perguntas cadastradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
