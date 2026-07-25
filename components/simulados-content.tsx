"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Trash2, Play, Plus, Loader2, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS, DIFFICULTIES, PROVAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SimuladoPlayer, type SimuladoConfig } from "@/components/simulado-player"
import { PracticeLauncher } from "@/components/practice-launcher"

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
}

const QUANTIDADES = [10, 20, 30, 50]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function SimuladosContent() {
  const searchParams = useSearchParams()
  const [simulados, setSimulados] = useState<Simulado[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("novo") === "true") setOpen(true)
  }, [searchParams])

  const [playerConfig, setPlayerConfig] = useState<SimuladoConfig | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  const [nome, setNome] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [dificuldade, setDificuldade] = useState("aleatorio")
  const [prova, setProva] = useState<string>("")
  const [quantidade, setQuantidade] = useState(20)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      mode: "simulado",
      simuladoId: s.id,
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
    setQuantidade(20)
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

    let query = supabase.from("questoes").select("id").limit(500)
    if (selectedAreas.length > 0) query = query.in("area", selectedAreas)
    if (dificuldade !== "aleatorio") query = query.eq("dificuldade", dificuldade)
    if (prova) query = query.eq("prova", prova)

    const { data: questoesDisponiveis } = await query
    const pool = (questoesDisponiveis as { id: string }[] | null) ?? []

    if (pool.length < quantidade) {
      setCreateError(
        `Só há ${pool.length} questão(ões) disponível(is) para esse filtro — reduza a quantidade ou amplie os filtros.`
      )
      setCreating(false)
      return
    }

    const questaoIds = shuffle(pool)
      .slice(0, quantidade)
      .map((q) => q.id)

    const { error } = await supabase.from("simulados").insert({
      user_id: userData.user.id,
      nome: nome.trim(),
      areas: selectedAreas,
      dificuldade: dificuldade !== "aleatorio" ? dificuldade : null,
      prova: prova || null,
      quantidade_questoes: quantidade,
      questao_ids: questaoIds,
    })

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-brand">Simulados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie e resolva simulados personalizados
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Novo Simulado
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
                  {AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedAreas.includes(area)
                          ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                          : "border border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nível</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDificuldade(d.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        dificuldade === d.value
                          ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white"
                          : "border border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Prova</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProva("")}
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
                      onClick={() => setProva(p)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        prova === p ? "border-primary bg-primary/10 text-primary" : "border-input text-foreground hover:bg-accent"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

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
      </div>

      {/* Quick-start: random question practice (distinct from a full simulado) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Praticar agora</h3>
        <p className="-mt-2 text-xs text-muted-foreground">
          Treino rápido com questões aleatórias, separado dos seus simulados abaixo.
        </p>
        <PracticeLauncher onStart={startPlayer} />
      </div>

      {/* Simulados List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Meus simulados</h3>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando simulados...
          </div>
        ) : simulados.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum simulado criado ainda. Crie um novo para começar a praticar.
            </p>
          </div>
        ) : (
          simulados.map((simulado) => (
            <div
              key={simulado.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{simulado.nome}</h3>
                  {simulado.finished_at && (
                    <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluído
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(simulado.areas.length > 0 ? simulado.areas : ["Todas as áreas"]).map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{simulado.quantidade_questoes} questões</span>
                  {simulado.prova && <span>{simulado.prova}</span>}
                  <span>Criado em {new Date(simulado.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:bg-primary/10"
                  aria-label="Iniciar simulado"
                  onClick={() => playSimulado(simulado)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(simulado.id)}
                  disabled={deletingId === simulado.id}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label="Deletar simulado"
                >
                  {deletingId === simulado.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
