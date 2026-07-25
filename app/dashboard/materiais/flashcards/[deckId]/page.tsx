import { DashboardLayout } from "@/components/dashboard-layout"
import { FlashcardDeckViewer } from "@/components/flashcard-deck-viewer"

export default async function FlashcardDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FlashcardDeckViewer deckId={deckId} />
      </div>
    </DashboardLayout>
  )
}
