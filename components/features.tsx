"use client"

import { motion } from "framer-motion"
import { BookOpen, Stethoscope, TrendingUp, CheckCircle, Brain, Award } from "lucide-react"
import { IconChip } from "@/components/ui/icon-chip"
import { useLanguage } from "@/lib/i18n"

const icons = [BookOpen, Stethoscope, TrendingUp, CheckCircle, Brain, Award]
const gradients = [
  "from-sky-400 to-blue-600 shadow-blue-900/30",
  "from-red-400 to-rose-600 shadow-red-900/30",
  "from-emerald-400 to-green-600 shadow-emerald-900/30",
  "from-lime-400 to-green-600 shadow-green-900/30",
  "from-violet-400 to-purple-600 shadow-purple-900/30",
  "from-amber-400 to-orange-600 shadow-amber-900/30",
]

export function Features() {
  const { t } = useLanguage()

  return (
    <section id="features" className="relative bg-[#12140f] py-24">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

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
            {t.features.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.features.titleLead}{" "}
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.features.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            {t.features.subtitle}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((feature, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:border-[#c6ff3a]/30 hover:bg-white/[0.04]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#c6ff3a]/10 to-[#84cc16]/10" />
                </div>

                <div className="relative">
                  <IconChip icon={Icon} size="lg" className={`mb-4 bg-gradient-to-br ${gradients[i]}`} />
                  <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
