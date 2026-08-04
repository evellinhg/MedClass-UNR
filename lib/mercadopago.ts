const MP_API = "https://api.mercadopago.com"

export type PlanoPago = "mensal" | "trimestral"

export const PLANO_PRECO: Record<PlanoPago, number> = {
  mensal: 8000,
  trimestral: 18000,
}

export const PLANO_DURACAO_DIAS: Record<PlanoPago, number> = {
  mensal: 30,
  trimestral: 90,
}

export const PLANO_TITULO: Record<PlanoPago, string> = {
  mensal: "MedClass UNR — Plano Mensal",
  trimestral: "MedClass UNR — Plano Trimestral",
}

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  return token
}

interface CriarPreferenciaParams {
  plano: PlanoPago
  email: string
  externalReference: string
  origin: string
}

export async function criarPreferencia({ plano, email, externalReference, origin }: CriarPreferenciaParams) {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: PLANO_TITULO[plano],
          quantity: 1,
          unit_price: PLANO_PRECO[plano],
          currency_id: "ARS",
        },
      ],
      payer: { email },
      external_reference: externalReference,
      back_urls: {
        success: `${origin}/checkout/sucesso`,
        failure: `${origin}/checkout/erro`,
        pending: `${origin}/checkout/pendente`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/webhooks/mercadopago`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Erro ao criar preferência no Mercado Pago: ${res.status} ${body}`)
  }

  return res.json() as Promise<{ id: string; init_point: string; sandbox_init_point: string }>
}

export async function buscarPagamento(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Erro ao buscar pagamento no Mercado Pago: ${res.status} ${body}`)
  }
  return res.json() as Promise<{
    id: number
    status: string
    external_reference: string | null
    transaction_amount: number
    payer: { email: string | null }
  }>
}
