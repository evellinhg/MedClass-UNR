"use client"

import { motion } from "framer-motion"
import { BookOpen, Stethoscope, TrendingUp, CheckCircle, Brain, Award } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "+5.000 Questões Atualizadas",
    description: "Banco de questões inéditas e comentadas, filtradas por especialidade e nível de dificuldade."
  },
  {
    icon: Stethoscope,
    title: "Simulados Personalizados",
    description: "Monte provas cronometradas que espelham o formato das provas reais do Enamed e Revalida."
  },
  {
    icon: TrendingUp,
    title: "Relatórios de Performance",
    description: "Identifique seus pontos cegos com análises detalhadas de acertos e erros por matéria."
  },
  {
    icon: CheckCircle,
    title: "Feedback Detalhado",
    description: "Justificativas profundas em cada questão para você aprender com seus erros e não repeti-los."
  },
  {
    icon: Brain,
    title: "Temas de Alta Incidência",
    description: "Conteúdo estratégico focado no que realmente cai nas provas de revalidação de diploma."
  },
  {
    icon: Award,
    title: "Simule o Real",
    description: "Treine sob pressão e ganhe a confiança necessária para garantir a tão sonhada aprovação e seu CRM."
  }
]

export function Features() {
  return (
    <section id="features" className="relative bg-[#0a0a0a] py-24">
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
          <span className="mb-4 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400">
            Metodologia
          </span>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Sua jornada rumo ao CRM,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              estruturada para o sucesso
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Uma metodologia focada em alta performance, desenvolvida por especialistas para garantir sua aprovação no Enamed e Revalida.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:border-indigo-500/30 hover:bg-white/[0.04]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
              </div>
              
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <feature.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
