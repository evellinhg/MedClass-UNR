"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Componente "headless": não renderiza nada, só dispara uma vez por sessão a
// checagem de pagamento pendente do Mercado Pago (caso o aluno tenha pago
// antes de criar a conta, ou o webhook tenha chegado antes de existir perfil
// com esse e-mail).
export function ClaimPendingPayment() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      fetch("/api/pagamentos/reivindicar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    })
  }, [])

  return null
}
