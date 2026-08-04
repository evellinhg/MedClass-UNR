"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react"
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

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

let mpInicializado = false

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
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

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
    if (PUBLIC_KEY && !mpInicializado) {
      initMercadoPago(PUBLIC_KEY, { locale: "es-AR" })
      mpInicializado = true
    }
  }, [])

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
    setPreferenceId(body.preferenceId)
  }

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
          ) : preferenceId ? (
            !PUBLIC_KEY ? (
              <p className="text-sm text-destructive">
                Falta configurar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.
              </p>
            ) : (
              <Wallet initialization={{ preferenceId }} />
            )
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
