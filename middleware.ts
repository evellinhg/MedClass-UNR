import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

// Este arquivo substitui o antigo proxy.ts, que implementava exatamente essa
// lógica mas nunca era executado -- Next.js só reconhece middleware nomeado
// "middleware.ts" na raiz do projeto. proxy.ts ficava "pendurado" no repo
// sem nunca rodar, dando a falsa impressão de que /admin já tinha proteção
// de rota no nível de framework.
//
// Importante: isto é só a camada de UX (redireciona antes de renderizar).
// A proteção que realmente importa é a RLS do Postgres em cada tabela --
// esse middleware não impede alguém de chamar a API do Supabase direto
// (mesma anon key + o próprio JWT), então nunca trate isso como a única
// barreira contra um aluno lendo/escrevendo tabelas de admin.

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request)

  if (!checkRateLimit(ip, 100, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const PROTECTED_ROUTES = ["/dashboard", "/admin", "/questoes"]
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, access_expires_at")
      .eq("id", user.id)
      .maybeSingle()

    const accessExpired = !!profile?.access_expires_at && new Date(profile.access_expires_at) < new Date()
    const isAdminOrColaborador = profile?.role === "admin" || profile?.role === "colaborador"

    if (!isAdminOrColaborador || accessExpired) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
