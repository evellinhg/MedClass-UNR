"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon, AppleIcon } from "@/components/social-icons"

type Mode = "signin" | "signup"

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"google" | "apple" | "email" | null>(null)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [info, setInfo] = useState<string | null>(null)

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null)
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
    // On success the browser is redirected away, so no further state update needed here.
  }

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading("email")

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(null)
        return
      }
      window.location.href = "/dashboard"
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(null)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      window.location.href = "/dashboard"
    } else {
      setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.")
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] text-lg font-bold text-white">
          M
        </div>
        <h1 className="text-2xl font-bold text-gradient-brand">
          {mode === "signin" ? "Entrar no MedClass" : "Criar sua conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Acesse seu painel de estudos"
            : "Comece sua preparação para a residência"}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={loading !== null}
          onClick={() => handleOAuth("google")}
        >
          {loading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continuar com Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={loading !== null}
          onClick={() => handleOAuth("apple")}
        >
          {loading === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
          Continuar com Apple
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou continue com e-mail</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
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

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
            {info}
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full" disabled={loading !== null}>
          {loading === "email" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            "Entrar"
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin")
            setError(null)
            setInfo(null)
          }}
          className="font-medium text-primary hover:underline"
        >
          {mode === "signin" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  )
}
