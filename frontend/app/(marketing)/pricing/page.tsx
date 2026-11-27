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
    { text: "LangGraph multi-agent chat & quick mode", tooltip: "Switch between quick synthesis and full multi-agent pipelines." },
    { text: "Pinecone namespace per account", tooltip: "Uploaded documents are indexed into your own namespace." },
    { text: "BYOK model keys", tooltip: "Connect your own OpenAI, Google Gemini, Anthropic, DeepSeek, Groq, or Ollama endpoints." },
    { text: "Integrated workspace tools", tooltip: "Includes Notes, Tasks, Calendar, and Email Gateway." },
    { text: "Markdown export", tooltip: "Export synthesized research reports cleanly as Markdown." },
  ],
  Pro: [
    { text: "All LLM providers + local Ollama", tooltip: "OpenAI, Gemini, Anthropic, DeepSeek, Groq, Cohere, and Ollama." },
    { text: "Scheduled Cron & event workflows", tooltip: "Automate recurring research and document ingestion triggers." },
    { text: "PDF, DOCX & XLSX exports", tooltip: "Generate branded multi-format deliverables with citations." },
    { text: "Channel integrations", tooltip: "Publish reports to Slack, Teams, Notion, Confluence, and Jira." },
    { text: "Custom agent skills & MCP servers", tooltip: "Attach prompt skills and external MCP endpoints." },
    { text: "Audio transcription & TTS", tooltip: "Voice input and playback powered by Gemini / Edge-TTS." },
  ],
  Enterprise: [
    { text: "Self-hosted Docker Compose stack", tooltip: "Deploy Next.js, FastAPI, MongoDB, and Redis on your own infrastructure." },
    { text: "Dedicated Pinecone & MongoDB", tooltip: "Run against your organization's managed database clusters." },
    { text: "Google & GitHub OAuth authentication", tooltip: "Standards-based OAuth login with short-lived JWT sessions." },
    { text: "Explainable AI audit trail", tooltip: "Inspect per-query execution nodes, steps, and citation metadata." },
    { text: "Encrypted BYOK & webhook vault", tooltip: "Fernet-encrypted provider keys and SSRF-validated webhook targets." },
    { text: "Custom deployment support", tooltip: "Contact our team for architecture guidance and custom setups." },
  ]
};

const faqs = [
  { q: "How does Bring Your Own Key (BYOK) work?", a: "You can save your own API keys for OpenAI, Gemini, Anthropic, DeepSeek, Groq, Cohere, or point to a local Ollama instance in Brain Settings. Keys are encrypted at rest and never exposed in client logs." },
  { q: "Can I try TriVisionX before creating an account?", a: "Yes — visit the Live Demo page to explore the interface, or sign up with email or Google/GitHub OAuth to create a persistent workspace." },
  { q: "How is billing handled right now?", a: "Hosted billing checkout is currently in preview. You can register for free with your own LLM API keys or deploy the open Docker stack directly." },
  { q: "Can I self-host TriVisionX?", a: "Yes. The repository includes Dockerfiles and Docker Compose configuration for the Next.js frontend, FastAPI backend, MongoDB, and Redis." },
  { q: "How is my data isolated?", a: "Uploaded document chunks are scoped by per-user Pinecone namespaces, and stored API keys and third-party webhook credentials are encrypted at rest in MongoDB." }
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
