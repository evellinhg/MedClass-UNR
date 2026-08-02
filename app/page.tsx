import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { PwaInstallBanner } from "@/components/pwa-install-banner"
import { WhatsappFloatButton } from "@/components/whatsapp-float-button"

// Seções abaixo da dobra: divididas em chunks separados do bundle inicial,
// já que só entram em cena conforme o usuário rola a página.
const PainSection = dynamic(() => import("@/components/pain-section").then((m) => m.PainSection))
const Features = dynamic(() => import("@/components/features").then((m) => m.Features))
const HowItWorks = dynamic(() => import("@/components/how-it-works").then((m) => m.HowItWorks))
const QuizDemo = dynamic(() => import("@/components/quiz-demo").then((m) => m.QuizDemo))
const PwaInstallSection = dynamic(() => import("@/components/pwa-install-section").then((m) => m.PwaInstallSection))
const Testimonials = dynamic(() => import("@/components/testimonials").then((m) => m.Testimonials))
const Pricing = dynamic(() => import("@/components/pricing").then((m) => m.Pricing))
const FaqSection = dynamic(() => import("@/components/faq-section").then((m) => m.FaqSection))
const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer))

export const revalidate = 3600 // Revalidar a cada hora

export default function Page() {
  return (
    <main className="bg-[#12140f]">
      <Navbar />
      <Hero />
      <PainSection />
      <Features />
      <HowItWorks />
      <QuizDemo />
      <PwaInstallSection />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <Footer />
      <PwaInstallBanner />
      <WhatsappFloatButton />
    </main>
  )
}
