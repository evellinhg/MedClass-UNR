"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Heart, Skull } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { HospitalSimulacaoCaso } from "@/lib/hospital-simulacao-types"
import { CASO1_VITAIS_DELTAS, VITAIS_BASE, clampVitais } from "@/lib/hospital-simulacao-caso1-vitais"
import { HospitalSimulacaoMonitor } from "@/components/hospital-simulacao-monitor"

interface HospitalSimulacaoJogoProps {
  caso: HospitalSimulacaoCaso
}

interface RespostaHistorico {
  etapa: number
  letra: string
  impacto_bp: number
}

export function HospitalSimulacaoJogo({ caso }: HospitalSimulacaoJogoProps) {
  const conteudo = caso.conteudo!
  const [etapaIndex, setEtapaIndex] = useState(0)
  const [bp, setBp] = useState(conteudo.puntos_biologicos_iniciales)
  const [vitais, setVitais] = useState(VITAIS_BASE)
  const [historico, setHistorico] = useState<RespostaHistorico[]>([])
  const [letraEscolhida, setLetraEscolhida] = useState<string | null>(null)
  const [obito, setObito] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [segundosNaEtapa, setSegundosNaEtapa] = useState(0)

  const etapa = conteudo.etapas[etapaIndex]
  const finalizado = obito || etapaIndex >= conteudo.etapas.length

  // Enquanto o aluno delibera (sem responder ainda), o quadro do paciente
  // continua se deteriorando levemente a cada segundo -- tempo de decisao
  // tem custo clinico real, igual numa guardia de verdade. Reseta a cada
  // etapa nova; para assim que a alternativa e escolhida.
  useEffect(() => {
    if (finalizado || letraEscolhida) return
    const intervalo = setInterval(() => {
      setSegundosNaEtapa((s) => s + 1)
      setVitais((v) => clampVitais({ fc: v.fc + 0.6, pas: v.pas - 0.5, spo2: v.spo2 - 0.08 }))
    }, 1000)
    return () => clearInterval(intervalo)
  }, [finalizado, letraEscolhida, etapaIndex])

  useEffect(() => {
    setSegundosNaEtapa(0)
  }, [etapaIndex])

  // ST elevado enquanto o quadro nao foi resolvido/estabilizado -- some
  // gradualmente conforme o BP se recupera acima de 85 (reperfusao/melhora).
  const stElevacao = Math.max(0, Math.min(1, (85 - bp) / 85))
  const critico = vitais.pas < 80 || vitais.spo2 < 90 || vitais.fc > 130 || vitais.fc < 45 || bp <= 30

  const desenlace = useMemo(() => {
    if (!finalizado) return null
    if (bp <= 0) return conteudo.desenlaces_finales.camino_4
    if (bp <= 49) return conteudo.desenlaces_finales.camino_3
    if (bp <= 84) return conteudo.desenlaces_finales.camino_2
    return conteudo.desenlaces_finales.camino_1
  }, [finalizado, bp, conteudo.desenlaces_finales])

  const salvarTentativa = async (bpFinal: number, historicoFinal: RespostaHistorico[], desenlaceTitulo: string) => {
    setSalvando(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from("hospital_simulacao_tentativas").insert({
        user_id: userData.user.id,
        caso_id: caso.id,
        desenlace: desenlaceTitulo,
        bp_final: bpFinal,
        falecido: bpFinal <= 0,
        dificuldade: 1,
        registro: historicoFinal,
        finalizado_em: new Date().toISOString(),
      })
    }
    setSalvando(false)
    setSalvo(true)
  }

  const escolher = (letra: string) => {
    if (letraEscolhida) return
    setLetraEscolhida(letra)
  }

  const continuar = () => {
    if (!letraEscolhida) return
    const opcao = etapa.opciones[letraEscolhida]
    const novoBp = Math.max(0, Math.min(100, bp + opcao.impacto_bp))
    const novoHistorico = [...historico, { etapa: etapa.numero, letra: letraEscolhida, impacto_bp: opcao.impacto_bp }]
    setHistorico(novoHistorico)
    setBp(novoBp)

    const delta = CASO1_VITAIS_DELTAS[etapa.numero]?.[letraEscolhida] ?? { fc: 0, pas: 0, spo2: 0 }
    const novosVitais = clampVitais({
      fc: vitais.fc + delta.fc,
      pas: vitais.pas + delta.pas,
      spo2: vitais.spo2 + delta.spo2,
    })
    setVitais(novosVitais)
    setLetraEscolhida(null)

    if (novoBp <= 0) {
      setObito(true)
      salvarTentativa(novoBp, novoHistorico, conteudo.desenlaces_finales.camino_4.titulo)
      return
    }

    const proximoIndex = etapaIndex + 1
    setEtapaIndex(proximoIndex)
    if (proximoIndex >= conteudo.etapas.length) {
      const rango = novoBp > 85 ? "camino_1" : novoBp >= 50 ? "camino_2" : "camino_3"
      salvarTentativa(novoBp, novoHistorico, conteudo.desenlaces_finales[rango].titulo)
    }
  }

  if (finalizado && desenlace) {
    return (
      <Card className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-8 text-center sm:p-10">
        {bp <= 0 ? (
          <Skull className="h-12 w-12 text-red-500" />
        ) : (
          <Heart className="h-12 w-12 text-primary" />
        )}
        <div>
          <p className="text-xl font-bold text-foreground">{desenlace.titulo}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{desenlace.descripcion}</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="text-xs text-muted-foreground">Pontuação Biológica final</p>
          <p className="text-2xl font-bold text-foreground">{bp} / 100</p>
        </div>
        {salvando && <p className="text-xs text-muted-foreground">Salvando desempenho...</p>}
        {salvo && <p className="text-xs text-emerald-500">Desempenho registrado.</p>}
        <Link href="/dashboard/hospital-simulacao" className="text-sm font-medium text-primary hover:underline">
          Voltar para Hospital Simulação
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <HospitalSimulacaoMonitor
        nome="Paciente, Masculino"
        idade={58}
        fc={vitais.fc}
        pas={vitais.pas}
        pad={Math.round(vitais.pas * 0.64)}
        spo2={vitais.spo2}
        stElevacao={stElevacao}
        critico={critico}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Etapa {etapa.numero}/{conteudo.etapas.length} · {etapa.fase}
        </p>
        <div className="flex items-center gap-2">
          {!letraEscolhida && (
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                segundosNaEtapa > 30 ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"
              }`}
              title="Tempo decidindo -- o paciente segue descompensando enquanto você delibera"
            >
              <Clock className="h-3 w-3" />
              {Math.floor(segundosNaEtapa / 60)}:{String(segundosNaEtapa % 60).padStart(2, "0")}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              bp > 70 ? "bg-emerald-500/15 text-emerald-500" : bp > 40 ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500"
            }`}
          >
            BP {bp}/100
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={etapa.numero}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="rounded-[24px] border border-border bg-card p-6 sm:p-8">
            <p className="text-base leading-relaxed text-foreground">{etapa.descripcion_clinica}</p>

            <div className="mt-6 space-y-3">
              {Object.entries(etapa.opciones).map(([letra, opcao]) => {
                const selecionada = letraEscolhida === letra
                const desabilitado = !!letraEscolhida && !selecionada
                return (
                  <button
                    key={letra}
                    type="button"
                    disabled={!!letraEscolhida}
                    onClick={() => escolher(letra)}
                    className={`w-full rounded-xl border p-4 text-left text-sm transition-colors ${
                      selecionada
                        ? opcao.impacto_bp >= 0
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-red-500 bg-red-500/10"
                        : "border-border hover:bg-secondary"
                    } ${desabilitado ? "opacity-40" : ""}`}
                  >
                    <span className="font-semibold text-foreground">{letra}) </span>
                    <span className="text-foreground">{opcao.texto}</span>
                    {selecionada && (
                      <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
                        <p className={`text-xs font-bold ${opcao.impacto_bp >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {opcao.impacto_bp >= 0 ? "+" : ""}
                          {opcao.impacto_bp} BP
                        </p>
                        <p className="text-xs text-muted-foreground">{opcao.feedback}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {letraEscolhida && (
              <div className="mt-6 flex justify-end">
                <Button onClick={continuar}>Continuar</Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
