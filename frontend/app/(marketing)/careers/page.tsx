import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { CareersList } from "@/components/careers-list";

export const metadata: Metadata = {
  title: "Careers — TriVisionX",
  description: "Explore engineering and AI research opportunities at TriVisionX.",
};

export default function CareersPage() {
  return (
    <PageShell
      badge="Careers"
      title="Build with TriVisionX"
      subtitle="Join us in advancing autonomous multi-agent AI research, semantic RAG retrieval, and developer tooling."
    >
      <div className="max-w-4xl mx-auto">
        <CareersList />
      </div>
    </PageShell>
  );
}
