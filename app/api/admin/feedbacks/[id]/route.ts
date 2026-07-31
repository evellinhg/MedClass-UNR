import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const resposta = typeof body.resposta_admin === 'string' ? body.resposta_admin.trim() : ''

  if (!resposta) {
    return NextResponse.json({ error: 'Resposta não pode ficar vazia.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('feedbacks')
    .update({
      resposta_admin: resposta,
      status: 'respondido',
      respondido_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Feedback não encontrado.' }, { status: 404 })
  }

  return NextResponse.json({ feedback: data })
}
