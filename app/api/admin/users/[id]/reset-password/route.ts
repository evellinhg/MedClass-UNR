import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/require-admin'
import { logAdminAction } from '@/lib/admin-audit'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { id } = await params

  if (id === admin.id) {
    return NextResponse.json({ error: 'Você não pode redefinir sua própria senha por aqui.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(id)
  if (getUserError || !targetUser.user?.email) {
    return NextResponse.json({ error: getUserError?.message ?? 'Usuário não encontrado.' }, { status: 400 })
  }

  const { origin } = new URL(request.url)
  const { error } = await supabase.auth.resetPasswordForEmail(targetUser.user.email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await logAdminAction({
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'reset_password',
    targetUserId: id,
    metadata: { target_email: targetUser.user.email },
  })

  return NextResponse.json({ ok: true, message: 'Email de redefinição enviado.' })
}
