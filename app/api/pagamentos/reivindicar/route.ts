import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase-admin"
import { PLANO_DURACAO_DIAS, type PlanoPago } from "@/lib/mercadopago"

// Chamado no carregamento do dashboard (fire-and-forget). Se essa conta tem
// algum pagamento aprovado no Mercado Pago com o mesmo e-mail que ainda não
// foi aplicado (porque a compra aconteceu antes de criar a conta, ou o
// webhook chegou antes de a conta existir), aplica o plano agora.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Não autenticado." }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: userData, error: userError } = await anon.auth.getUser(token)
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const email = userData.user.email
  const supabase = createAdminClient()

  const { data: perfil } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userData.user.id)
    .maybeSingle()

  if (perfil?.status === "pending") {
    await supabase.from("profiles").update({ status: "active" }).eq("id", userData.user.id)
  }

  const { data: pagamento } = await supabase
    .from("pagamentos_mercadopago")
    .select("id, plano")
    .eq("email", email)
    .eq("status", "aprovado")
    .is("aplicado_em", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!pagamento) return NextResponse.json({ aplicado: false })

  const plano = pagamento.plano as PlanoPago
  const expira = new Date()
  expira.setDate(expira.getDate() + PLANO_DURACAO_DIAS[plano])

  await supabase
    .from("profiles")
    .update({ plan: plano, access_expires_at: expira.toISOString() })
    .eq("id", userData.user.id)

  await supabase
    .from("pagamentos_mercadopago")
    .update({ aplicado_em: new Date().toISOString() })
    .eq("id", pagamento.id)

  return NextResponse.json({ aplicado: true, plano })
}
