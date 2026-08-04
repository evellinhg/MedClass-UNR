import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutPendentePage() {
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
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
          <Clock className="h-7 w-7 text-warning" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Pago en proceso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu pago todavía está siendo procesado (común en pagos por transferencia o efectivo). En cuanto se
          confirme, tu plan se activa automáticamente.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Ir a mi cuenta</Link>
        </Button>
      </div>
    </div>
  )
}
