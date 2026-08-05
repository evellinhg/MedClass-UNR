"use client"

import { motion } from "framer-motion"
import { Clock, FolderX, Languages, UserX } from "lucide-react"
import { IconChip } from "@/components/ui/icon-chip"
import { useLanguage } from "@/lib/i18n"

const icons = [Languages, Clock, FolderX, UserX]

export function PainSection() {
  const { t } = useLanguage()

  return (
    <section className="relative bg-[#12140f] py-24">
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/60">
            {t.pain.badge}
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t.pain.titleLead}
            <br />
            <span className="bg-gradient-to-r from-[#c6ff3a] to-[#84cc16] bg-clip-text text-transparent">
              {t.pain.titleHighlight}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">{t.pain.subtitle}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {t.pain.items.map((item, i) => {
            const Icon = icons[i]
            return (
              <motion.div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <IconChip icon={Icon} className="bg-gradient-to-br from-red-400 to-rose-600 shadow-red-900/30" />
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          className="mt-12 text-center text-xl font-semibold text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {t.pain.closing}
        </motion.p>
      </div>
    </section>
  )
}
