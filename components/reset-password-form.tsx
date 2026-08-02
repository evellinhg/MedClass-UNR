"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("A senha precisa ter ao menos 6 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
        <p className="text-lg font-medium text-foreground">Senha atualizada!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua senha foi redefinida com sucesso. Você já pode acessar sua conta normalmente.
        </p>
        <Button asChild className="mt-6 w-full" variant="gradient">
          <a href="/login">Ir para o login</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mt-4 mb-4 flex items-center justify-center">
          <Image src="/logo.png" alt="MedClass Logo" width={228} height={64} sizes="228px" className="h-16 w-auto object-contain" priority />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Defina sua nova senha de acesso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  )
}
