"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type PlanoPago = "mensal" | "trimestral"

// Links de pagamento fixos, gerados direto no painel do Mercado Pago
// (produto "Pagar" / link de pagamento) -- não dependem da API nem do
// Wallet Brick, que estavam bloqueados. A liberação de acesso é manual:
// o aluno paga por esse link e manda o comprovante por WhatsApp.
const PLANO_INFO: Record<PlanoPago, { nome: string; preco: string; periodo: string; link: string }> = {
  mensal: { nome: "Plano Mensal", preco: "$ 8.000", periodo: "/mes", link: "https://mpago.la/1XoZzdw" },
  trimestral: { nome: "Plano Trimestral", preco: "$ 18.000", periodo: "/trimestre", link: "https://mpago.la/2VVKs4n" },
}

const WHATSAPP_SUPORTE = "543412290349"

export default function CheckoutPage({ params }: { params: Promise<{ plano: string }> }) {
  const { plano: planoParam } = use(params)
  const plano = (planoParam === "mensal" || planoParam === "trimestral" ? planoParam : null) as PlanoPago | null

  const [email, setEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  if (!plano) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="text-muted-foreground">Plano inválido.</p>
      </div>
    )
  }

  const info = PLANO_INFO[plano]

  const mensagemWhatsapp = `Hola! Realicé el pago del ${info.nome} de MedClass UNR. Mi nombre completo es: [tu nombre] y mi e-mail es: ${email || "[tu e-mail]"}. Te envío el comprobante de pago.`
  const whatsappUrl = `https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(mensagemWhatsapp)}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mt-4 mb-4 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="MedClass Logo"
              width={228}
              height={64}
              sizes="228px"
              className="h-16 w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Finalizá tu suscripción</p>
        </div>

        <Card className="border border-border bg-card p-6">
          <div className="mb-5 flex items-end justify-between border-b border-border pb-5">
            <div>
              <p className="text-sm text-muted-foreground">{info.nome}</p>
              <p className="text-2xl font-bold text-foreground">
                {info.preco}
                <span className="text-sm font-normal text-muted-foreground">{info.periodo}</span>
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <a href={info.link} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Pagar con Mercado Pago
              </Button>
            </a>

            <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-medium text-foreground">Después de pagar</p>
              <p className="text-xs text-muted-foreground">
                Envianos el comprobante junto con tu <strong>nombre completo</strong> y{" "}
                <strong>e-mail</strong> por WhatsApp para activar tu acceso. Solemos confirmar en poco tiempo.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                  Enviar comprobante por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <Link
          href="/#pricing"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a los planes
        </Link>
      </div>
    </div>
  )
}
