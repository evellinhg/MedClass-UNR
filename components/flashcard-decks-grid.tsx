"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Pencil, Plus } from "lucide-react"
import { supabase, fetchAllFlashcardRefs } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getAreaIcon } from "@/lib/area-icons"
import { getAreaColor } from "@/lib/area-colors"
import { getDisciplinaIcon } from "@/lib/disciplina-icons"
import { getDisciplinaColor } from "@/lib/disciplina-colors"
import { ANO_KEYS, MATERIA_KEYS_BY_ANO, DISCIPLINA_BASE_KEYS } from "@/lib/unr-curriculum"
import type { FlashcardDeck } from "@/lib/flashcards-types"
import { NEON_COLORS, hexToRgba } from "@/lib/neon-colors"
import { useLanguage } from "@/lib/i18n"
import { useIsContentEditor } from "@/lib/use-content-editor"
import { FlashcardDeckEditDialog } from "@/components/flashcard-deck-edit-dialog"

interface DeckWithProgress extends FlashcardDeck {
  total: number
  respondidos: number
}

const SEM_CATEGORIA = "sem_categoria"

const MATERIA_ORDER = ANO_KEYS.flatMap((ano) => MATERIA_KEYS_BY_ANO[ano])

function DeckCard({
  deck,
  t,
  isEditor,
  onEdit,
}: {
  deck: DeckWithProgress
  t: ReturnType<typeof useLanguage>["t"]
  isEditor?: boolean
  onEdit?: (deck: DeckWithProgress) => void
}) {
  const Icon = deck.disciplina_base ? getDisciplinaIcon(deck.disciplina_base) : getAreaIcon(deck.especialidade)
  const cor = deck.disciplina_base ? getDisciplinaColor(deck.disciplina_base) : getAreaColor(deck.especialidade ?? "")
  const pct = deck.total > 0 ? Math.round((deck.respondidos / deck.total) * 100) : 0
  const concluido = deck.total > 0 && deck.respondidos === deck.total
  const disciplinaLabel =
    deck.disciplina_base && (t.cronograma.disciplinaBaseLabel[deck.disciplina_base] ?? deck.disciplina_base)

  return (
    <Link href={`/dashboard/materiais/flashcards/${deck.id}`} className="relative w-64 shrink-0 sm:w-72">
      <Card
        className={`group flex h-full flex-col gap-3 rounded-[24px] border p-5 transition-all ${cor.borderSoft} bg-card ${cor.hoverBorder} ${cor.hoverGlow}`}
      >
        {isEditor && onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit(deck)
            }}
            aria-label="Editar baralho"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${deck.cor_hex}1a` }}
          >
            <Icon className="h-5 w-5" style={{ color: deck.cor_hex }} />
          </div>
          {concluido && (
            <Badge className="bg-emerald-500 text-[10px] text-white hover:bg-emerald-500">{t.flashcardsGrid.concluido}</Badge>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {disciplinaLabel && (
            <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: deck.cor_hex }}>
              {disciplinaLabel}
            </span>
          )}
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{deck.titulo}</h3>
          {deck.descricao && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{deck.descricao}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{deck.total} {t.flashcardsGrid.cartoes}</span>
            <span>
              {deck.respondidos}/{deck.total} {t.flashcardsGrid.respondidos}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" style={{ ["--progress-color" as string]: deck.cor_hex }} />
        </div>
      </Card>
    </Link>
  )
}

function DeckRow({
  decks,
  t,
  isEditor,
  onEdit,
}: {
  decks: DeckWithProgress[]
  t: ReturnType<typeof useLanguage>["t"]
  isEditor?: boolean
  onEdit?: (deck: DeckWithProgress) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decks])

  const scrollByPage = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: direction * scrollRef.current.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Rolar para a esquerda"
          className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#c6ff3a] text-[#0a1f00] shadow-md transition-colors hover:bg-[#84cc16]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
      >
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} t={t} isEditor={isEditor} onEdit={onEdit} />
        ))}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Rolar para a direita"
          className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#c6ff3a] text-[#0a1f00] shadow-md transition-colors hover:bg-[#84cc16]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function FlashcardDecksGrid() {
  const { t } = useLanguage()
  const isEditor = useIsContentEditor()
  const [decks, setDecks] = useState<DeckWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const [{ data: decksData }, cards] = await Promise.all([
      supabase.from("materiais_flashcard_decks").select("*").eq("ativo", true).order("ordem"),
      fetchAllFlashcardRefs(),
    ])
    let respondidoIds = new Set<string>()
    if (userId) {
      const { data: progressoData } = await supabase
        .from("materiais_flashcard_progresso")
        .select("flashcard_id")
        .eq("user_id", userId)
      respondidoIds = new Set(((progressoData as { flashcard_id: string }[]) ?? []).map((p) => p.flashcard_id))
    }

    const decksComProgresso = ((decksData as FlashcardDeck[]) ?? []).map((deck) => {
      const cardsDoDeck = cards.filter((c) => c.deck_id === deck.id)
      const respondidos = cardsDoDeck.filter((c) => respondidoIds.has(c.id)).length
      return { ...deck, total: cardsDoDeck.length, respondidos }
    })

    setDecks(decksComProgresso)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openEdit = (deck: DeckWithProgress) => {
    setEditingDeck(deck)
    setEditDialogOpen(true)
  }

  const openNew = () => {
    setEditingDeck(null)
    setEditDialogOpen(true)
  }

  const proximaOrdem = decks.length > 0 ? Math.max(...decks.map((d) => d.ordem)) + 1 : 1

  const bySection = useMemo(() => {
    const porMateria = new Map<string, DeckWithProgress[]>()
    for (const deck of decks) {
      const materiaKey = deck.materia ?? SEM_CATEGORIA
      if (!porMateria.has(materiaKey)) porMateria.set(materiaKey, [])
      porMateria.get(materiaKey)!.push(deck)
    }

    const ordemDisciplina = [...DISCIPLINA_BASE_KEYS, SEM_CATEGORIA]
    const rankDisciplina = (d: DeckWithProgress) => {
      const idx = ordemDisciplina.indexOf(d.disciplina_base ?? SEM_CATEGORIA)
      return idx === -1 ? ordemDisciplina.length : idx
    }

    const ordemMateria = [...MATERIA_ORDER, SEM_CATEGORIA]
    return ordemMateria
      .filter((m) => porMateria.has(m))
      .map((materiaKey) => {
        const decksDaMateria = [...porMateria.get(materiaKey)!].sort((a, b) => rankDisciplina(a) - rankDisciplina(b))

        const porSubsecao = new Map<string | null, DeckWithProgress[]>()
        for (const deck of decksDaMateria) {
          const key = deck.subsecao || null
          if (!porSubsecao.has(key)) porSubsecao.set(key, [])
          porSubsecao.get(key)!.push(deck)
        }
        const subsections = Array.from(porSubsecao.entries())
          .map(([subsecaoKey, subsecaoDecks]) => ({
            subsecaoKey,
            decks: subsecaoDecks,
            minOrdem: Math.min(...subsecaoDecks.map((d) => d.ordem)),
          }))
          .sort((a, b) => (a.subsecaoKey === null ? -1 : b.subsecaoKey === null ? 1 : a.minOrdem - b.minOrdem))

        return { materiaKey, subsections }
      })
  }, [decks])

  const toggleSection = (materiaKey: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(materiaKey)) next.delete(materiaKey)
      else next.add(materiaKey)
      return next
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.flashcardsGrid.carregando}
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <div className="space-y-4">
        {isEditor && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Novo baralho
            </Button>
          </div>
        )}
        <Card className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t.flashcardsGrid.vazio}</p>
        </Card>
        {isEditor && (
          <FlashcardDeckEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            deck={editingDeck}
            proximaOrdem={proximaOrdem}
            onSaved={load}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isEditor && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo baralho
          </Button>
        </div>
      )}
      {bySection.map(({ materiaKey, subsections }, index) => {
        const isOpen = !collapsed.has(materiaKey)
        const materiaTitulo =
          materiaKey === SEM_CATEGORIA
            ? t.flashcardsGrid.semCategoria
            : t.cronograma.materiaLabel[materiaKey] ?? materiaKey
        const totalDecks = subsections.reduce((sum, s) => sum + s.decks.length, 0)
        const color = NEON_COLORS[index % NEON_COLORS.length].hex

        return (
          <section key={materiaKey}>
            <button
              type="button"
              onClick={() => toggleSection(materiaKey)}
              className="mb-4 flex w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left transition-transform hover:scale-[1.005]"
              style={{
                borderColor: hexToRgba(color, 0.5),
                backgroundColor: hexToRgba(color, 0.06),
                boxShadow: `0 0 20px -8px ${hexToRgba(color, 0.6)}`,
              }}
            >
              <span className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{materiaTitulo}</h2>
                <Badge variant="outline" className="text-[11px]" style={{ borderColor: hexToRgba(color, 0.4), color }}>
                  {totalDecks}
                </Badge>
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" style={{ color }} />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" style={{ color }} />
              )}
            </button>

            {isOpen && (
              <div className="space-y-5">
                {subsections.map(({ subsecaoKey, decks: decksDaSubsecao }) => (
                  <div key={subsecaoKey ?? "_"}>
                    {subsecaoKey && (
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {subsecaoKey}
                        <Badge variant="outline" className="text-[10px] font-normal normal-case">
                          {decksDaSubsecao.length}
                        </Badge>
                      </h3>
                    )}
                    <DeckRow decks={decksDaSubsecao} t={t} isEditor={isEditor} onEdit={openEdit} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      {isEditor && (
        <FlashcardDeckEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          deck={editingDeck}
          proximaOrdem={proximaOrdem}
          onSaved={load}
        />
      )}
    </div>
  )
}
