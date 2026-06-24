import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Key, Clock, Activity, FileCheck, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Security — TriVisionX",
  description: "How TriVisionX protects your data and infrastructure.",
};

const securityFeatures = [
  { icon: Shield, title: "Encryption", description: "AES-256 at rest, TLS 1.3 in transit. API tokens are never stored in plaintext." },
  { icon: Key, title: "Authentication", description: "JWT tokens with short expiry, bcrypt + SHA-256 password hashing, and multi-factor authentication." },
  { icon: Clock, title: "Rate Limiting", description: "Per-IP and per-account rate limiting on all endpoints. Brute-force lockout after 5 failed attempts." },
  { icon: Activity, title: "Penetration Testing", description: "Quarterly external pen tests and continuous automated vulnerability scanning." },
  { icon: FileCheck, title: "SOC 2 Type II", description: "Our infrastructure partners are SOC 2 Type II certified. Full compliance report available on request." },
  { icon: AlertCircle, title: "Incident Response", description: "24-hour SLA for critical security incidents. Dedicated security channel at security@trivisionx.ai." },
];

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 scroll-mt-24" id={title.split(" ")[0].toLowerCase().replace(/\./g, "")}>
      <h2 className="text-xl font-bold text-foreground mb-4 font-mono tracking-tight">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <PageShell
      badge="Trust & Safety"
      title="Security at TriVisionX"
      subtitle="We take a defense-in-depth approach to security. Here's exactly how we protect your data."
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
        <Card className="w-full md:w-64 p-5 sticky top-24 shrink-0 bg-muted/20 border-border hidden md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Contents</h3>
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#1" className="text-foreground hover:text-primary transition-colors font-medium">1. Infrastructure Security</a>
            <a href="#2" className="text-muted-foreground hover:text-primary transition-colors">2. Responsible Disclosure</a>
          </nav>
        </Card>

        <Card className="flex-1 p-6 md:p-10 bg-card/50 border-border">
          <ScrollArea className="h-auto">
            <PolicySection title="1. Infrastructure Security">
              <p>
                Security is foundational to TriVisionX. We utilize enterprise-grade security practices to ensure your agentic workflows and data remain safe.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {securityFeatures.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.title} className="p-4 border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm text-foreground">{s.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    </Card>
                  );
                })}
              </div>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="2. Responsible Disclosure">
              <p>
                We take security vulnerabilities seriously. If you discover a security issue, please email{" "}
                <a href="mailto:security@trivisionx.ai" className="text-primary font-semibold hover:underline">security@trivisionx.ai</a> with a detailed description. We
                commit to acknowledging your report within 24 hours and resolving critical issues within 72 hours.
              </p>
              <p>
                We do not take legal action against researchers who act in good faith and follow responsible disclosure
                guidelines.
              </p>
            </PolicySection>
          </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}
