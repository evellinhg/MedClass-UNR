import Link from "next/link"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSucessoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-center">
      <div className="w-full max-w-sm">
        <Image
          src="/logo.png"
          alt="MedClass Logo"
          width={228}
          height={64}
          sizes="228px"
          className="mx-auto h-16 w-auto object-contain"
          priority
        />
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">¡Pago confirmado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu plan ya está activo. Si todavía no tenés cuenta, creála con el mismo e-mail que usaste en el pago
          para que se aplique automáticamente.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Ir a mi cuenta</Link>
        </Button>
      </div>
    </div>
  )
}
