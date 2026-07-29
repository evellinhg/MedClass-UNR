"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n"

export function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section id="how-it-works" className="relative bg-[#12140f] py-24">
      {/* Gradient accent */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c6ff3a]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 px-4 py-1.5 text-sm text-[#c6ff3a]">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.howItWorks.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.howItWorks.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-[#c6ff3a]/50 via-[#84cc16]/50 to-transparent lg:left-1/2 lg:block lg:-translate-x-px" />

          <div className="space-y-12 lg:space-y-24">
            {t.howItWorks.steps.map((step, i) => (
              <motion.div
                key={step.title}
                className={`relative flex flex-col gap-8 lg:flex-row lg:items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                {/* Number marker */}
                <div className="absolute left-0 flex h-16 w-16 items-center justify-center lg:left-1/2 lg:-translate-x-1/2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c6ff3a]/30 bg-[#12140f]">
                    <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-xl font-bold text-transparent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 pl-24 lg:pl-0 ${i % 2 === 0 ? "lg:pr-24 lg:text-right" : "lg:pl-24"}`}>
                  <h3 className="mb-2 text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="text-white/50">{step.description}</p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden flex-1 lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
