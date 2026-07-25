"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#", label: "Início" },
  { href: "#features", label: "Plataforma" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#testimonials", label: "Depoimentos" },
  { href: "#pricing", label: "Planos", highlight: true },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav 
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="ml-10 mt-2 flex items-center sm:ml-24">
          <Image
            src="/logo.png"
            alt="MedClass Logo"
            width={352}
            height={160}
            className="h-20 w-auto object-contain"
            priority
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className={
                link.highlight
                  ? "rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 transition-colors hover:border-indigo-400/70 hover:bg-indigo-500/20 hover:text-indigo-200"
                  : "text-sm text-white/60 transition-colors hover:text-white"
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" className="text-white/70 hover:bg-white/5 hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500">
            <Link href="#pricing">Começar Agora</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white/70"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div 
          className="border-t border-white/5 bg-[#0a0a0a] px-6 py-4 md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className={
                  link.highlight
                    ? "w-fit rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200"
                    : "text-sm text-white/60 transition-colors hover:text-white"
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
              <Button asChild variant="ghost" className="w-full text-white/70 hover:bg-white/5 hover:text-white">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <Link href="#pricing" onClick={() => setMobileOpen(false)}>Começar Agora</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
