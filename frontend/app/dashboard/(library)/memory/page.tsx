import type { Metadata } from "next";
import { MemoryTimeline } from "@/components/MemoryTimeline";

export const metadata: Metadata = {
  title: "Memory Timeline — TriVisionX",
  description: "Long-term episodic vector memory, auto-extracted facts, and cross-session knowledge.",
};

export default function MemoryPage() {
  return <MemoryTimeline />;
}
