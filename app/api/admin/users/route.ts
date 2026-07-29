import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'

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
