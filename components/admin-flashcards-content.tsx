"use client"

import { useEffect, useMemo, useState } from "react"
import { Layers, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { supabase, fetchAllFlashcardRefs } from "@/lib/supabase"
import { translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FlashcardDeckEditDialog } from "@/components/flashcard-deck-edit-dialog"
import type { FlashcardDeck } from "@/lib/flashcards-types"

const materiaLabel = translations.pt.cronograma.materiaLabel
const disciplinaBaseLabel = translations.pt.cronograma.disciplinaBaseLabel

export function AdminFlashcardsContent() {
  const [decks, setDecks] = useState<(FlashcardDeck & { total: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FlashcardDeck | null>(null)

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
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (deck: FlashcardDeck) => {
    setEditing(deck)
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (deck: FlashcardDeck) => {
    setDecks((prev) => prev.map((d) => (d.id === deck.id ? { ...d, ativo: !d.ativo } : d)))
    await supabase.from("materiais_flashcard_decks").update({ ativo: !deck.ativo }).eq("id", deck.id)
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

  const proximaOrdem = decks.length > 0 ? Math.max(...decks.map((d) => d.ordem)) + 1 : 1

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

      <FlashcardDeckEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deck={editing}
        proximaOrdem={proximaOrdem}
        onSaved={load}
      />
    </div>
  )
}
