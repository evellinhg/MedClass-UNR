"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Erro capturado:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Algo deu errado</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Button variant="gradient" onClick={() => (window.location.href = "/dashboard")}>
          Voltar ao início
        </Button>
      </div>
    </div>
  )
}
