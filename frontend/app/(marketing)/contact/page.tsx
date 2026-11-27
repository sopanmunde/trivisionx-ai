import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact — TriVisionX",
  description: "Get in touch with the TriVisionX team for technical support or enterprise inquiries.",
};

export default function ContactPage() {
  return (
    <PageShell
      badge="Contact"
      title="Get in Touch"
      subtitle="Have a question about TriVisionX architecture, self-hosting, or API integrations? Send us a message directly."
    >
      <Card className="max-w-2xl mx-auto p-6 sm:p-8 border-border bg-card/60">
        <ContactForm />
      </Card>
    </PageShell>
  );
}
