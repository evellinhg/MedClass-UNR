"use client"

import { useEffect, useState } from "react"
import { FileText, Layers, PlayCircle, Clock, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlanStatus } from "@/lib/plan-status"
import { PlanRestrictedNotice } from "@/components/plan-restricted-notice"

interface Videoaula {
  title: string
  subject: string
  duration: string
}

interface Resumo {
  title: string
  subject: string
  pages: string
}

interface Flashcard {
  title: string
  subject: string
  cards: number
}

const videoaulas: Videoaula[] = [
  { title: "Insuficiência Cardíaca Congestiva", subject: "Clínica Médica", duration: "42 min" },
  { title: "Abdome Agudo — Diagnóstico Diferencial", subject: "Cirurgia", duration: "38 min" },
  { title: "Pré-natal de Alto Risco", subject: "Gineco/Obst.", duration: "51 min" },
  { title: "Convulsões na Infância", subject: "Pediatria", duration: "29 min" },
  { title: "Transtornos de Ansiedade", subject: "Psiquiatria", duration: "33 min" },
  { title: "Epidemiologia das DCNTs", subject: "Medicina Preventiva", duration: "27 min" },
]

const resumos: Resumo[] = [
  { title: "Arritmias Cardíacas — Guia Rápido", subject: "Clínica Médica", pages: "12 pág." },
  { title: "Politrauma e Protocolo ATLS", subject: "Cirurgia", pages: "18 pág." },
  { title: "Assistência ao Parto Normal", subject: "Gineco/Obst.", pages: "10 pág." },
  { title: "Calendário Vacinal Infantil", subject: "Pediatria", pages: "6 pág." },
  { title: "Transtornos do Humor — DSM-5", subject: "Psiquiatria", pages: "14 pág." },
]

const flashcards: Flashcard[] = [
  { title: "Fármacos Anti-hipertensivos", subject: "Farmacologia", cards: 40 },
  { title: "Anatomia do Tórax", subject: "Anatomia", cards: 65 },
  { title: "Síndromes Geriátricas", subject: "Clínica Médica", cards: 28 },
  { title: "Semiologia Abdominal", subject: "Cirurgia", cards: 34 },
]

function ContentGrid({
  items,
  icon: Icon,
  meta,
}: {
  items: { title: string; subject: string }[]
  icon: typeof PlayCircle
  meta: (item: any) => string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.title}
          className="group overflow-hidden border-border bg-card p-0 transition-colors hover:border-primary/50"
        >
          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[#8b5cf6]/15 to-[#6366f1]/15">
            <Icon className="h-9 w-9 text-primary transition-transform group-hover:scale-110" />
          </div>
          <div className="space-y-2 p-4">
            <Badge variant="secondary" className="text-[11px]">
              {item.subject}
            </Badge>
            <h3 className="text-sm font-semibold leading-snug text-foreground">{item.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {meta(item)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function MateriaisContent() {
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

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
    <Tabs defaultValue="videoaulas" className="gap-6">
      <TabsList>
        <TabsTrigger value="videoaulas">Videoaulas</TabsTrigger>
        <TabsTrigger value="resumos">Resumos</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
      </TabsList>

      <TabsContent value="videoaulas">
        <ContentGrid items={videoaulas} icon={PlayCircle} meta={(item: Videoaula) => item.duration} />
      </TabsContent>

      <TabsContent value="resumos">
        <ContentGrid items={resumos} icon={FileText} meta={(item: Resumo) => item.pages} />
      </TabsContent>

      <TabsContent value="flashcards">
        <ContentGrid items={flashcards} icon={Layers} meta={(item: Flashcard) => `${item.cards} cartões`} />
      </TabsContent>
    </Tabs>
  )
}
