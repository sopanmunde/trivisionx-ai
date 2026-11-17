import { Hero } from "@/components/hero";
import { VideoExplodeScroll } from "@/components/video-explode-scroll";
import { ProductExplode } from "@/components/product-explode";
import { TerminalShowcase } from "@/components/terminal-showcase";
import { FeatureShowcaseSections } from "@/components/feature-showcase-sections";
import { BentoDemoSection } from "@/components/bento-demo";
import { BentoGrid } from "@/components/bento-grid";
import { AutomationCanvas } from "@/components/automation-canvas";
import { Pricing } from "@/components/pricing";
import { FinalCTA } from "@/components/final-cta";
import { ZigZagScrollBar } from "@/components/zigzag-scrollbar";
import { ScrollRoadStage } from "@/components/scroll-road-animation";

export default function Home() {
  return (
    <>
      <ZigZagScrollBar />
      <ScrollRoadStage>
        <Hero />
        <VideoExplodeScroll />
        <ProductExplode />
        <TerminalShowcase />
        <FeatureShowcaseSections />
        <BentoDemoSection />
        <BentoGrid />
        <AutomationCanvas />
        <Pricing />
        <FinalCTA />
      </ScrollRoadStage>
    </>
  );
}
