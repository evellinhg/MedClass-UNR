import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { logAdminAction } from '@/lib/admin-audit'
import { aplicarPlanoSeContaExistir, PLANO_PRECO, type PlanoPago } from '@/lib/mercadopago'

// Pré-cadastro manual de plano feito pelo admin (painel Usuários > Criar
// conta): registra em pagamentos_mercadopago com status já 'aprovado'
// (não passou por nenhum checkout de verdade -- é uma concessão direta).
// Se a conta com esse e-mail já existir, aplica o plano na hora; se não,
// fica pendente e /api/pagamentos/reivindicar aplica sozinho na primeira
// vez que a pessoa criar a conta/logar com esse e-mail.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { email, nomeCompleto, telefone, plano } = body as {
    email?: string
    nomeCompleto?: string
    telefone?: string
    plano?: string
  }

  if (plano !== 'mensal' && plano !== 'trimestral') {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  const planoValidado = plano as PlanoPago
  const supabase = createAdminClient()

  const { data: pagamento, error } = await supabase
    .from('pagamentos_mercadopago')
    .insert({
      email: email.trim().toLowerCase(),
      nome_completo: nomeCompleto?.trim() || null,
      telefone: telefone?.trim() || null,
      plano: planoValidado,
      valor: PLANO_PRECO[planoValidado],
      status: 'aprovado',
    })
    .select()
    .single()

  if (error || !pagamento) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao criar pré-cadastro.' }, { status: 500 })
  }

  const planoAplicado = await aplicarPlanoSeContaExistir(supabase, pagamento.id, pagamento.email, planoValidado)

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'criar_pre_cadastro_plano',
    metadata: { email: pagamento.email, plano: planoValidado, planoAplicado },
  })

  return NextResponse.json({ pagamento, planoAplicado })
}
