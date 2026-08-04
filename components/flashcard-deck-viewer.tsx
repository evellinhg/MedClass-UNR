"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Lock, PartyPopper, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getAreaIcon } from "@/lib/area-icons"
import { getDisciplinaIcon } from "@/lib/disciplina-icons"
import type { Flashcard, FlashcardDeck } from "@/lib/flashcards-types"
import { trackEvent } from "@/lib/analytics"
import { registrarAtividadeHoje } from "@/lib/atividade-diaria"
import { getPlanStatus } from "@/lib/plan-status"

const FREE_CARTAS_POR_DECK = 2

const NIVEL_COLORS: Record<number, string> = {
  0: "#EF4444",
  1: "#F97316",
  2: "#F59E0B",
  3: "#84CC16",
  4: "#22C55E",
  5: "#10B981",
}

interface FlashcardDeckViewerProps {
  deckId: string
}

export function FlashcardDeckViewer({ deckId }: FlashcardDeckViewerProps) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [deck, setDeck] = useState<FlashcardDeck | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [progressoMap, setProgressoMap] = useState<Record<string, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [fontesOpen, setFontesOpen] = useState(false)
  const [showConcluido, setShowConcluido] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasFullAccess, setHasFullAccess] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)

      const [{ data: deckData }, { data: cardsData }, planStatus] = await Promise.all([
        supabase.from("materiais_flashcard_decks").select("*").eq("id", deckId).maybeSingle(),
        supabase.from("materiais_flashcards").select("*").eq("deck_id", deckId).order("ordem"),
        getPlanStatus(),
      ])
      setHasFullAccess(planStatus?.hasFullAccess ?? true)

      const cardsList = (cardsData as Flashcard[]) ?? []
      setDeck((deckData as FlashcardDeck) ?? null)
      setCards(cardsList)

      if (uid && cardsList.length > 0) {
        const { data: progressoData } = await supabase
          .from("materiais_flashcard_progresso")
          .select("flashcard_id, nivel")
          .eq("user_id", uid)
          .in(
            "flashcard_id",
            cardsList.map((c) => c.id)
          )
        const map: Record<string, number> = {}
        for (const p of (progressoData as { flashcard_id: string; nivel: number }[]) ?? []) {
          map[p.flashcard_id] = p.nivel
        }
        setProgressoMap(map)
        const firstUnanswered = cardsList.findIndex((c) => map[c.id] === undefined)
        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
      }

      setLoading(false)
    }
    load()
  }, [deckId])

  const respondidos = useMemo(() => cards.filter((c) => progressoMap[c.id] !== undefined).length, [cards, progressoMap])
  const currentCard = cards[currentIndex]
  const limiteCartas = hasFullAccess ? cards.length : Math.min(FREE_CARTAS_POR_DECK, cards.length)
  const cartaBloqueada = currentIndex >= limiteCartas

  const goTo = (index: number) => {
    if (index < 0 || index >= cards.length) return
    setCurrentIndex(index)
    setFlipped(false)
    setFontesOpen(false)
  }

  const handleRate = async (nivel: number) => {
    if (!userId || !currentCard || saving || cartaBloqueada) return
    setSaving(true)
    const jaTinhaResposta = progressoMap[currentCard.id] !== undefined
    await supabase
      .from("materiais_flashcard_progresso")
      .upsert(
        { user_id: userId, flashcard_id: currentCard.id, nivel, respondido_em: new Date().toISOString() },
        { onConflict: "user_id,flashcard_id" }
      )

    trackEvent("flashcard_revisado", { flashcard_id: currentCard.id, nivel, deck_id: deckId })

    const novoMap = { ...progressoMap, [currentCard.id]: nivel }
    setProgressoMap(novoMap)
    setSaving(false)

    const novoTotalRespondidos = cards.filter((c) => novoMap[c.id] !== undefined).length
    if (!jaTinhaResposta && novoTotalRespondidos === cards.length) {
      registrarAtividadeHoje()
      setShowConcluido(true)
      return
    }

    const proximoIndex = cards.findIndex((c, i) => i > currentIndex && novoMap[c.id] === undefined)
    if (proximoIndex !== -1) {
      goTo(proximoIndex)
    } else if (currentIndex < cards.length - 1) {
      goTo(currentIndex + 1)
    }
  }

  const handleRefazer = () => {
    setShowConcluido(false)
    goTo(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (!deck || cards.length === 0) {
    return (
      <Card className="border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Baralho não encontrado.</p>
        <Link
          href="/dashboard/materiais?tab=flashcards"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Voltar para Flashcards
        </Link>
      </Card>
    )
  }

  const Icon = deck.disciplina_base ? getDisciplinaIcon(deck.disciplina_base) : getAreaIcon(deck.especialidade)

  if (showConcluido) {
    const niveis = cards.map((c) => progressoMap[c.id]).filter((n): n is number => n !== undefined)
    const media = niveis.length > 0 ? niveis.reduce((a, b) => a + b, 0) / niveis.length : 0

    return (
      <Card className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-card p-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
        >
          <PartyPopper className="h-12 w-12 text-primary" />
        </motion.div>
        <div>
          <p className="text-xl font-bold text-foreground">Baralho concluído!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Você respondeu todos os {cards.length} cartões de {deck.titulo}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Cartões respondidos</p>
            <p className="font-semibold text-foreground">{cards.length}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Autoavaliação média</p>
            <p className="font-semibold text-foreground">{media.toFixed(1)} / 5</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleRefazer}>
            <RotateCcw className="h-4 w-4" />
            Refazer baralho
          </Button>
          <Button asChild>
            <Link href="/dashboard/materiais?tab=flashcards">Ver outros baralhos</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${deck.cor_hex}1a` }}
          >
            <Icon className="h-5 w-5" style={{ color: deck.cor_hex }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} de {cards.length} · {respondidos}/{cards.length} respondidos
            </p>
            <h2 className="text-lg font-bold text-foreground">{deck.titulo}</h2>
          </div>
        </div>
        <Badge variant={respondidos === cards.length ? "default" : "secondary"}>
          {respondidos === cards.length ? "Concluído" : "Em andamento"}
        </Badge>
      </div>

      <div className="flex gap-1">
        {cards.map((c, i) => (
          <div
            key={c.id}
            className="h-1.5 flex-1 rounded-full"
            style={{
              backgroundColor:
                progressoMap[c.id] !== undefined
                  ? NIVEL_COLORS[progressoMap[c.id]]
                  : i === currentIndex
                    ? `${deck.cor_hex}66`
                    : "var(--border)",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label="Cartão anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-h-72 flex-1" style={{ perspective: 1200 }}>
          {cartaBloqueada ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-[24px] border border-border bg-card p-6 text-center sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">Disponível apenas nos planos pagos</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                No plano gratuito você tem acesso às {FREE_CARTAS_POR_DECK} primeiras cartas de cada baralho.
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link href="/#pricing">Ver planos e continuar estudando</Link>
              </Button>
            </div>
          ) : (
            <motion.div
              className="relative min-h-72 w-full cursor-pointer rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-10"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div className="absolute right-6 top-6" style={{ backfaceVisibility: "hidden" }}>
                <Badge variant="outline">Frente</Badge>
              </div>
              <div
                className="flex min-h-60 flex-col items-center justify-center gap-3 text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">{currentCard.frente}</p>
                {!flipped && <p className="text-sm text-muted-foreground">Toque para ver a resposta</p>}
              </div>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[24px] bg-card p-6 text-center sm:p-10"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="absolute right-6 top-6">
                  <Badge>Verso</Badge>
                </div>
                <p className="text-base leading-relaxed text-foreground sm:text-lg">{currentCard.verso}</p>
              </div>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === cards.length - 1}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label="Próximo cartão"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!cartaBloqueada && (
        <Card className="rounded-[24px] border border-border bg-card p-5">
          <p className="text-center text-sm font-medium text-foreground">
            Qual nota você dá para seu conhecimento nesse assunto?
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => {
              const selecionado = progressoMap[currentCard.id] === n
              return (
                <button
                  key={n}
                  type="button"
                  disabled={saving}
                  onClick={() => handleRate(n)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-transform hover:scale-105 disabled:opacity-50"
                  style={{
                    borderColor: NIVEL_COLORS[n],
                    backgroundColor: selecionado ? NIVEL_COLORS[n] : `${NIVEL_COLORS[n]}14`,
                    color: selecionado ? "#fff" : NIVEL_COLORS[n],
                  }}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">0 = Não sabia · 5 = Sei tudo</p>
        </Card>
      )}

      {!cartaBloqueada && currentCard.fontes.length > 0 && (
        <Collapsible open={fontesOpen} onOpenChange={setFontesOpen}>
          <Card className="rounded-[24px] border border-border bg-card p-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                Fontes
                <Badge variant="secondary">{currentCard.fontes.length}</Badge>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${fontesOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-1.5">
              {currentCard.fontes.map((fonte, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  • {fonte}
                </p>
              ))}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}
