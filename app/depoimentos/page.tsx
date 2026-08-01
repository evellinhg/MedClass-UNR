"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DepoimentosLista } from "@/components/depoimentos-lista"
import { useLanguage } from "@/lib/i18n"

export default function DepoimentosPage() {
  const { t } = useLanguage()

  return (
    <main className="bg-[#12140f]">
      <Navbar />
      <section className="relative px-6 pb-24 pt-40">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c6ff3a]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.depoimentosPage.voltar}
          </Link>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.depoimentosPage.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/50">{t.depoimentosPage.subtitulo}</p>

          <div className="mt-12">
            <DepoimentosLista />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
