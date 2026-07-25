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
  const { email, full_name, plan } = body as { email?: string; full_name?: string; plan?: string }

  const supabase = createAdminClient()

  if (email) {
    const { error } = await supabase.auth.admin.updateUserById(id, { email, email_confirm: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  const profileUpdate: Record<string, unknown> = {}
  if (email) profileUpdate.email = email
  if (full_name !== undefined) profileUpdate.full_name = full_name
  if (plan) profileUpdate.plan = plan

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  return NextResponse.json({ ok: true })
}
