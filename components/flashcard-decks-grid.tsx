"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getAreaIcon } from "@/lib/area-icons"
import { getAreaColor } from "@/lib/area-colors"
import type { FlashcardDeck } from "@/lib/flashcards-types"
import { useLanguage } from "@/lib/i18n"

interface DeckWithProgress extends FlashcardDeck {
  total: number
  respondidos: number
}

export function FlashcardDecksGrid() {
  const { t } = useLanguage()
  const [decks, setDecks] = useState<DeckWithProgress[]>([])
  const [loading, setLoading] = useState(true)

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => {
        const Icon = getAreaIcon(deck.especialidade)
        const cor = getAreaColor(deck.especialidade)
        const pct = deck.total > 0 ? Math.round((deck.respondidos / deck.total) * 100) : 0
        const concluido = deck.total > 0 && deck.respondidos === deck.total

        return (
          <Link key={deck.id} href={`/dashboard/materiais/flashcards/${deck.id}`}>
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
                <Badge variant="secondary" className="text-[11px]">
                  {deck.especialidade}
                </Badge>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">{deck.titulo}</h3>
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
      })}
    </div>
  )
}
