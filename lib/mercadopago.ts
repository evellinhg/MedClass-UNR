import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

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

// Uma config por chamada (client-per-request) em vez de módulo compartilhado:
// evita ler process.env.MERCADOPAGO_ACCESS_TOKEN antes de ele existir em
// contextos de build/edge, e é o padrão recomendado pelo SDK oficial.
function config(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  return new MercadoPagoConfig({ accessToken })
}

interface CriarPreferenciaParams {
  plano: PlanoPago
  email: string
  nomeCompleto: string
  telefone: string
  dni: string
  externalReference: string
  origin: string
}

export async function criarPreferencia({
  plano,
  email,
  nomeCompleto,
  telefone,
  dni,
  externalReference,
  origin,
}: CriarPreferenciaParams) {
  const [nome, ...resto] = nomeCompleto.trim().split(/\s+/)
  const sobrenome = resto.join(" ") || nome

  const preference = new Preference(config())
  const result = await preference.create({
    body: {
      items: [
        {
          id: plano,
          title: PLANO_TITULO[plano],
          quantity: 1,
          unit_price: PLANO_PRECO[plano],
          currency_id: "ARS",
        },
      ],
      payer: {
        email,
        name: nome,
        surname: sobrenome,
        phone: { number: telefone },
        identification: { type: "DNI", number: dni },
      },
      external_reference: externalReference,
      back_urls: {
        success: `${origin}/checkout/sucesso`,
        failure: `${origin}/checkout/erro`,
        pending: `${origin}/checkout/pendente`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/webhooks/mercadopago`,
    },
  })

  if (!result.id || !result.init_point) {
    throw new Error("Mercado Pago não retornou id/init_point da preferência.")
  }

  return { id: result.id, init_point: result.init_point }
}

export async function buscarPagamento(paymentId: string) {
  const payment = new Payment(config())
  const result = await payment.get({ id: paymentId })

  return {
    id: result.id ?? null,
    status: result.status ?? null,
    external_reference: result.external_reference ?? null,
    transaction_amount: result.transaction_amount ?? null,
    payer: { email: result.payer?.email ?? null },
  }
}
