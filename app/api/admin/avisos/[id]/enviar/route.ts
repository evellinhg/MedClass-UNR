import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
  const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim() : ''
  const destinosValidos = ['todas', 'premium', 'vip', 'colaboradores', 'gratis']
  const destino = destinosValidos.includes(body.destino) ? body.destino : 'todas'

  if (!titulo || !mensagem) {
    return NextResponse.json({ error: 'Título e mensagem são obrigatórios.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: aviso, error: avisoError } = await supabase
    .from('avisos_conteudo')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (avisoError) {
    return NextResponse.json({ error: avisoError.message }, { status: 500 })
  }
  if (!aviso) {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 })
  }
  if (aviso.status !== 'pendente') {
    return NextResponse.json({ error: 'Esse aviso já foi processado.' }, { status: 409 })
  }

  let profilesQuery = supabase.from('profiles').select('id')
  if (destino === 'premium') profilesQuery = profilesQuery.in('plan', ['mensal', 'trimestral'])
  else if (destino === 'vip') profilesQuery = profilesQuery.eq('plan', 'vip')
  else if (destino === 'colaboradores') profilesQuery = profilesQuery.eq('role', 'colaborador')
  else if (destino === 'gratis') profilesQuery = profilesQuery.eq('plan', 'gratis')

  const { data: profiles, error: profilesError } = await profilesQuery
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const notificacoes = (profiles ?? []).map((p) => ({
    user_id: p.id,
    titulo,
    mensagem,
    tipo: 'info' as const,
    link: aviso.link,
  }))

  if (notificacoes.length > 0) {
    const { error: insertError } = await supabase.from('notifications').insert(notificacoes)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('avisos_conteudo')
    .update({ titulo, mensagem, destino, status: 'enviado', enviado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ aviso: updated, enviados: notificacoes.length })
}
