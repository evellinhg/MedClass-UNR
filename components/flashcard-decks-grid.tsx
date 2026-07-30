"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getAreaIcon } from "@/lib/area-icons"
import { getAreaColor } from "@/lib/area-colors"
import { getDisciplinaIcon } from "@/lib/disciplina-icons"
import { getDisciplinaColor } from "@/lib/disciplina-colors"
import { ANO_KEYS, MATERIA_KEYS_BY_ANO, DISCIPLINA_BASE_KEYS } from "@/lib/unr-curriculum"
import type { FlashcardDeck } from "@/lib/flashcards-types"
import { useLanguage } from "@/lib/i18n"

interface DeckWithProgress extends FlashcardDeck {
  total: number
  respondidos: number
}

const SEM_CATEGORIA = "sem_categoria"

const MATERIA_ORDER = ANO_KEYS.flatMap((ano) => MATERIA_KEYS_BY_ANO[ano])

function DeckCard({ deck, t }: { deck: DeckWithProgress; t: ReturnType<typeof useLanguage>["t"] }) {
  const Icon = deck.disciplina_base ? getDisciplinaIcon(deck.disciplina_base) : getAreaIcon(deck.especialidade)
  const cor = deck.disciplina_base ? getDisciplinaColor(deck.disciplina_base) : getAreaColor(deck.especialidade ?? "")
  const pct = deck.total > 0 ? Math.round((deck.respondidos / deck.total) * 100) : 0
  const concluido = deck.total > 0 && deck.respondidos === deck.total

  return (
    <Link href={`/dashboard/materiais/flashcards/${deck.id}`}>
      <Card
        className={`group flex h-full flex-col gap-3 rounded-[24px] border p-5 transition-all ${cor.borderSoft} bg-card ${cor.hoverBorder} ${cor.hoverGlow}`}
      >
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
          <h3 className="text-sm font-semibold leading-snug text-foreground">{deck.titulo}</h3>
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

export function FlashcardDecksGrid() {
  const { t } = useLanguage()
  const [decks, setDecks] = useState<DeckWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      const [{ data: decksData }, { data: cardsData }] = await Promise.all([
        supabase.from("materiais_flashcard_decks").select("*").eq("ativo", true).order("ordem"),
        supabase.from("materiais_flashcards").select("id, deck_id"),
      ])

      const cards = (cardsData as { id: string; deck_id: string }[]) ?? []
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
    load()
  }, [])

  const bySection = useMemo(() => {
    const porMateria = new Map<string, Map<string, DeckWithProgress[]>>()
    for (const deck of decks) {
      const materiaKey = deck.materia ?? SEM_CATEGORIA
      const disciplinaKey = deck.disciplina_base ?? SEM_CATEGORIA
      if (!porMateria.has(materiaKey)) porMateria.set(materiaKey, new Map())
      const porDisciplina = porMateria.get(materiaKey)!
      if (!porDisciplina.has(disciplinaKey)) porDisciplina.set(disciplinaKey, [])
      porDisciplina.get(disciplinaKey)!.push(deck)
    }

    const ordemMateria = [...MATERIA_ORDER, SEM_CATEGORIA]
    return ordemMateria
      .filter((m) => porMateria.has(m))
      .map((materiaKey) => {
        const porDisciplina = porMateria.get(materiaKey)!
        const ordemDisciplina = [...DISCIPLINA_BASE_KEYS, SEM_CATEGORIA]
        const disciplinas = ordemDisciplina
          .filter((d) => porDisciplina.has(d))
          .map((disciplinaKey) => ({ disciplinaKey, decks: porDisciplina.get(disciplinaKey)! }))
        const total = disciplinas.reduce((s, d) => s + d.decks.length, 0)
        return { materiaKey, disciplinas, total }
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
      <Card className="border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t.flashcardsGrid.vazio}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {bySection.map(({ materiaKey, disciplinas, total }) => {
        const isOpen = !collapsed.has(materiaKey)
        const materiaTitulo =
          materiaKey === SEM_CATEGORIA
            ? t.flashcardsGrid.semCategoria
            : t.cronograma.materiaLabel[materiaKey] ?? materiaKey

        return (
          <section key={materiaKey}>
            <button
              type="button"
              onClick={() => toggleSection(materiaKey)}
              className="mb-4 flex w-full items-center justify-between gap-2 border-b border-border pb-2 text-left"
            >
              <span className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{materiaTitulo}</h2>
                <Badge variant="secondary" className="text-[11px]">{total}</Badge>
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="space-y-6">
                {disciplinas.map(({ disciplinaKey, decks: decksDaDisciplina }) => (
                  <div key={disciplinaKey}>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                      {disciplinaKey === SEM_CATEGORIA
                        ? t.flashcardsGrid.semCategoria
                        : t.cronograma.disciplinaBaseLabel[disciplinaKey] ?? disciplinaKey}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {decksDaDisciplina.map((deck) => (
                        <DeckCard key={deck.id} deck={deck} t={t} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
