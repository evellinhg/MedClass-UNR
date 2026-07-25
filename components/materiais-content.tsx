"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlanStatus } from "@/lib/plan-status"
import { PlanRestrictedNotice } from "@/components/plan-restricted-notice"
import { VideoaulasGrid } from "@/components/videoaulas-grid"
import { FlashcardDecksGrid } from "@/components/flashcard-decks-grid"
import { ResumosGrid } from "@/components/resumos-grid"

const VALID_TABS = ["videoaulas", "resumos", "flashcards"]

export function MateriaisContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab = VALID_TABS.includes(tabParam ?? "") ? (tabParam as string) : "videoaulas"
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) setActiveTab(tabParam)
  }, [tabParam])

  useEffect(() => {
    getPlanStatus().then((status) => {
      setLocked(!!status && !status.canAccessMateriais)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    )
  }

  if (locked) {
    return (
      <PlanRestrictedNotice
        tone="locked"
        title="Materiais é exclusivo dos planos pagos"
        description="Videoaulas, resumos e flashcards ficam disponíveis para quem assina o plano mensal ou trimestral. Escolha um plano para desbloquear."
      />
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
      <TabsList>
        <TabsTrigger value="videoaulas">Videoaulas</TabsTrigger>
        <TabsTrigger value="resumos">Resumos</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
      </TabsList>

      <TabsContent value="videoaulas">
        <VideoaulasGrid />
      </TabsContent>

      <TabsContent value="resumos">
        <ResumosGrid />
      </TabsContent>

      <TabsContent value="flashcards">
        <FlashcardDecksGrid />
      </TabsContent>
    </Tabs>
  )
}
