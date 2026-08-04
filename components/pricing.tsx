"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"

export function Pricing() {
  const { t } = useLanguage()

  return (
    <section id="pricing" className="relative bg-[#12140f] py-24">
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
          className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-3"
        >
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#c6ff3a] bg-gradient-to-b from-[#c6ff3a]/10 to-transparent p-8 shadow-[0_0_40px_-12px_rgba(198,255,58,0.5)]">
            <div className="mb-4 inline-block w-fit rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-3 py-1 text-xs font-semibold text-[#0a1f00]">
              {t.pricing.promo.badge}
            </div>

            <h3 className="text-lg font-semibold text-white">{t.pricing.promo.title}</h3>
            <p className="mt-2 text-sm text-white/50">{t.pricing.promo.description}</p>

            <ul className="mt-8 flex-1 space-y-3">
              {t.pricing.promo.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                  <Check className="h-4 w-4 text-[#bef264]" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-8 w-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
            >
              <a href="/login">{t.pricing.promo.cta}</a>
            </Button>
          </div>

          {t.pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#c6ff3a] bg-gradient-to-b from-[#c6ff3a]/10 to-transparent p-8 shadow-[0_0_40px_-12px_rgba(198,255,58,0.5)]"
            >
              <div className="mb-4 inline-block w-fit rounded-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] px-3 py-1 text-xs font-semibold text-[#0a1f00]">
                {plan.badge ?? plan.name}
              </div>

              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-3 text-3xl font-bold text-white">
                {plan.price}
                <span className="text-sm font-normal text-white/50">{plan.period}</span>
              </p>
              <p className="mt-2 text-sm text-white/50">{plan.description}</p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="h-4 w-4 text-[#bef264]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-8 w-full bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] text-[#0a1f00] hover:from-[#a3e635] hover:to-[#65a30d]"
              >
                <a href={`/checkout/${plan.id}`}>{plan.cta}</a>
              </Button>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
