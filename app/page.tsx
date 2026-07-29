import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { PainSection } from "@/components/pain-section"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export const revalidate = 3600 // Revalidar a cada hora

export default function Page() {
  return (
    <main className="bg-[#12140f]">
      <Navbar />
      <Hero />
      <PainSection />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FaqSection />
      <Footer />
    </main>
  )
}
