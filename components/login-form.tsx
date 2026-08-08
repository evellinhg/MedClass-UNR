"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AlertCircle, AlertTriangle, Loader2, Lock, Mail, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/social-icons"

type Mode = "signin" | "signup" | "forgot"

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState<"google" | "email" | null>(null)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [info, setInfo] = useState<string | null>(null)

  const handleOAuth = async (provider: "google") => {
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

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setLoading(null)
      if (error) {
        setError(error.message)
        return
      }
      setInfo("Si existe una cuenta con ese e-mail, te enviamos un enlace para redefinir tu contraseña.")
      return
    }

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
      setInfo("¡Cuenta creada! Revisá tu e-mail para confirmar el registro antes de ingresar.")
    }
  }

  return (
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
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Accedé a tu panel de estudio"
            : mode === "signup"
              ? "Empezá tu preparación para los parciales y finales"
              : "Ingresá tu e-mail para redefinir tu contraseña"}
        </p>
      </div>

      {mode !== "forgot" && (
        <>
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>¿Es tu primera vez acá?</strong> Crear tu cuenta es muy fácil: solo tenés que tocar{" "}
              <strong>&quot;Continuar con Google&quot;</strong> y tu cuenta se crea automáticamente. ¡No hace falta completar ningún formulario!
            </span>
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
              Continuar con Google
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o continuá con e-mail</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              placeholder="vos@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot")
                    setError(null)
                    setInfo(null)
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
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
        )}

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

        {mode === "signup" && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              El e-mail de confirmación puede llegar a la carpeta de spam. Si no lo encontrás en
              la bandeja de entrada, revisá esa carpeta en tu correo.
            </span>
          </div>
        )}

        <Button type="submit" variant="gradient" className="w-full" disabled={loading !== null}>
          {loading === "email" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            "Ingresar"
          ) : mode === "signup" ? (
            "Crear cuenta"
          ) : (
            "Enviar enlace de restablecimiento"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "forgot" ? (
          <button
            type="button"
            onClick={() => {
              setMode("signin")
              setError(null)
              setInfo(null)
            }}
            className="font-medium text-primary hover:underline"
          >
            Volver al inicio de sesión
          </button>
        ) : (
          <>
            {mode === "signin" ? "¿Todavía no tenés cuenta?" : "¿Ya tenés una cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin")
                setError(null)
                setInfo(null)
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Crear cuenta" : "Ingresar"}
            </button>
          </>
        )}
      </p>
    </div>
  )
}
