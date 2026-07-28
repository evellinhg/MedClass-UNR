import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=; path=/; max-age=0`
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    storage: cookieStorage,
    storageKey: 'sb-dskukjeynbebthgithcb-auth',
  },
})