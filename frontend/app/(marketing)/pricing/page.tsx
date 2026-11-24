import { PageShell, Section } from "@/components/page-shell";
import type { Metadata } from "next";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PricingTable } from "@/components/PricingTable";

export const metadata: Metadata = {
  title: "Pricing — TriVisionX",
  description: "Transparent, scalable pricing for every team size.",
};

const pricingFeatures = {
  Starter: [
    { text: "5 concurrent agents", tooltip: "Run up to 5 agent tasks simultaneously." },
    { text: "1 GB vector storage", tooltip: "Store embeddings for your documents." },
    { text: "Community support", tooltip: "Get help from our Discord community." },
    { text: "3 LLM providers", tooltip: "Support for OpenAI, Anthropic, and Google." },
    { text: "Basic report export", tooltip: "Export results as raw markdown." },
  ],
  Pro: [
    { text: "20 concurrent agents", tooltip: "Great for parallel research pipelines." },
    { text: "10 GB vector storage", tooltip: "Enough for 10,000+ long documents." },
    { text: "Priority email support", tooltip: "Response within 24 hours." },
    { text: "All LLM providers", tooltip: "Includes Groq, Mistral, and local models." },
    { text: "Advanced reports + PDF export", tooltip: "Formatted reports with citations." },
    { text: "Custom agent personas", tooltip: "Define specific system instructions." },
  ],
  Enterprise: [
    { text: "Unlimited agents", tooltip: "Scale without bottlenecks." },
    { text: "Unlimited vector storage", tooltip: "Enterprise-grade scalable pinecone index." },
    { text: "Dedicated SLA & support", tooltip: "99.9% uptime guarantee and Slack connect." },
    { text: "SSO / SAML integration", tooltip: "Secure login for your whole organization." },
    { text: "Audit logs & compliance", tooltip: "SOC2 compliance and detailed logging." },
    { text: "Custom deployment", tooltip: "On-premise or private cloud options." },
  ]
};

const faqs = [
  { q: "What counts as an execution cycle?", a: "One execution cycle is one complete agent pipeline run — from query intake to final synthesized response. A cycle could involve multiple API calls, but it's billed as a single logical task." },
  { q: "Can I upgrade or downgrade at any time?", a: "Yes, plan changes take effect immediately. Unused cycles are prorated on upgrades, giving you full flexibility to scale." },
  { q: "Is there a free trial for Pro?", a: "Yes — the Pro plan includes a 14-day free trial. No credit card is required to start the trial." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe, ACH transfers, and custom invoicing for Enterprise plans." },
  { q: "How secure is my data?", a: "We are SOC 2 compliant. Your data is encrypted at rest and in transit. We never train our models on your proprietary data." }
];

export default function PricingPage() {
  return (
    <PageShell
      badge="Pricing"
      title="Simple, Transparent Pricing"
      subtitle="No hidden fees. Scale from free exploration to unlimited enterprise deployments with predictable costs."
    >
      <PricingTable pricingFeatures={pricingFeatures} />

      <Section title="Frequently Asked Questions" className="max-w-3xl mx-auto border-none">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </PageShell>
  );
}
