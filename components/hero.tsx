"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpenCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudyDashboard } from "./study-dashboard"
import { AmbientBackground } from "./ambient-background"
import { useLanguage } from "@/lib/i18n"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#12140f]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Animated ambient glow */}
      <AmbientBackground />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-12 px-6 pt-24 pb-20 lg:flex-row lg:gap-16">
        {/* Left side - Content */}
        <motion.div 
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Star className="h-3.5 w-3.5 fill-[#c6ff3a] text-[#c6ff3a]" />
            {t.hero.badge}
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-balance tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="block text-6xl font-extrabold sm:text-7xl lg:text-8xl">
              <span className="text-white">Med</span>
              <span className="bg-gradient-to-r from-[#a3e635] via-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">Class</span>
            </span>
            <span className="mt-3 block text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t.hero.headline}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mt-6 max-w-xl text-pretty text-lg text-white/50 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {t.hero.subheadline}
          </motion.p>

          {/* Motivational line */}
          <motion.p
            className="mt-4 max-w-xl text-pretty text-base italic text-[#bef264]/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {t.hero.motivational}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="mt-8 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="h-12 bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-8 text-base font-semibold text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
            >
              <Link href="#pricing">{t.hero.ctaPrimary}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 border border-white/20 bg-white px-8 text-base font-semibold text-[#12140f] hover:bg-white/90 hover:text-[#12140f]"
            >
              <Link href="/login">{t.hero.ctaSecondary}</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div 
            className="mt-10 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#bef264]">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <span className="text-sm text-white/50">
              <span className="font-semibold text-white/80">{t.hero.socialProofStrong}</span> {t.hero.socialProof}
            </span>
          </motion.div>
        </motion.div>

        {/* Right side - Study Dashboard */}
        <motion.div 
          className="flex flex-1 justify-center lg:justify-end"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
        >
          <StudyDashboard />
        </motion.div>
      </div>
    </section>
  )
}
