import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { logAdminAction } from '@/lib/admin-audit'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { email, full_name, plan, status, role, access_expires_at } = body as {
    email?: string
    full_name?: string
    plan?: string
    status?: string
    role?: string
    access_expires_at?: string | null
  }

  if (role && !['admin', 'aluno', 'colaborador'].includes(role)) {
    return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (email) {
    const { error } = await supabase.auth.admin.updateUserById(id, { email, email_confirm: true })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  // Reactivating a soft-deleted account lifts the auth ban set by DELETE below.
  if (status === 'active') {
    const { error } = await supabase.auth.admin.updateUserById(id, { ban_duration: 'none' })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  const profileUpdate: Record<string, unknown> = {}
  if (email) profileUpdate.email = email
  if (full_name !== undefined) profileUpdate.full_name = full_name
  if (plan) profileUpdate.plan = plan
  if (status) profileUpdate.status = status
  if (role) profileUpdate.role = role
  if (access_expires_at !== undefined) profileUpdate.access_expires_at = access_expires_at || null

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'update_user',
    targetUserId: id,
    metadata: profileUpdate,
  })

  return NextResponse.json({ ok: true })
}

// Soft delete: bans the account in Supabase Auth (blocks login) and marks the
// profile as 'deleted'. Nothing is erased, so support can still look up the
// account's history via the activity endpoint. Use PATCH { status: 'active' }
// to reverse it.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params
  if (id === admin.id) {
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error: banError } = await supabase.auth.admin.updateUserById(id, { ban_duration: '876000h' })
  if (banError) {
    return NextResponse.json({ error: banError.message }, { status: 400 })
  }

  const { error: profileError } = await supabase.from('profiles').update({ status: 'deleted' }).eq('id', id)
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'delete_user',
    targetUserId: id,
  })

  return NextResponse.json({ ok: true })
}
