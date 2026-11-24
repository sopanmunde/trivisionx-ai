import AIAssistantUI from "@/components/AIAssistantUI";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Interactive Demo — TriVisionX",
  description: "Experience TriVisionX autonomous multi-agent research platform live without signing up or logging in.",
};

export default function DemoPage() {
  return <AIAssistantUI isDemo={true} />;
}
