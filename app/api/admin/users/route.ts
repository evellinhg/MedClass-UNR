import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { logAdminAction } from '@/lib/admin-audit'

const VALID_ROLES = ['admin', 'aluno', 'colaborador']
const VALID_PLANS = ['gratis', 'mensal', 'trimestral', 'vip']

// Pré-cadastro: cria a conta de verdade (auth.users) já com role/plano/
// expiração configurados e profiles.status='pending' -- aparece na aba
// "Pendentes" do painel. Quando essa pessoa logar pela primeira vez com
// esse e-mail (Google ou e-mail/senha), o Supabase reconhece a conta já
// existente em vez de criar uma nova com os valores padrão.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { email, full_name, plan, role, access_expires_at } = body as {
    email?: string
    full_name?: string
    plan?: string
    role?: string
    access_expires_at?: string | null
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 })
  }
  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    email_confirm: true,
    user_metadata: full_name?.trim() ? { full_name: full_name.trim() } : undefined,
  })

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Erro ao criar conta.' }, { status: 400 })
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: full_name?.trim() || null,
      plan,
      role,
      access_expires_at: access_expires_at || null,
      status: 'pending',
    })
    .eq('id', created.user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'create_user',
    targetUserId: created.user.id,
    metadata: { email, plan, role },
  })

  return NextResponse.json({ ok: true, id: created.user.id })
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const [{ data: authList, error: authError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 200 }),
      supabase.from('profiles').select('id, plan, status, full_name, email, role, access_expires_at'),
    ])

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }
  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  const users = authList.users.map((u) => {
    const profile = profileById.get(u.id)
    return {
      id: u.id,
      email: u.email,
      full_name: profile?.full_name ?? u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
      plan: profile?.plan ?? 'gratis',
      status: profile?.status ?? 'active',
      role: profile?.role ?? 'aluno',
      access_expires_at: profile?.access_expires_at ?? null,
      provider: u.app_metadata?.provider ?? 'email',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }
  })

  return NextResponse.json({ users })
}
