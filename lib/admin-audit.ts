import { createAdminClient } from '@/lib/supabase-admin'

interface LogAdminActionParams {
  adminId: string
  adminEmail?: string | null
  action: string
  targetUserId?: string
  metadata?: Record<string, unknown>
}

export async function logAdminAction({ adminId, adminEmail, action, targetUserId, metadata }: LogAdminActionParams) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    admin_email: adminEmail ?? null,
    action,
    target_user_id: targetUserId ?? null,
    metadata: metadata ?? null,
  })
  if (error) {
    console.error('Falha ao gravar admin_audit_log:', error.message)
  }
}
