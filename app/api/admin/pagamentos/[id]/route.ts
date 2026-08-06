import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { logAdminAction } from '@/lib/admin-audit'
import { aplicarPlanoSeContaExistir, type PlanoPago } from '@/lib/mercadopago'

const VALID_STATUS = ['aprovado', 'rejeitado', 'cancelado', 'pendente']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const status = typeof body.status === 'string' ? body.status : ''

  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: pagamento, error } = await supabase
    .from('pagamentos_mercadopago')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!pagamento) {
    return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 })
  }

  let planoAplicado = false
  if (status === 'aprovado' && !pagamento.aplicado_em) {
    planoAplicado = await aplicarPlanoSeContaExistir(
      supabase,
      pagamento.id,
      pagamento.email,
      pagamento.plano as PlanoPago
    )
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'update_pagamento',
    metadata: { pagamentoId: pagamento.id, email: pagamento.email, status, planoAplicado },
  })

  const { data: atualizado } = await supabase
    .from('pagamentos_mercadopago')
    .select()
    .eq('id', id)
    .maybeSingle()

  return NextResponse.json({ pagamento: atualizado ?? pagamento })
}
