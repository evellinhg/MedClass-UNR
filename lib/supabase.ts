import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// A tabela materiais_flashcards já passou de 1000 linhas, o limite padrão
// de página do PostgREST — sem paginar, um select() simples trunca e os
// decks mais novos aparecem com 0 cartões.
export async function fetchAllFlashcardRefs() {
  const pageSize = 1000
  const rows: { id: string; deck_id: string }[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('materiais_flashcards')
      .select('id, deck_id')
      .range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...((data as { id: string; deck_id: string }[]) ?? []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return rows
}