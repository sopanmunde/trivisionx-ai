import { Hero } from "@/components/hero";
import { VideoExplodeScroll } from "@/components/video-explode-scroll";
import { TerminalShowcase } from "@/components/terminal-showcase";
import { FeatureShowcaseSections } from "@/components/feature-showcase-sections";
import { ComparisonSection } from "@/components/comparison-section";
import { BentoDemoSection } from "@/components/bento-demo";
import { BentoGrid } from "@/components/bento-grid";
import { AutomationCanvas } from "@/components/automation-canvas";
import { Pricing } from "@/components/pricing";
import { FinalCTA } from "@/components/final-cta";
import { ZigZagScrollBar } from "@/components/zigzag-scrollbar";

export default function Home() {
  return (
    <>
      <ZigZagScrollBar />
      <Hero />
      <VideoExplodeScroll />
      <TerminalShowcase />
      <FeatureShowcaseSections />
      <ComparisonSection />
      <BentoDemoSection />
      <BentoGrid />
      <AutomationCanvas />
      <Pricing />
      <FinalCTA />
    </>
  );
}
