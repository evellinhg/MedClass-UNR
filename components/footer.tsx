"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-white/5 bg-[#12140f]">
      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#c6ff3a]/10 via-[#84cc16]/10 to-[#c6ff3a]/10 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c6ff3a]/20 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold text-white sm:text-4xl">
              {t.footer.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-white/50">
              {t.footer.ctaSubtitle}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 text-base font-semibold text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
            >
              <Link href="#pricing">{t.footer.ctaButton}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-white/40">
            {t.footer.copyright}
          </p>
          <p className="text-sm text-white/40">
            <a href="#" className="transition-colors hover:text-white">{t.footer.terms}</a>
            {" | "}
            <a href="#" className="transition-colors hover:text-white">{t.footer.privacy}</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
