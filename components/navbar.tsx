"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  const navLinks = [
    { href: "#", label: t.nav.links.inicio },
    { href: "#features", label: t.nav.links.plataforma },
    { href: "#how-it-works", label: t.nav.links.comoFunciona },
    { href: "#testimonials", label: t.nav.links.depoimentos },
    { href: "#faq", label: t.nav.links.faq },
    { href: "#pricing", label: t.nav.links.planos, highlight: true },
  ]

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <a href="#" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="MedClass Logo"
            width={2000}
            height={562}
            className="h-10 w-auto object-contain"
            priority
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? "rounded-full border border-[#c6ff3a]/40 bg-[#c6ff3a]/10 px-3 py-1.5 text-sm font-medium text-[#bef264] transition-colors hover:border-[#c6ff3a]/70 hover:bg-[#c6ff3a]/20 hover:text-[#c6ff3a]"
                  : "rounded-full px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button asChild className="rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]">
            <a href="/login">{t.nav.entrar}</a>
          </Button>
        </div>

        {/* Mobile: language switcher + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            className="text-white/70"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="absolute inset-x-4 top-[calc(100%+0.5rem)] rounded-3xl border border-white/10 bg-[#12140f]/95 px-6 py-4 shadow-2xl backdrop-blur-xl md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  link.highlight
                    ? "w-fit rounded-full border border-[#c6ff3a]/40 bg-[#c6ff3a]/10 px-3 py-1.5 text-sm font-medium text-[#bef264] transition-colors hover:text-[#c6ff3a]"
                    : "text-sm text-white/60 transition-colors hover:text-white"
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <Button asChild className="w-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00]">
                <a href="/login" onClick={() => setMobileOpen(false)}>{t.nav.entrar}</a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
