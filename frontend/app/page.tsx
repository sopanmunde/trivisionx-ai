import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { LogoMarquee } from "@/components/logo-marquee"
import { BentoGrid } from "@/components/bento-grid"
import { AutomationCanvas } from "@/components/automation-canvas"
import { Pricing } from "@/components/pricing"
import { ContactSection } from "@/components/contact"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <SmoothScroll>
      <main className="dark min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <Hero />
        <LogoMarquee />
        <BentoGrid />
        <AutomationCanvas />
        <Pricing />
        <ContactSection />
        <FinalCTA />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
