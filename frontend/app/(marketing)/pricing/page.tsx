import { PageShell, Section, MacBadge } from "@/components/page-shell";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, Zap, Building2, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <Tabs defaultValue="monthly" className="w-full flex flex-col items-center mb-14">
        <TabsList className="mb-8">
          <TabsTrigger value="monthly" className="px-8">Monthly</TabsTrigger>
          <TabsTrigger value="yearly" className="px-8">Yearly <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Save 20%</span></TabsTrigger>
        </TabsList>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="relative flex flex-col justify-between border-border shadow-sm hover:border-muted-foreground/30 transition-all duration-200 group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted border border-border"><Zap className="w-5 h-5 text-muted-foreground" /></div>
                <CardTitle className="text-lg font-bold text-foreground">Starter</CardTitle>
              </div>
              <CardDescription className="text-xs">For individuals exploring agentic AI research.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">Free</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mb-6 bg-muted px-2.5 py-1.5 rounded-md border border-border self-start">
                10,000 execution cycles/month
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Starter.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs">{f.tooltip}</p></TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/signup" className="flex items-center justify-center gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col justify-between border-primary shadow-md bg-card/60 transition-all duration-200 group">
            <div className="absolute top-4 right-4"><MacBadge color="default">✦ Popular</MacBadge></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><Zap className="w-5 h-5 text-primary" /></div>
                <CardTitle className="text-lg font-bold text-foreground">Pro</CardTitle>
              </div>
              <CardDescription className="text-xs">For power users and small teams running advanced pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <TabsContent value="monthly" className="m-0 mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">$49</span><span className="text-muted-foreground text-sm mb-1 font-medium">/mo</span>
              </TabsContent>
              <TabsContent value="yearly" className="m-0 mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">$39</span><span className="text-muted-foreground text-sm mb-1 font-medium">/mo</span>
              </TabsContent>
              <p className="text-[11px] text-muted-foreground font-mono mb-6 bg-primary/5 text-primary px-2.5 py-1.5 rounded-md border border-primary/20 self-start">
                100,000 execution cycles/month
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Pro.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs">{f.tooltip}</p></TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg" variant="default">
                <Link href="/signup" className="flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative flex flex-col justify-between border-border shadow-sm hover:border-muted-foreground/30 transition-all duration-200 group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted border border-border"><Building2 className="w-5 h-5 text-muted-foreground" /></div>
                <CardTitle className="text-lg font-bold text-foreground">Enterprise</CardTitle>
              </div>
              <CardDescription className="text-xs">Tailored for organizations with compliance and SLA needs.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">Custom</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mb-6 bg-muted px-2.5 py-1.5 rounded-md border border-border self-start">
                Unlimited execution cycles
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Enterprise.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p className="text-xs">{f.tooltip}</p></TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/contact" className="flex items-center justify-center gap-2">Contact Sales <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Tabs>

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
