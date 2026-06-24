import { Hero } from "@/components/hero"
import { LogoMarquee } from "@/components/logo-marquee"
import { BentoGrid } from "@/components/bento-grid"
import { AutomationCanvas } from "@/components/automation-canvas"
import { FinalCTA } from "@/components/final-cta"

export default function Home() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <BentoGrid />
      <AutomationCanvas />
      <FinalCTA />
    </>
  )
}
