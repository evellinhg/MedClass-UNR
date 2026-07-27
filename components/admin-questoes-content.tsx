"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AREAS } from "@/lib/quiz-config"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Questao {
  id: string
  enunciado: string
  area: string | null
  materia: string | null
  dificuldade: string
  prova: string | null
  edicao: string | null
  opcoes: string[]
  indice_correta: number
  justificativa: string | null
  opcoes_comentario: string[] | null
  mecanismo_pergunta: string | null
  mecanismo_opcoes: string[] | null
  mecanismo_indice_correta: number | null
  ativo: boolean
  tags: string[]
  created_at: string
}

const DIFFICULTIES = ["fácil", "médio", "difícil"]
const PROVAS = ["ENAMED", "REVALIDA"]

const emptyForm = {
  enunciado: "",
  area: "",
  materia: "",
  dificuldade: "médio",
  prova: "REVALIDA",
  edicao: "",
  opcoes: ["", ""],
  opcoesComentario: ["", ""],
  indiceCorreta: 0,
  justificativa: "",
  mecanismoPergunta: "",
  mecanismoOpcoes: ["", ""],
  mecanismoIndiceCorreta: 0,
  tags: "",
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean)
}

const LETRA = ["A", "B", "C", "D", "E", "F", "G", "H"]

export function AdminQuestoesContent() {
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterArea, setFilterArea] = useState<string>("todas")
  const [filterEdicao, setFilterEdicao] = useState<string>("todas")

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("questoes")
      .select("*")
      .order("created_at", { ascending: false })
    setQuestoes((data as Questao[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const edicoes = useMemo(() => {
    const set = new Set<string>()
    questoes.forEach((q) => q.edicao && set.add(q.edicao))
    return Array.from(set).sort().reverse()
  }, [questoes])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return questoes.filter((q) => {
      const matchSearch =
        !term ||
        q.enunciado.toLowerCase().includes(term) ||
        (q.area ?? "").toLowerCase().includes(term) ||
        (q.materia ?? "").toLowerCase().includes(term) ||
        (q.tags ?? []).some((tag) => tag.toLowerCase().includes(term))
      const matchArea = filterArea === "todas" || q.area === filterArea
      const matchEdicao = filterEdicao === "todas" || q.edicao === filterEdicao
      return matchSearch && matchArea && matchEdicao
    })
  }, [questoes, search, filterArea, filterEdicao])

  const stats = useMemo(() => {
    const total = filtered.length
    const ativas = filtered.filter((q) => q.ativo).length
    const porArea: Record<string, number> = {}
    filtered.forEach((q) => {
      const a = q.area ?? "Sem área"
      porArea[a] = (porArea[a] || 0) + 1
    })
    return { total, ativas, porArea }
  }, [filtered])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (q: Questao) => {
    setEditingId(q.id)
    setForm({
      enunciado: q.enunciado,
      area: q.area ?? "",
      materia: q.materia ?? "",
      dificuldade: q.dificuldade,
      prova: q.prova ?? "REVALIDA",
      edicao: q.edicao ?? "",
      opcoes: q.opcoes?.length ? [...q.opcoes] : ["", ""],
      opcoesComentario: q.opcoes_comentario?.length
        ? [...q.opcoes_comentario]
        : q.opcoes?.map(() => "") ?? ["", ""],
      indiceCorreta: q.indice_correta,
      justificativa: q.justificativa ?? "",
      mecanismoPergunta: q.mecanismo_pergunta ?? "",
      mecanismoOpcoes: q.mecanismo_opcoes?.length ? [...q.mecanismo_opcoes] : ["", ""],
      mecanismoIndiceCorreta: q.mecanismo_indice_correta ?? 0,
      tags: (q.tags ?? []).join(", "),
    })
    setDialogOpen(true)
  }

  const updateOpcao = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      opcoes: prev.opcoes.map((o, i) => (i === idx ? value : o)),
    }))
  }

  const updateOpcaoComentario = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      opcoesComentario: prev.opcoesComentario.map((c, i) => (i === idx ? value : c)),
    }))
  }

  const addOpcao = () =>
    setForm((prev) => ({
      ...prev,
      opcoes: [...prev.opcoes, ""],
      opcoesComentario: [...prev.opcoesComentario, ""],
    }))

  const removeOpcao = (idx: number) => {
    setForm((prev) => {
      const opcoes = prev.opcoes.filter((_, i) => i !== idx)
      const opcoesComentario = prev.opcoesComentario.filter((_, i) => i !== idx)
      const indiceCorreta =
        prev.indiceCorreta >= opcoes.length ? 0 : prev.indiceCorreta
      return { ...prev, opcoes, opcoesComentario, indiceCorreta }
    })
  }

  const updateMecanismoOpcao = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      mecanismoOpcoes: prev.mecanismoOpcoes.map((o, i) => (i === idx ? value : o)),
    }))
  }

  const addMecanismoOpcao = () =>
    setForm((prev) => ({
      ...prev,
      mecanismoOpcoes: [...prev.mecanismoOpcoes, ""],
    }))

  const removeMecanismoOpcao = (idx: number) => {
    setForm((prev) => {
      const mecanismoOpcoes = prev.mecanismoOpcoes.filter((_, i) => i !== idx)
      const mecanismoIndiceCorreta =
        prev.mecanismoIndiceCorreta >= mecanismoOpcoes.length
          ? 0
          : prev.mecanismoIndiceCorreta
      return { ...prev, mecanismoOpcoes, mecanismoIndiceCorreta }
    })
  }

  const handleSave = async () => {
    const opcoesLimpa = form.opcoes.map((o) => o.trim()).filter(Boolean)
    if (!form.enunciado.trim() || opcoesLimpa.length < 2) {
      alert("Preencha o enunciado e ao menos duas opções.")
      return
    }

    const mecanismoOpcoesLimpa = form.mecanismoOpcoes
      .map((o) => o.trim())
      .filter(Boolean)
    const hasMecanismo =
      form.mecanismoPergunta.trim() && mecanismoOpcoesLimpa.length >= 2

    // Só salva comentários que correspondam a opções válidas
    const opcoesComentarioLimpa = form.opcoesComentario.slice(
      0,
      opcoesLimpa.length
    )

    setSaving(true)
    const payload = {
      enunciado: form.enunciado.trim(),
      area: form.area.trim() || null,
      materia: form.materia.trim() || null,
      dificuldade: form.dificuldade,
      prova: form.prova,
      edicao: form.edicao.trim() || null,
      opcoes: opcoesLimpa,
      indice_correta: Math.min(form.indiceCorreta, opcoesLimpa.length - 1),
      justificativa: form.justificativa.trim() || null,
      opcoes_comentario: opcoesComentarioLimpa.some((c) => c.trim())
        ? opcoesComentarioLimpa.map((c) => c.trim())
        : null,
      mecanismo_pergunta: hasMecanismo ? form.mecanismoPergunta.trim() : null,
      mecanismo_opcoes: hasMecanismo ? mecanismoOpcoesLimpa : null,
      mecanismo_indice_correta: hasMecanismo
        ? Math.min(form.mecanismoIndiceCorreta, mecanismoOpcoesLimpa.length - 1)
        : null,
      tags: parseTags(form.tags),
    }

    const { error } = editingId
      ? await supabase.from("questoes").update(payload).eq("id", editingId)
      : await supabase.from("questoes").insert(payload)

    setSaving(false)
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
      return
    }
    setDialogOpen(false)
    load()
  }

  const handleToggleAtivo = async (q: Questao) => {
    setQuestoes((prev) =>
      prev.map((p) => (p.id === q.id ? { ...p, ativo: !p.ativo } : p))
    )
    await supabase.from("questoes").update({ ativo: !q.ativo }).eq("id", q.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta questão? Essa ação não pode ser desfeita."))
      return
    const { error } = await supabase.from("questoes").delete().eq("id", id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setQuestoes((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header com stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Banco de Questões
          </h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} questões{filterArea !== "todas" ? ` (${filterArea})` : ""}
            {" · "}
            {stats.ativas} ativas
          </p>
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova Questão
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por enunciado, área, matéria ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as áreas</SelectItem>
            {AREAS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEdicao} onValueChange={setFilterEdicao}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Edição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas edições</SelectItem>
            {edicoes.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de questões */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando questões...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma questão encontrada.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id
            return (
              <Card key={q.id} className="border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {q.area && <Badge variant="secondary">{q.area}</Badge>}
                      {q.materia && (
                        <Badge variant="secondary">{q.materia}</Badge>
                      )}
                      <Badge>{q.dificuldade}</Badge>
                      {q.prova && (
                        <Badge variant="outline">{q.prova}</Badge>
                      )}
                      {q.edicao && (
                        <Badge variant="outline">Ed. {q.edicao}</Badge>
                      )}
                      {q.mecanismo_pergunta && (
                        <Badge variant="outline">+ mecanismo</Badge>
                      )}
                    </div>

                    {/* Enunciado */}
                    <p className="font-medium text-foreground">{q.enunciado}</p>

                    {/* Tags */}
                    {q.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Opções resumidas */}
                    <ul className="mt-2 space-y-1">
                      {q.opcoes?.map((op, idx) => (
                        <li
                          key={idx}
                          className={`text-sm ${
                            idx === q.indice_correta
                              ? "font-semibold text-success"
                              : "text-muted-foreground"
                          }`}
                        >
                          {idx === q.indice_correta ? (
                            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                          ) : (
                            <span className="mr-1 inline-block h-3.5 w-3.5 text-center text-xs">
                              •
                            </span>
                          )}
                          <span className="font-medium">{LETRA[idx]}:</span>{" "}
                          {op}
                        </li>
                      ))}
                    </ul>

                    {/* Toggle expandir para ver comentários */}
                    {(q.justificativa || q.opcoes_comentario?.some(Boolean)) && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : q.id)
                        }
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {isExpanded ? "Ocultar comentários" : "Ver comentários"}
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    {/* Comentários expandidos */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        {q.justificativa && (
                          <div>
                            <p className="mb-1 text-xs font-semibold text-foreground">
                              Justificativa:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {q.justificativa}
                            </p>
                          </div>
                        )}
                        {q.opcoes_comentario?.map((comentario, idx) =>
                          comentario ? (
                            <div key={idx} className="flex gap-2">
                              <span
                                className={`shrink-0 text-xs font-bold ${
                                  idx === q.indice_correta
                                    ? "text-success"
                                    : "text-destructive"
                                }`}
                              >
                                {LETRA[idx]}:
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {comentario}
                              </p>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        Ativa
                      </span>
                      <Switch
                        checked={q.ativo}
                        onCheckedChange={() => handleToggleAtivo(q)}
                      />
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(q)}
                      aria-label="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(q.id)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* DIALOG DE CRIAÇÃO/EDIÇÃO */}
      {/* ============================================================ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Questão" : "Nova Questão"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ── ENUNCIADO ── */}
            <div className="space-y-1.5">
              <Label htmlFor="enunciado">Enunciado da Questão</Label>
              <Textarea
                id="enunciado"
                value={form.enunciado}
                onChange={(e) =>
                  setForm((p) => ({ ...p, enunciado: e.target.value }))
                }
                placeholder="Cole ou digite o enunciado completo da questão..."
                className="min-h-[120px]"
              />
            </div>

            {/* ── CLASSIFICAÇÃO ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Área Médica</Label>
                <Select
                  value={form.area}
                  onValueChange={(v) => setForm((p) => ({ ...p, area: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="materia">Matéria / Tema</Label>
                <Input
                  id="materia"
                  value={form.materia}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, materia: e.target.value }))
                  }
                  placeholder="Ex: Infecção Urinária"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Dificuldade</Label>
                <Select
                  value={form.dificuldade}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, dificuldade: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prova</Label>
                <Select
                  value={form.prova}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, prova: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVAS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edicao">Edição</Label>
                <Input
                  id="edicao"
                  value={form.edicao}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, edicao: e.target.value }))
                  }
                  placeholder="Ex: 2024.1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">
                Tags{" "}
                <span className="text-muted-foreground font-normal">
                  (separadas por vírgula)
                </span>
              </Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tags: e.target.value }))
                }
                placeholder="Ex: hipertensao, clinica-medica, anti-hipertensivos"
              />
            </div>

            {/* ── ALTERNATIVAS COM COMENTÁRIOS ── */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Alternativas
              </Label>
              <p className="text-xs text-muted-foreground">
                Clique na letra para marcar como correta. Adicione um
                comentário para cada alternativa explicando por que está
                certa ou errada.
              </p>

              {form.opcoes.map((opcao, idx) => {
                const isCorreta = form.indiceCorreta === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 transition-colors ${
                      isCorreta
                        ? "border-success/50 bg-success/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, indiceCorreta: idx }))
                        }
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                          isCorreta
                            ? "border-success bg-success text-white"
                            : "border-input text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {LETRA[idx]}
                      </button>
                      <Input
                        value={opcao}
                        onChange={(e) => updateOpcao(idx, e.target.value)}
                        placeholder={`Texto da alternativa ${LETRA[idx]}`}
                        className={isCorreta ? "border-success/50" : ""}
                      />
                      {form.opcoes.length > 2 && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeOpcao(idx)}
                          aria-label="Remover alternativa"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-start gap-2 ml-11">
                      {isCorreta ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <Textarea
                        value={form.opcoesComentario[idx] ?? ""}
                        onChange={(e) =>
                          updateOpcaoComentario(idx, e.target.value)
                        }
                        placeholder={
                          isCorreta
                            ? "Explique por que esta alternativa está CORRETA..."
                            : "Explique por que esta alternativa está ERRADA..."
                        }
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                )
              })}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={addOpcao}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar alternativa
              </Button>
            </div>

            {/* ── JUSTIFICATIVA GERAL ── */}
            <div className="space-y-1.5">
              <Label htmlFor="justificativa">
                Justificativa Geral{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional — resumo da resposta correta)
                </span>
              </Label>
              <Textarea
                id="justificativa"
                value={form.justificativa}
                onChange={(e) =>
                  setForm((p) => ({ ...p, justificativa: e.target.value }))
                }
                placeholder="Parabéns! A resposta correta é X. [explique o raciocínio médico...]"
                className="min-h-[80px]"
              />
            </div>

            {/* ── PERGUNTA DE MECANISMO ── */}
            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div>
                <Label htmlFor="mecanismo-pergunta">
                  Pergunta de mecanismo{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Aparece como bônus quando o aluno acerta — "Prova que não
                  foi sorte!". Deixe em branco para não usar.
                </p>
              </div>
              <Textarea
                id="mecanismo-pergunta"
                value={form.mecanismoPergunta}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mecanismoPergunta: e.target.value,
                  }))
                }
                placeholder="Ex: Qual o mecanismo pelo qual essa conduta é a mais adequada?"
              />
              {form.mecanismoPergunta.trim() && (
                <div className="space-y-2">
                  <Label>Opções do mecanismo (marque a correta)</Label>
                  {form.mecanismoOpcoes.map((opcao, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            mecanismoIndiceCorreta: idx,
                          }))
                        }
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                          form.mecanismoIndiceCorreta === idx
                            ? "border-success bg-success/15 text-success"
                            : "border-input text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {LETRA[idx]}
                      </button>
                      <Input
                        value={opcao}
                        onChange={(e) =>
                          updateMecanismoOpcao(idx, e.target.value)
                        }
                        placeholder={`Opção ${LETRA[idx]}`}
                      />
                      {form.mecanismoOpcoes.length > 2 && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeMecanismoOpcao(idx)}
                          aria-label="Remover opção"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={addMecanismoOpcao}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar opção
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar Questão"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
