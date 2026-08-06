import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { buscarPagamento, validarAssinaturaWebhook, aplicarPlanoSeContaExistir, type PlanoPago } from "@/lib/mercadopago"

// Mercado Pago chama essa rota (POST ou GET, conforme a integração) sempre
// que o status de um pagamento muda. Nunca confiamos no corpo da notificação
// -- sempre buscamos o pagamento de verdade na API do MP usando o id
// recebido, e só então decidimos o que fazer.
async function processarNotificacao(paymentId: string | null) {
  if (!paymentId) return NextResponse.json({ ok: true })

  const supabase = createAdminClient()

  let pagamentoMp
  try {
    pagamentoMp = await buscarPagamento(paymentId)
  } catch {
    // Se a busca falhar (ex: id de teste), so ignora -- MP reenvia notificações.
    return NextResponse.json({ ok: true })
  }

  const externalReference = pagamentoMp.external_reference
  if (!externalReference) return NextResponse.json({ ok: true })

  const { data: pagamento } = await supabase
    .from("pagamentos_mercadopago")
    .select("*")
    .eq("id", externalReference)
    .maybeSingle()

  if (!pagamento) return NextResponse.json({ ok: true })

  const novoStatus =
    pagamentoMp.status === "approved"
      ? "aprovado"
      : pagamentoMp.status === "rejected"
        ? "rejeitado"
        : pagamentoMp.status === "cancelled"
          ? "cancelado"
          : pagamento.status

  await supabase
    .from("pagamentos_mercadopago")
    .update({ status: novoStatus, mp_payment_id: String(pagamentoMp.id) })
    .eq("id", pagamento.id)

  if (novoStatus === "aprovado" && !pagamento.aplicado_em) {
    await aplicarPlanoSeContaExistir(supabase, pagamento.id, pagamento.email, pagamento.plano as PlanoPago)
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  let paymentId = searchParams.get("data.id") ?? searchParams.get("id")

  const assinaturaValida = validarAssinaturaWebhook({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: paymentId,
  })
  if (!assinaturaValida) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  if (!paymentId) {
    try {
      const body = await request.json()
      paymentId = body?.data?.id ?? null
    } catch {
      paymentId = null
    }
  }

  return processarNotificacao(paymentId)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get("data.id") ?? searchParams.get("id")

  const assinaturaValida = validarAssinaturaWebhook({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: paymentId,
  })
  if (!assinaturaValida) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  return processarNotificacao(paymentId)
}
