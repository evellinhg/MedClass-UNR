import { createServerClient } from "@supabase/ssr"
import { type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const allCookies = request.cookies.getAll()

  return Response.json({
    cookiesCount: allCookies.length,
    cookieNames: allCookies.map((c) => c.name),
    hasAuthToken: allCookies.some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    ),
    user: user ? { id: user.id, email: user.email } : null,
    authError: error?.message ?? null,
    url: request.url,
  })
}
