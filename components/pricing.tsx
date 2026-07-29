"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"

export function Pricing() {
  const { t } = useLanguage()

  return (
    <section id="pricing" className="relative bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 px-4 py-1.5 text-sm text-[#bef264]">
            {t.pricing.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.pricing.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.pricing.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            {t.pricing.subtitle}
          </p>
          <p className="mt-2 text-sm text-[#bef264]">{t.pricing.paymentNote}</p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-2"
        >
          {t.pricing.plans.map((plan, i) => {
            const featured = i === 1
            return (
              <div
                key={plan.name}
                className={`relative overflow-hidden rounded-2xl border p-8 ${
                  featured
                    ? "border-[#c6ff3a] bg-gradient-to-b from-[#c6ff3a]/10 to-transparent shadow-[0_0_40px_-12px_rgba(198,255,58,0.5)]"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                {plan.badge && (
                  <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-3 py-1 text-xs font-semibold text-[#0a1f00]">
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
                      <Check className="h-4 w-4 text-[#bef264]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-8 w-full ${
                    featured
                      ? "bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <a href="/login">{plan.cta}</a>
                </Button>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
