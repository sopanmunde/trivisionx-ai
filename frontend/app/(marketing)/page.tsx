import { Hero } from "@/components/hero";
import { VideoExplodeScroll } from "@/components/video-explode-scroll";
import { BentoGrid } from "@/components/bento-grid";
import { AutomationCanvas } from "@/components/automation-canvas";
import { TerminalShowcase } from "@/components/terminal-showcase";
import { FeatureShowcaseSections } from "@/components/feature-showcase-sections";
import { BentoDemoSection } from "@/components/bento-demo";
import { ComparisonSection } from "@/components/comparison-section";
import { Pricing } from "@/components/pricing";
import { FinalCTA } from "@/components/final-cta";
import { ZigZagScrollBar } from "@/components/zigzag-scrollbar";

export default function Home() {
  return (
    <>
      <ZigZagScrollBar />
      {/* 1. Hook & Autonomous LangGraph Swarm Console */}
      <Hero />
      {/* 2. Visual Product Tour & Exploded Agent Modules */}
      <VideoExplodeScroll />
      {/* 3. Core Architecture & 5 Agent Capabilities */}
      <BentoGrid />
      {/* 4. Live Hands-On Workflow Canvas & Simulation */}
      <AutomationCanvas />
      {/* 5. Developer Experience & CLI Terminal Showcase */}
      <TerminalShowcase />
      {/* 6. Enterprise Telemetry & Architectural Deep Dives */}
      <FeatureShowcaseSections />
      {/* 7. Platform Ecosystem, Tool Mesh & Scheduled Swarms */}
      <BentoDemoSection />
      {/* 8. Market Comparison: Why TriVisionX Beats Traditional RAG */}
      <ComparisonSection />
      {/* 9. Transparent Pricing Tiers */}
      <Pricing />
      {/* 10. High-Conversion Final CTA */}
      <FinalCTA />
    </>
  );
}
