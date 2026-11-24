import type { Metadata } from "next";
import { CompetitiveIntelligenceDashboard } from "@/components/CompetitiveIntelligenceDashboard";

export const metadata: Metadata = {
  title: "Competitive Intelligence — TriVisionX",
  description: "Autonomous multi-agent market sweep, real-time SWOT decomposition, and feature-gap matrices.",
};

export default function CompetitivePage() {
  return <CompetitiveIntelligenceDashboard />;
}
