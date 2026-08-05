"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Stethoscope, HeartPulse, Activity } from "lucide-react"
import { IconChip } from "@/components/ui/icon-chip"
import { useLanguage } from "@/lib/i18n"
import { DepoimentoForm } from "@/components/depoimento-form"

const icons = [Stethoscope, HeartPulse, Activity]
const gradients = [
  "from-rose-400 to-red-600 shadow-red-900/30",
  "from-pink-400 to-fuchsia-600 shadow-pink-900/30",
  "from-sky-400 to-blue-600 shadow-blue-900/30",
]

export function Testimonials() {
  const { t } = useLanguage()

  return (
    <section id="testimonials" className="relative bg-[#12140f] py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#c6ff3a]/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[#c6ff3a]/20 bg-[#c6ff3a]/10 px-4 py-1.5 text-sm text-[#c6ff3a]">
            {t.testimonials.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.testimonials.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.testimonials.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="mb-6 flex justify-end">
          <DepoimentoForm />
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {t.testimonials.items.map((testimonial, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={testimonial.text}
                className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {/* Quote icon */}
                <svg
                  className="absolute -right-2 -top-2 h-24 w-24 text-[#c6ff3a]/5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <IconChip icon={Icon} className={`relative bg-gradient-to-br ${gradients[i]}`} />
                <p className="relative mt-4 text-base leading-relaxed text-white/70">{testimonial.text}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/depoimentos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#bef264] transition-colors hover:text-[#c6ff3a]"
          >
            {t.testimonials.verTodos}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
