"use client"

import { useEffect, useMemo, useState } from "react"
import { Layers, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { supabase, fetchAllFlashcardRefs } from "@/lib/supabase"
import { enfileirarAviso } from "@/lib/avisos"
import { translations } from "@/lib/i18n"
import {
  ANO_KEYS,
  MATERIA_KEYS_BY_ANO,
  DISCIPLINA_BASE_KEYS,
  anoDaMateria,
  type AnoKey,
  type DisciplinaBaseKey,
} from "@/lib/unr-curriculum"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getDisciplinaColor } from "@/lib/disciplina-colors"
import type { FlashcardDeck } from "@/lib/flashcards-types"

const anoLabel = translations.pt.cronograma.anoLabel
const materiaLabel = translations.pt.cronograma.materiaLabel
const disciplinaBaseLabel = translations.pt.cronograma.disciplinaBaseLabel

interface CardForm {
  id?: string
  frente: string
  verso: string
  fontes: string[]
}

interface DeckForm {
  titulo: string
  ano: AnoKey
  materia: string
  subsecao: string
  disciplinaBase: DisciplinaBaseKey | ""
  descricao: string
  ordem: number
  ativo: boolean
  tags: string
  cards: CardForm[]
}

const emptyCard = (): CardForm => ({ frente: "", verso: "", fontes: [""] })

export function AdminFlashcardsContent() {
  const [decks, setDecks] = useState<(FlashcardDeck & { total: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<DeckForm>(emptyForm(1))

  const load = async () => {
    setLoading(true)
    const [{ data: decksData }, cards] = await Promise.all([
      supabase.from("materiais_flashcard_decks").select("*").order("ordem"),
      fetchAllFlashcardRefs(),
    ])
    const decksComTotal = ((decksData as FlashcardDeck[]) ?? []).map((d) => ({
      ...d,
      total: cards.filter((c) => c.deck_id === d.id).length,
    }))
    setDecks(decksComTotal)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function emptyForm(proximaOrdem: number): DeckForm {
    return {
      titulo: "",
      ano: ANO_KEYS[0],
      materia: MATERIA_KEYS_BY_ANO[ANO_KEYS[0]][0],
      subsecao: "",
      disciplinaBase: "",
      descricao: "",
      ordem: proximaOrdem,
      ativo: true,
      tags: "",
      cards: [emptyCard()],
    }
  }

  const handleAnoChange = (novoAno: AnoKey) => {
    setForm((p) => ({ ...p, ano: novoAno, materia: MATERIA_KEYS_BY_ANO[novoAno][0] }))
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return decks
    return decks.filter(
      (d) =>
        d.titulo.toLowerCase().includes(term) ||
        (materiaLabel[d.materia ?? ""] ?? "").toLowerCase().includes(term) ||
        (disciplinaBaseLabel[d.disciplina_base ?? ""] ?? "").toLowerCase().includes(term)
    )
  }, [decks, search])

  const openNew = () => {
    const proximaOrdem = decks.length > 0 ? Math.max(...decks.map((d) => d.ordem)) + 1 : 1
    setEditingId(null)
    setForm(emptyForm(proximaOrdem))
    setDialogOpen(true)
  }

  const openEdit = async (deck: FlashcardDeck) => {
    setEditingId(deck.id)
    setDialogOpen(true)
    const { data: cardsRows } = await supabase
      .from("materiais_flashcards")
      .select("*")
      .eq("deck_id", deck.id)
      .order("ordem")
    const anoDerivado = (deck.materia && anoDaMateria(deck.materia)) || ANO_KEYS[0]
    setForm({
      titulo: deck.titulo,
      ano: anoDerivado,
      materia:
        deck.materia && MATERIA_KEYS_BY_ANO[anoDerivado].includes(deck.materia)
          ? deck.materia
          : MATERIA_KEYS_BY_ANO[anoDerivado][0],
      subsecao: deck.subsecao ?? "",
      disciplinaBase: (deck.disciplina_base as DisciplinaBaseKey) || "",
      descricao: deck.descricao ?? "",
      ordem: deck.ordem,
      ativo: deck.ativo,
      tags: deck.tags.join(", "),
      cards: (cardsRows ?? []).length
        ? (cardsRows as { id: string; frente: string; verso: string; fontes: string[] }[]).map((c) => ({
            id: c.id,
            frente: c.frente,
            verso: c.verso,
            fontes: c.fontes.length ? c.fontes : [""],
          }))
        : [emptyCard()],
    })
  }

  const handleToggleAtivo = async (deck: FlashcardDeck) => {
    setDecks((prev) => prev.map((d) => (d.id === deck.id ? { ...d, ativo: !d.ativo } : d)))
    await supabase.from("materiais_flashcard_decks").update({ ativo: !deck.ativo }).eq("id", deck.id)
  }

  const addCard = () => setForm((p) => ({ ...p, cards: [...p.cards, emptyCard()] }))
  const removeCard = (idx: number) => setForm((p) => ({ ...p, cards: p.cards.filter((_, i) => i !== idx) }))
  const updateCard = (idx: number, field: "frente" | "verso", value: string) =>
    setForm((p) => ({ ...p, cards: p.cards.map((c, i) => (i === idx ? { ...c, [field]: value } : c)) }))

  const addFonte = (cardIdx: number) =>
    setForm((p) => ({ ...p, cards: p.cards.map((c, i) => (i === cardIdx ? { ...c, fontes: [...c.fontes, ""] } : c)) }))
  const removeFonte = (cardIdx: number, fonteIdx: number) =>
    setForm((p) => ({
      ...p,
      cards: p.cards.map((c, i) => (i === cardIdx ? { ...c, fontes: c.fontes.filter((_, j) => j !== fonteIdx) } : c)),
    }))
  const updateFonte = (cardIdx: number, fonteIdx: number, value: string) =>
    setForm((p) => ({
      ...p,
      cards: p.cards.map((c, i) =>
        i === cardIdx ? { ...c, fontes: c.fontes.map((f, j) => (j === fonteIdx ? value : f)) } : c
      ),
    }))

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      alert("Preencha o título do baralho.")
      return
    }
    const cardsLimpo = form.cards
      .map((c) => ({ frente: c.frente.trim(), verso: c.verso.trim(), fontes: c.fontes.map((f) => f.trim()).filter(Boolean) }))
      .filter((c) => c.frente && c.verso)
    if (cardsLimpo.length === 0) {
      alert("Adicione ao menos um cartão com frente e verso.")
      return
    }

    setSaving(true)
    const cor = getDisciplinaColor(form.disciplinaBase || undefined)
    const deckPayload = {
      titulo: form.titulo.trim(),
      materia: form.materia || null,
      subsecao: form.subsecao.trim() || null,
      disciplina_base: form.disciplinaBase || null,
      descricao: form.descricao.trim() || null,
      cor_hex: cor.hex,
      ordem: form.ordem,
      ativo: form.ativo,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }

    const isNew = !editingId
    let deckId = editingId
    if (editingId) {
      const { error } = await supabase.from("materiais_flashcard_decks").update(deckPayload).eq("id", editingId)
      if (error) {
        alert(`Erro ao salvar: ${error.message}`)
        setSaving(false)
        return
      }
      await supabase.from("materiais_flashcards").delete().eq("deck_id", editingId)
    } else {
      const { data, error } = await supabase.from("materiais_flashcard_decks").insert(deckPayload).select("id").single()
      if (error || !data) {
        alert(`Erro ao salvar: ${error?.message}`)
        setSaving(false)
        return
      }
      deckId = data.id
    }

    const cardsPayload = cardsLimpo.map((c, idx) => ({ deck_id: deckId, ordem: idx + 1, ...c }))
    const { error: cardsError } = await supabase.from("materiais_flashcards").insert(cardsPayload)

    setSaving(false)
    if (cardsError) {
      alert(`Erro ao salvar cartões: ${cardsError.message}`)
      return
    }
    if (isNew) {
      const materia = materiaLabel[form.materia] ?? form.materia
      enfileirarAviso(
        "flashcards",
        "Novos flashcards disponíveis",
        `Adicionamos um novo baralho de flashcards: "${deckPayload.titulo}" (${materia}). Já dá pra estudar!`,
        "/dashboard/materiais?tab=flashcards"
      )
    }
    setDialogOpen(false)
    load()
  }

  const handleDelete = async (deck: FlashcardDeck) => {
    if (!confirm(`Excluir o baralho "${deck.titulo}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from("materiais_flashcards").delete().eq("deck_id", deck.id)
    const { error } = await supabase.from("materiais_flashcard_decks").delete().eq("id", deck.id)
    if (error) {
      alert(`Erro ao excluir: ${error.message}`)
      return
    }
    setDecks((prev) => prev.filter((d) => d.id !== deck.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="gradient" className="gap-1.5" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Baralho
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando baralhos...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhum baralho encontrado.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((deck) => (
            <Card key={deck.id} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {deck.materia && <Badge variant="secondary">{materiaLabel[deck.materia] ?? deck.materia}</Badge>}
                    {deck.subsecao && <Badge variant="outline">{deck.subsecao}</Badge>}
                    {deck.disciplina_base && (
                      <Badge variant="outline">{disciplinaBaseLabel[deck.disciplina_base] ?? deck.disciplina_base}</Badge>
                    )}
                    <Badge variant="outline">Ordem {deck.ordem}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      {deck.total} cartões
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{deck.titulo}</p>
                  {deck.descricao && <p className="mt-1 text-xs text-muted-foreground">{deck.descricao}</p>}
                  {deck.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {deck.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Ativo</span>
                    <Switch checked={deck.ativo} onCheckedChange={() => handleToggleAtivo(deck)} />
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(deck)} aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(deck)}
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Baralho" : "Novo Baralho"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Farmacologia Cardiovascular"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                  placeholder="Breve descrição do que o baralho cobre..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Ano</Label>
                  <Select value={form.ano} onValueChange={(v) => handleAnoChange(v as AnoKey)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANO_KEYS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {anoLabel[a]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Matéria</Label>
                  <Select value={form.materia} onValueChange={(v) => setForm((p) => ({ ...p, materia: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIA_KEYS_BY_ANO[form.ano].map((m) => (
                        <SelectItem key={m} value={m}>
                          {materiaLabel[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Disciplina Base</Label>
                  <Select
                    value={form.disciplinaBase || "nenhuma"}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, disciplinaBase: v === "nenhuma" ? "" : (v as DisciplinaBaseKey) }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhuma">Nenhuma</SelectItem>
                      {DISCIPLINA_BASE_KEYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {disciplinaBaseLabel[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">A cor do baralho segue a disciplina escolhida.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subsecao">Subseção (opcional)</Label>
                <p className="text-xs text-muted-foreground">
                  Agrupa baralhos dentro da matéria (ex: "UP1", "UP2"). Deixe em branco se não se aplicar.
                </p>
                <Input
                  id="subsecao"
                  value={form.subsecao}
                  onChange={(e) => setForm((p) => ({ ...p, subsecao: e.target.value }))}
                  placeholder="Ex: UP1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ordem">Ordem de exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    min={1}
                    value={form.ordem}
                    onChange={(e) => setForm((p) => ({ ...p, ordem: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm((p) => ({ ...p, ativo: v }))} />
                  <Label>Visível para os alunos</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <p className="text-xs text-muted-foreground">
                  Usadas na busca da plataforma. Inclua o tema central (ex: Hipertensão) e a especialidade (ex: Clínica
                  Médica).
                </p>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="Ex: Hipertensão, Anti-hipertensivos, Clínica Médica"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label className="text-sm font-semibold">Cartões</Label>

              {form.cards.map((card, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Cartão {idx + 1}</span>
                    {form.cards.length > 1 && (
                      <Button size="icon-sm" variant="ghost" onClick={() => removeCard(idx)} aria-label="Remover cartão">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Frente (pergunta)</Label>
                    <Textarea value={card.frente} onChange={(e) => updateCard(idx, "frente", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Verso (resposta)</Label>
                    <Textarea value={card.verso} onChange={(e) => updateCard(idx, "verso", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Fontes (opcional)</Label>
                    {card.fontes.map((fonte, fonteIdx) => (
                      <div key={fonteIdx} className="flex items-center gap-2">
                        <Input
                          value={fonte}
                          onChange={(e) => updateFonte(idx, fonteIdx, e.target.value)}
                          placeholder={`Fonte ${fonteIdx + 1}`}
                        />
                        {card.fontes.length > 1 && (
                          <Button size="icon-sm" variant="ghost" onClick={() => removeFonte(idx, fonteIdx)} aria-label="Remover fonte">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addFonte(idx)}>
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar fonte
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addCard}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar cartão
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Baralho"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
