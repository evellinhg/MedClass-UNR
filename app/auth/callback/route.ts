import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    let authResponse: NextResponse | null = null

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options })
            })
            authResponse = NextResponse.redirect(new URL(next, origin))
            cookiesToSet.forEach(({ name, value, options }) => {
              authResponse!.cookies.set(name, value, {
                ...options,
                secure: true,
                sameSite: "lax",
                path: "/",
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authResponse) {
      return authResponse
    }
  }

  return NextResponse.redirect(new URL("/login", origin))
}
