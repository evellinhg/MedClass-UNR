"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpenCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudyDashboard } from "./study-dashboard"

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
      
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
            <Star className="h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />
            Metodologia validada para Aprovação
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
              <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Class</span>
            </span>
            <span className="mt-3 block text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              A melhor plataforma de estudos para a sua aprovação
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="mt-6 max-w-xl text-pretty text-lg text-white/50 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Crie simulados, treine questões e domine os temas do Enamed com inteligência
          </motion.p>

          {/* Motivational line */}
          <motion.p
            className="mt-4 max-w-xl text-pretty text-base italic text-indigo-300/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            O caminho para o seu CRM começa aqui. Prepare-se hoje para ser o médico que você nasceu para ser.
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
              className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white hover:from-indigo-500 hover:to-violet-500"
            >
              <Link href="#pricing">Comece Já</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 border border-white/20 bg-white px-8 text-base font-semibold text-[#0a0a0a] hover:bg-white/90 hover:text-[#0a0a0a]"
            >
              <Link href="/login">Teste Grátis</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div 
            className="mt-10 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-indigo-300">
              <BookOpenCheck className="h-4 w-4" />
            </div>
            <span className="text-sm text-white/50">
              <span className="font-semibold text-white/80">Mais de 5.000 questões</span> atualizadas para a sua aprovação
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
