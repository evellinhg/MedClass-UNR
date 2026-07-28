import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    let authCookies: { name: string; value: string }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set({ name, value })
              authCookies.push({ name, value })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin))
      authCookies.forEach(({ name, value }) => {
        response.cookies.set(name, value, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
          httpOnly: true,
        })
      })
      return response
    }
  }

  return NextResponse.redirect(new URL("/login", origin))
}
