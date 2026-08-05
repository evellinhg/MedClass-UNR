"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import QRCode from "qrcode"
import { AlertCircle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

type PlanoPago = "mensal" | "trimestral"

const PLANO_INFO: Record<PlanoPago, { nome: string; preco: string; periodo: string }> = {
  mensal: { nome: "Plano Mensal", preco: "$ 8.000", periodo: "/mes" },
  trimestral: { nome: "Plano Trimestral", preco: "$ 18.000", periodo: "/trimestre" },
}

const WHATSAPP_SUPORTE = "543412290349"

export default function CheckoutPage({ params }: { params: Promise<{ plano: string }> }) {
  const { plano: planoParam } = use(params)
  const plano = (planoParam === "mensal" || planoParam === "trimestral" ? planoParam : null) as PlanoPago | null

  const [email, setEmail] = useState("")
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [telefone, setTelefone] = useState("")
  const [dni, setDni] = useState("")
  const [loadingSessao, setLoadingSessao] = useState(true)
  const [logado, setLogado] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [initPoint, setInitPoint] = useState<string | null>(null)
  const [pagamentoId, setPagamentoId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email)
        setLogado(true)
      }
      setLoadingSessao(false)
    })
  }, [])

  useEffect(() => {
    if (!initPoint) return
    QRCode.toDataURL(initPoint, { width: 240, margin: 1 }).then(setQrCodeUrl)
  }, [initPoint])

  if (!plano) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="text-muted-foreground">Plano inválido.</p>
      </div>
    )
  }

  const info = PLANO_INFO[plano]

  const handlePagar = async () => {
    setErro(null)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro("Ingresá un e-mail válido.")
      return
    }
    if (!nomeCompleto.trim()) {
      setErro("Ingresá tu nombre completo.")
      return
    }
    if (!telefone.trim()) {
      setErro("Ingresá tu número de teléfono.")
      return
    }
    if (!dni.trim()) {
      setErro("Ingresá tu DNI.")
      return
    }
    setProcessando(true)
    const res = await fetch("/api/checkout/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plano,
        email,
        nomeCompleto: nomeCompleto.trim(),
        telefone: telefone.trim(),
        dni: dni.trim(),
      }),
    })
    const body = await res.json()
    setProcessando(false)
    if (!res.ok) {
      setErro(body.error ?? "No se pudo iniciar el pago. Intentá de nuevo.")
      return
    }
    setInitPoint(body.init_point)
    setPagamentoId(body.pagamentoId)
  }

  const mensagemWhatsapp = `Hola! Realicé el pago del ${info?.nome ?? ""} de MedClass UNR. Mi e-mail es ${email}. Referencia: ${pagamentoId}. Te envío el comprobante.`
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

          {loadingSessao ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : initPoint ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-4 text-center">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrCodeUrl} alt="Código QR de pago" className="h-48 w-48" />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Escaneá el código con la app de Mercado Pago</p>
              </div>

              <a href={initPoint} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Abrir en Mercado Pago
                </Button>
              </a>

              <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">Después de pagar</p>
                <p className="text-xs text-muted-foreground">
                  Envianos el comprobante por WhatsApp para activar tu acceso. Solemos confirmar en poco tiempo.
                </p>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                    Enviar comprobante por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="checkout-nome">Nombre completo</Label>
                <Input
                  id="checkout-nome"
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="checkout-email">E-mail</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={logado}
                />
                <p className="text-xs text-muted-foreground">
                  {logado
                    ? "Usaremos el e-mail de tu cuenta."
                    : "Usá el mismo e-mail con el que vas a crear (o ya tenés) tu cuenta en MedClass."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-telefone">Teléfono</Label>
                  <Input
                    id="checkout-telefone"
                    type="tel"
                    placeholder="+54 9 341..."
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-dni">DNI</Label>
                  <Input
                    id="checkout-dni"
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                </div>
              </div>

              {erro && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{erro}</span>
                </div>
              )}

              <Button onClick={handlePagar} disabled={processando} className="w-full gap-2">
                {processando && <Loader2 className="h-4 w-4 animate-spin" />}
                Pagar con Mercado Pago
              </Button>
            </div>
          )}
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
