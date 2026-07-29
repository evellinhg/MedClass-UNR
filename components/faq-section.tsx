"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function FaqSection() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative bg-[#12140f] py-24">
      <div className="relative mx-auto max-w-3xl px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 px-4 py-1.5 text-sm text-[#bef264]">
            {t.faq.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.faq.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.faq.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">{t.faq.subtitle}</p>
        </motion.div>

        <div className="space-y-3">
          {t.faq.items.map((item, i) => {
            const open = openIndex === i
            return (
              <motion.div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#c6ff3a] transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-4 text-sm leading-relaxed text-white/50">{item.answer}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
