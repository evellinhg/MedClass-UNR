import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { criarPreferencia, PLANO_PRECO, type PlanoPago } from "@/lib/mercadopago"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { plano, email, nomeCompleto, telefone, dni } = body as {
    plano?: string
    email?: string
    nomeCompleto?: string
    telefone?: string
    dni?: string
  }

  if (plano !== "mensal" && plano !== "trimestral") {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 })
  }
  if (!nomeCompleto?.trim() || !telefone?.trim() || !dni?.trim()) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 })
  }

  const planoValidado = plano as PlanoPago
  const supabase = createAdminClient()

  const { data: pagamento, error: insertError } = await supabase
    .from("pagamentos_mercadopago")
    .insert({
      email,
      nome_completo: nomeCompleto.trim(),
      telefone: telefone.trim(),
      dni: dni.trim(),
      plano: planoValidado,
      valor: PLANO_PRECO[planoValidado],
      status: "pendente",
    })
    .select("id")
    .single()

  if (insertError || !pagamento) {
    return NextResponse.json({ error: insertError?.message ?? "Erro ao registrar pagamento." }, { status: 500 })
  }

  try {
    const preferencia = await criarPreferencia({
      plano: planoValidado,
      email,
      nomeCompleto: nomeCompleto.trim(),
      telefone: telefone.trim(),
      dni: dni.trim(),
      externalReference: pagamento.id,
      origin: request.nextUrl.origin,
    })

    await supabase
      .from("pagamentos_mercadopago")
      .update({ mp_preference_id: preferencia.id })
      .eq("id", pagamento.id)

    return NextResponse.json({ init_point: preferencia.init_point })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao criar checkout." }, { status: 500 })
  }
}
