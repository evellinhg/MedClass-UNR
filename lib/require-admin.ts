import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/admin-config'

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null

  const admin = createAdminClient()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin' || isAdminEmail(data.user.email)
  if (!isAdmin) return null

  return data.user
}
