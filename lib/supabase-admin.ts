import { createClient } from '@supabase/supabase-js'

// Server-only client. Uses the service_role key, which bypasses RLS and can
// manage other users' auth records (email, password). Never import this file
// from a "use client" component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
