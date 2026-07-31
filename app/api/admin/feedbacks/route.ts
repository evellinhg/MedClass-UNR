import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const { data: feedbacks, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userIds = Array.from(new Set((feedbacks ?? []).map((f) => f.user_id)))
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000'])

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  const enriched = (feedbacks ?? []).map((f) => ({
    ...f,
    usuario: profileById.get(f.user_id) ?? null,
  }))

  return NextResponse.json({ feedbacks: enriched })
}
