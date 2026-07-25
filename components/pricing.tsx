"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Plano Mensal",
    price: "R$ 49,90",
    period: "/mês",
    description: "Quem quer testar a plataforma.",
    features: [
      "Acesso a todo o banco de questões",
      "Simulados ilimitados",
      "Suporte por e-mail"
    ],
    cta: "Assinar Plano Mensal",
    featured: false
  },
  {
    name: "Plano Trimestral",
    price: "R$ 129,90",
    period: "/trimestre",
    description: "Quem busca aprovação acelerada.",
    badge: "Melhor Custo-Benefício",
    features: [
      "Tudo do Mensal",
      "Desconto exclusivo (economize 15%)",
      "Análise avançada de desempenho",
      "Prioridade em atualizações"
    ],
    cta: "Assinar Plano Trimestral",
    featured: true
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            Planos
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Planos que cabem no{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              seu sonho
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Escolha o plano ideal e comece agora sua jornada rumo ao CRM.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl border p-8 ${
                plan.featured 
                  ? "border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-transparent shadow-[0_0_40px_-12px_rgba(99,102,241,0.5)]" 
                  : "border-white/5 bg-white/[0.02]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {plan.badge && (
                <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-white/50">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm text-white/50">{plan.description}</p>
              
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="h-4 w-4 text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                asChild
                className={`mt-8 w-full ${
                  plan.featured
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
