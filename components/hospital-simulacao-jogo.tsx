"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ChevronDown, Clock, FileImage, Heart, Lock, Skull } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import type { HospitalSimulacaoCaso, HospitalSimulacaoEstadoPaciente, HospitalSimulacaoImpreso } from "@/lib/hospital-simulacao-types"
import { HOSPITAL_SIMULACAO_NODO_INICIAL } from "@/lib/hospital-simulacao-types"
import { HospitalSimulacaoMonitor } from "@/components/hospital-simulacao-monitor"

interface HospitalSimulacaoJogoProps {
  caso: HospitalSimulacaoCaso
}

interface RespostaHistorico {
  nodo: string
  opcao: string
  puntos_afectados: number
}

// O conteudo desse caso nao trouxe regras_globais de decaimento por tempo
// (formato mais simples que o anterior) -- mantem o mesmo mecanismo de
// pressao de tempo ja validado com o usuario, com valores default
// razoaveis, em vez de remover a funcionalidade.
const CUSTO_TEMPO_SEGUNDO = { fc: 0.6, pas: -0.5, spo2: -0.08, fr: 0.1 }

const RITMOS_CRITICOS = /fibrilaci[oó]n|asistolia|taquicardia ventricular|paro card/i

function parsePresion(str: string | undefined): { pas: number; pad: number } {
  const [pas, pad] = (str ?? "0/0").split("/").map((n) => Number.parseInt(n, 10) || 0)
  return { pas, pad }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function mergeEstado(
  atual: Required<HospitalSimulacaoEstadoPaciente>,
  mudanca: HospitalSimulacaoEstadoPaciente
): Required<HospitalSimulacaoEstadoPaciente> {
  return { ...atual, ...mudanca }
}

export function HospitalSimulacaoJogo({ caso }: HospitalSimulacaoJogoProps) {
  const conteudo = caso.conteudo!

  const [nodoId, setNodoId] = useState(HOSPITAL_SIMULACAO_NODO_INICIAL)
  const [estado, setEstado] = useState(conteudo.estado_inicial)
  const [historico, setHistorico] = useState<RespostaHistorico[]>([])
  const [opcaoEscolhida, setOpcaoEscolhida] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [segundosNoNodo, setSegundosNoNodo] = useState(0)
  const [impresos, setImpresos] = useState<HospitalSimulacaoImpreso[]>([])
  const [impresosAberto, setImpresosAberto] = useState(false)
  const [impresoEmFoco, setImpresoEmFoco] = useState<HospitalSimulacaoImpreso | null>(null)

  const nodo = conteudo.nodos[nodoId]
  const finalizado = nodo.opciones.length === 0
  const totalImpresos = Object.values(conteudo.nodos).reduce(
    (total, n) => total + n.opciones.filter((o) => o.impreso).length,
    0
  )

  useEffect(() => {
    if (finalizado || opcaoEscolhida !== null) return
    const intervalo = setInterval(() => {
      setSegundosNoNodo((s) => s + 1)
      setEstado((e) => {
        const { pas, pad } = parsePresion(e.presion_arterial_mmhg)
        return {
          ...e,
          frecuencia_cardiaca_lpm: clamp(e.frecuencia_cardiaca_lpm + CUSTO_TEMPO_SEGUNDO.fc, 20, 200),
          presion_arterial_mmhg: `${clamp(pas + CUSTO_TEMPO_SEGUNDO.pas, 0, 200)}/${pad}`,
          saturacion_oxigeno_pct: clamp(e.saturacion_oxigeno_pct + CUSTO_TEMPO_SEGUNDO.spo2, 0, 100),
          frecuencia_respiratoria_rpm: clamp(e.frecuencia_respiratoria_rpm + CUSTO_TEMPO_SEGUNDO.fr, 0, 40),
        }
      })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [finalizado, opcaoEscolhida, nodoId])

  useEffect(() => {
    setSegundosNoNodo(0)
  }, [nodoId])

  const { pas, pad } = parsePresion(estado.presion_arterial_mmhg)
  const stElevacao = Math.max(0, Math.min(1, (85 - estado.puntos_actuales) / 85))
  const critico =
    RITMOS_CRITICOS.test(estado.ritmo_monitoreo_ecg) ||
    pas < 80 ||
    estado.saturacion_oxigeno_pct < 90 ||
    estado.frecuencia_cardiaca_lpm > 130 ||
    estado.frecuencia_cardiaca_lpm < 45 ||
    estado.puntos_actuales <= 30

  const salvarTentativa = async (pontosFinal: number, historicoFinal: RespostaHistorico[], venceu: boolean) => {
    setSalvando(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from("hospital_simulacao_tentativas").insert({
        user_id: userData.user.id,
        caso_id: caso.id,
        desenlace: nodo.etapa,
        bp_final: pontosFinal,
        falecido: !venceu,
        dificuldade: 1,
        registro: historicoFinal,
        finalizado_em: new Date().toISOString(),
      })
    }
    setSalvando(false)
    setSalvo(true)
  }

  const escolher = (idx: number) => {
    if (opcaoEscolhida !== null) return
    setOpcaoEscolhida(idx)
  }

  const continuar = () => {
    if (opcaoEscolhida === null) return
    const opcao = nodo.opciones[opcaoEscolhida]
    const novosPontos = clamp(estado.puntos_actuales + opcao.puntos_afectados, 0, 100)
    const novoEstado = mergeEstado({ ...estado, puntos_actuales: novosPontos }, opcao.cambio_estado_paciente)
    const novoHistorico = [...historico, { nodo: nodoId, opcao: opcao.texto.slice(0, 2), puntos_afectados: opcao.puntos_afectados }]

    if (opcao.impreso) {
      const impreso = opcao.impreso
      setImpresos((prev) => (prev.some((i) => i.imagem === impreso.imagem) ? prev : [...prev, impreso]))
    }

    setEstado(novoEstado)
    setHistorico(novoHistorico)
    setOpcaoEscolhida(null)
    setNodoId(opcao.destino)

    const proximoNodo = conteudo.nodos[opcao.destino]
    if (proximoNodo.opciones.length === 0) {
      salvarTentativa(novosPontos, novoHistorico, novosPontos >= 40)
    }
  }

  if (finalizado) {
    // El caso siempre converge al mismo nodo final (sucesso_conclusao) -- a
    // diferencia de versiones anteriores del caso, acá no hay un nodo de
    // "muerte" separado. El desenlace real se refleja en la puntuación final
    // acumulada, no en a qué nodo se llegó.
    const puntosFinal = estado.puntos_actuales
    const resultado = puntosFinal >= 70 ? "exito" : puntosFinal >= 40 ? "regular" : "critico"

    return (
      <Card className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-8 text-center sm:p-10">
        {resultado === "critico" ? (
          <Skull className="h-12 w-12 text-red-500" />
        ) : resultado === "regular" ? (
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        ) : (
          <Heart className="h-12 w-12 text-primary" />
        )}
        <div>
          <p className="text-xl font-bold text-foreground">
            {resultado === "critico"
              ? "Desenlace Crítico"
              : resultado === "regular"
                ? "Paciente Estabilizado con Secuelas"
                : nodo.etapa}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{nodo.descripcion_situación}</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="text-xs text-muted-foreground">Puntuación final</p>
          <p className="text-2xl font-bold text-foreground">{puntosFinal} / 100</p>
        </div>
        {salvando && <p className="text-xs text-muted-foreground">Guardando desempeño...</p>}
        {salvo && <p className="text-xs text-emerald-500">Desempeño registrado.</p>}
        <Link href="/dashboard/hospital-simulacao" className="text-sm font-medium text-primary hover:underline">
          Volver a Hospital Simulación
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="space-y-4 lg:sticky lg:top-4">
        <HospitalSimulacaoMonitor
          nome="Paciente, Masculino"
          idade={58}
          fc={estado.frecuencia_cardiaca_lpm}
          pas={pas}
          pad={pad}
          spo2={estado.saturacion_oxigeno_pct}
          stElevacao={stElevacao}
          critico={critico}
        />

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
              estado.escala_dolor >= 7
                ? "bg-red-500/15 text-red-500"
                : estado.escala_dolor >= 4
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-emerald-500/15 text-emerald-500"
            }`}
          >
            Dolor {estado.escala_dolor}/10
          </span>
        </div>

        <Collapsible open={impresosAberto} onOpenChange={setImpresosAberto}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 bg-card px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#39ff88] transition-shadow"
              style={{
                borderColor: "#39ff88",
                boxShadow: "0 0 10px rgba(57,255,136,.45), inset 0 0 10px rgba(57,255,136,.12)",
              }}
            >
              <span className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Impresos
                {totalImpresos > 0 && (
                  <span className="rounded-full bg-[#39ff88]/15 px-2 py-0.5 text-[10px] tabular-nums">
                    {impresos.length}/{totalImpresos}
                  </span>
                )}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${impresosAberto ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            {totalImpresos === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Este caso todavía no tiene impresos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: totalImpresos }).map((_, i) => {
                  const item = impresos[i]
                  if (!item) {
                    return (
                      <div
                        key={i}
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground/50"
                      >
                        <Lock className="h-4 w-4" />
                      </div>
                    )
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImpresoEmFoco(item)}
                      className="group overflow-hidden rounded-lg border border-border"
                    >
                      <img
                        src={item.imagem}
                        alt={item.titulo}
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{nodo.etapa}</p>
          <div className="flex items-center gap-2">
            {opcaoEscolhida === null && (
              <span
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                  segundosNoNodo > 30 ? "bg-red-500/15 text-red-500" : "bg-muted text-muted-foreground"
                }`}
                title="Tiempo decidiendo -- el paciente sigue descompensando mientras decidís"
              >
                <Clock className="h-3 w-3" />
                {Math.floor(segundosNoNodo / 60)}:{String(segundosNoNodo % 60).padStart(2, "0")}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                estado.puntos_actuales > 70
                  ? "bg-emerald-500/15 text-emerald-500"
                  : estado.puntos_actuales > 40
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-red-500/15 text-red-500"
              }`}
            >
              {estado.puntos_actuales}/100
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={nodoId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-[24px] border border-border bg-card p-6 sm:p-8">
              <p className="text-base leading-relaxed text-foreground">{nodo.descripcion_situación}</p>

              <div className="mt-6 space-y-3">
                {nodo.opciones.map((opcao, idx) => {
                  const selecionada = opcaoEscolhida === idx
                  const desabilitado = opcaoEscolhida !== null && !selecionada
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={opcaoEscolhida !== null}
                      onClick={() => escolher(idx)}
                      className={`w-full rounded-xl border p-4 text-left text-sm transition-colors sm:text-[17px] ${
                        selecionada
                          ? opcao.puntos_afectados >= 0
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-red-500 bg-red-500/10"
                          : "border-border hover:bg-secondary"
                      } ${desabilitado ? "opacity-40" : ""}`}
                    >
                      <span className="text-foreground">{opcao.texto}</span>
                      {selecionada && (
                        <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
                          <p className={`text-xs font-bold ${opcao.puntos_afectados >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {opcao.puntos_afectados >= 0 ? "+" : ""}
                            {opcao.puntos_afectados} pts
                          </p>
                          <p className="text-xs text-muted-foreground">{opcao.feedback_detallado}</p>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {opcaoEscolhida !== null && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={continuar}>Continuar</Button>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={impresoEmFoco !== null} onOpenChange={(open) => !open && setImpresoEmFoco(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{impresoEmFoco?.titulo}</DialogTitle>
          </DialogHeader>
          {impresoEmFoco && <img src={impresoEmFoco.imagem} alt={impresoEmFoco.titulo} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
