"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  Loader2,
  Play,
  RotateCcw,
  Target,
  Trash2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS, DIFFICULTIES, PROVAS, EDICOES } from "@/lib/quiz-config"
import { getAreaColor } from "@/lib/area-colors"
import { getDifficultyColor } from "@/lib/difficulty-colors"
import { getQuestoesJaRespondidas } from "@/lib/questoes-ja-respondidas"
import { getCachedQuestoesAtivas, setCachedQuestoesAtivas, filtrarPoolIds, type QuestaoCacheada } from "@/lib/questoes-cache"
import { shuffle } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SimuladoPlayer, type SimuladoConfig } from "@/components/simulado-player"
import { PracticeLauncher } from "@/components/practice-launcher"
import { Pagination, PAGE_SIZE } from "@/components/pagination"

interface Simulado {
  id: string
  nome: string
  areas: string[]
  dificuldade: string | null
  prova: string | null
  quantidade_questoes: number
  questao_ids: string[]
  finished_at: string | null
  created_at: string
  modo: "individual" | "simulado"
  timer_segundos_por_questao: number | null
  modo_estrito: boolean
  respostas: (number | null)[] | null
  progresso_index: number | null
}

const QUANTIDADES = [10, 20, 30, 50]
const TEMPOS_POR_QUESTAO = [30, 60, 90, 120, 180]

function temProgresso(s: Simulado) {
  return (s.progresso_index ?? 0) > 0 || (s.respostas ?? []).some((a) => a !== null)
}

async function getQuestoesAtivasPool(): Promise<QuestaoCacheada[]> {
  const cached = getCachedQuestoesAtivas()
  if (cached) return cached
  const { data } = await supabase.from("questoes").select("*").eq("ativo", true)
  const pool = (data as QuestaoCacheada[] | null) ?? []
  setCachedQuestoesAtivas(pool)
  return pool
}

export function SimuladosContent() {
  const searchParams = useSearchParams()
  const [simulados, setSimulados] = useState<Simulado[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [practiceOpen, setPracticeOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("novo") === "true") setOpen(true)
  }, [searchParams])

  const [playerConfig, setPlayerConfig] = useState<SimuladoConfig | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  const [nome, setNome] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [dificuldade, setDificuldade] = useState("aleatorio")
  const [prova, setProva] = useState<string>("")
  const [edicao, setEdicao] = useState<string>("")
  const [quantidade, setQuantidade] = useState(20)
  const [tempoPorQuestao, setTempoPorQuestao] = useState(90)
  const [apenasIneditas, setApenasIneditas] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [simuladosPage, setSimuladosPage] = useState(1)

  const loadSimulados = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("simulados")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
    setSimulados((data as Simulado[]) ?? [])
    setSimuladosPage(1)
    setLoading(false)
  }

  useEffect(() => {
    loadSimulados()
  }, [])

  const startPlayer = (config: SimuladoConfig) => {
    setPlayerConfig(config)
    setPlayerOpen(true)
  }

  const playSimulado = (s: Simulado) => {
    startPlayer({
      label: s.nome,
      count: s.quantidade_questoes,
      questionIds: s.questao_ids,
      mode: s.modo,
      simuladoId: s.id,
      modoEstrito: s.modo_estrito,
      tempoPorQuestaoSegundos: s.timer_segundos_por_questao ?? undefined,
      respostasIniciais: s.respostas ?? undefined,
      progressoInicial: s.progresso_index ?? undefined,
    })
  }

  const reviewSimulado = (s: Simulado) => {
    startPlayer({
      label: s.nome,
      count: s.quantidade_questoes,
      questionIds: s.questao_ids,
      mode: s.modo,
      readOnly: true,
      respostasIniciais: s.respostas ?? undefined,
    })
  }

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const resetForm = () => {
    setNome("")
    setSelectedAreas([])
    setDificuldade("aleatorio")
    setProva("")
    setEdicao("")
    setQuantidade(20)
    setTempoPorQuestao(90)
    setApenasIneditas(true)
    setCreateError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return
    setCreating(true)
    setCreateError(null)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setCreateError("Sessão expirada — atualize a página e faça login novamente.")
      setCreating(false)
      return
    }

    const activePool = await getQuestoesAtivasPool()
    let poolIds = filtrarPoolIds(activePool, {
      areas: selectedAreas.length > 0 ? selectedAreas : undefined,
      dificuldade,
      prova,
      edicao,
    })

    if (apenasIneditas) {
      const jaRespondidas = await getQuestoesJaRespondidas(userData.user.id)
      poolIds = poolIds.filter((id) => !jaRespondidas.has(id))
    }

    if (poolIds.length < quantidade) {
      setCreateError(
        `Só há ${poolIds.length} questão(ões) disponível(is) para esse filtro — reduza a quantidade, amplie os filtros ou inclua questões já respondidas.`
      )
      setCreating(false)
      return
    }

    const questaoIds = shuffle(poolIds).slice(0, quantidade)

    const { error } = await supabase.from("simulados").insert({
      user_id: userData.user.id,
      nome: nome.trim(),
      areas: selectedAreas,
      dificuldade: dificuldade !== "aleatorio" ? dificuldade : null,
      prova: prova || null,
      quantidade_questoes: quantidade,
      questao_ids: questaoIds,
      modo: "simulado",
      modo_estrito: true,
      timer_segundos_por_questao: tempoPorQuestao,
    })

    if (!error) {
      trackEvent("simulado_iniciado", {
        nome: nome.trim(),
        areas: selectedAreas,
        quantidade_questoes: quantidade,
        modo: "simulado",
      })
    }

    setCreating(false)
    if (error) {
      setCreateError("Não foi possível criar o simulado. Tente novamente.")
      return
    }

    resetForm()
    setOpen(false)
    loadSimulados()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await supabase.from("simulados").delete().eq("id", id)
    setSimulados((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gradient-brand">Treinamentos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Escolha como quer treinar hoje</p>
      </div>

      {/* Entry points: Modo Estudo x Simulados */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col justify-between border-0 bg-gradient-to-br from-[#7c3aed] to-[#4338ca] p-6 text-white">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Modo Estudo</h3>
            <p className="text-sm text-white/80">Aprenda no seu ritmo</p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>• Feedback imediato com explicação de cada questão</li>
              <li>• Escolha área, dificuldade e prova livremente</li>
              <li>• Sem pressão de tempo — cronômetro é opcional</li>
            </ul>
          </div>
          <Button
            variant="secondary"
            className="mt-6 w-full justify-between bg-white/15 text-white hover:bg-white/25"
            onClick={() => setPracticeOpen(true)}
          >
            Iniciar Estudo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        <Card className="flex flex-col justify-between border-0 bg-gradient-to-br from-[#c6ff3a] to-[#84cc16] p-6 text-[#0a1f00]">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Simulados</h3>
            <p className="text-sm text-white/80">Treine como se fosse a prova real</p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>• Tempo por questão — sempre ativo, como na prova real</li>
              <li>• Questões fixas — pause e retome quando quiser</li>
              <li>• Pontuação para acompanhar sua evolução</li>
            </ul>
          </div>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v)
              if (!v) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button variant="secondary" className="mt-6 w-full justify-between bg-white/15 text-white hover:bg-white/25">
                Criar Simulado
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Simulado</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                    Nome do Simulado
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Clínica Médica - Revisão"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Área (nenhuma selecionada = todas)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAreas((prev) => (prev.length === AREAS.length ? [] : [...AREAS]))}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-[0_0_18px_rgba(198,255,58,0.45)] ${
                        selectedAreas.length === AREAS.length
                          ? "border-transparent bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00]"
                          : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Todas
                    </button>
                    {AREAS.map((area) => {
                      const cor = getAreaColor(area)
                      const ativo = selectedAreas.includes(area)
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleArea(area)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${cor.hoverGlow} ${
                            ativo ? `${cor.activeBg} border-transparent text-white` : `${cor.borderSoft} text-foreground hover:bg-accent`
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ativo ? "bg-white" : cor.dot}`} />
                          {area}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Nível</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTIES.map((d) => {
                      const cor = getDifficultyColor(d.value)
                      const ativo = dificuldade === d.value
                      const isEspecifica = d.value !== "aleatorio"
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDificuldade(d.value)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            isEspecifica ? cor.hoverGlow : "hover:shadow-[0_0_18px_rgba(198,255,58,0.45)]"
                          } ${
                            ativo
                              ? isEspecifica
                                ? `${cor.activeBg} border-transparent text-white`
                                : "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00]"
                              : isEspecifica
                                ? `${cor.borderSoft} text-foreground hover:bg-accent`
                                : "border-input text-foreground hover:bg-accent"
                          }`}
                        >
                          {isEspecifica && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ativo ? "bg-white" : cor.dot}`} />}
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Questões</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setApenasIneditas(true)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        apenasIneditas ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Excluir já respondidas
                    </button>
                    <button
                      type="button"
                      onClick={() => setApenasIneditas(false)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        !apenasIneditas ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Todas as questões
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Prova</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProva("")
                        setEdicao("")
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        prova === "" ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      Qualquer
                    </button>
                    {PROVAS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setProva(p)
                          setEdicao("")
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          prova === p ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {prova === "REVALIDA" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Edição</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEdicao("")}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          edicao === "" ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                        }`}
                      >
                        Qualquer
                      </button>
                      {EDICOES.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEdicao(e)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            edicao === e ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Quantidade de Questões
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUANTIDADES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantidade(q)}
                        className={`h-9 w-12 rounded-lg border text-sm font-medium transition-colors ${
                          quantidade === q
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Tempo Por Questão</p>
                    <p className="text-xs text-muted-foreground">
                      Todo simulado tem tempo limite por questão. Não é possível voltar às anteriores.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TEMPOS_POR_QUESTAO.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTempoPorQuestao(t)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          tempoPorQuestao === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input text-foreground hover:bg-accent"
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>

                {createError && <p className="text-xs text-destructive">{createError}</p>}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="gradient" className="flex-1 gap-1.5" disabled={creating || !nome.trim()}>
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Criar Simulado
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* Simulados List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Meus treinamentos</h3>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando treinamentos...
          </div>
        ) : simulados.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum treinamento criado ainda. Escolha o Modo Estudo ou crie um Simulado para começar.
            </p>
          </div>
        ) : (() => {
          const totalPages = Math.ceil(simulados.length / PAGE_SIZE)
          const paginated = simulados.slice((simuladosPage - 1) * PAGE_SIZE, simuladosPage * PAGE_SIZE)
          return (
            <>
              <div className="space-y-3">
                {paginated.map((simulado) => {
            const emAndamento = !simulado.finished_at && temProgresso(simulado)
            return (
              <div
                key={simulado.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{simulado.nome}</h3>
                    <Badge variant="secondary">{simulado.modo === "simulado" ? "Simulado" : "Estudo"}</Badge>
                    {simulado.finished_at && (
                      <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluído
                      </span>
                    )}
                    {emAndamento && (
                      <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                        <RotateCcw className="h-3 w-3" />
                        Em andamento
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(simulado.areas.length > 0 ? simulado.areas : ["Todas as áreas"]).map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center rounded-full bg-[#c6ff3a]/20 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{simulado.quantidade_questoes} questões</span>
                    {simulado.prova && <span>{simulado.prova}</span>}
                    {simulado.modo_estrito && simulado.timer_segundos_por_questao && (
                      <span>{simulado.timer_segundos_por_questao}s por questão</span>
                    )}
                    <span>Criado em {new Date(simulado.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-primary hover:bg-primary/10"
                    aria-label={emAndamento ? "Retomar treinamento" : simulado.finished_at ? "Ver correção" : "Iniciar treinamento"}
                    onClick={() => (simulado.finished_at ? reviewSimulado(simulado) : playSimulado(simulado))}
                  >
                    {emAndamento ? <RotateCcw className="h-4 w-4" /> : simulado.finished_at ? <Eye className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {emAndamento ? "Retomar" : simulado.finished_at ? "Ver Correção" : "Iniciar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(simulado.id)}
                    disabled={deletingId === simulado.id}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label="Excluir treinamento"
                  >
                    {deletingId === simulado.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
              </div>
              <Pagination page={simuladosPage} totalPages={totalPages} onPageChange={setSimuladosPage} />
            </>
          )
        })()}
      </div>

      <PracticeLauncher open={practiceOpen} onOpenChange={setPracticeOpen} onStart={startPlayer} />

      <SimuladoPlayer
        open={playerOpen}
        onOpenChange={(v) => {
          setPlayerOpen(v)
          if (!v) loadSimulados()
        }}
        config={playerConfig}
      />
    </div>
  )
}
