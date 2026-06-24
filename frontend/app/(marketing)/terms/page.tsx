import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service — TriVisionX",
  description: "Terms governing your use of TriVisionX.",
};

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

export default function TermsPage() {
  return (
    <PageShell
      badge="Legal"
      title="Terms of Service"
      subtitle="Last updated: June 1, 2025. Please read these terms carefully before using the TriVisionX platform."
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
        <Card className="w-full md:w-64 p-5 sticky top-24 shrink-0 bg-muted/20 border-border hidden md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Contents</h3>
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#1" className="text-foreground hover:text-primary transition-colors font-medium">1. Acceptance of Terms</a>
            <a href="#2" className="text-muted-foreground hover:text-primary transition-colors">2. Use of the Service</a>
            <a href="#3" className="text-muted-foreground hover:text-primary transition-colors">3. Accounts & Security</a>
            <a href="#4" className="text-muted-foreground hover:text-primary transition-colors">4. Intellectual Property</a>
            <a href="#5" className="text-muted-foreground hover:text-primary transition-colors">5. Limitation of Liability</a>
            <a href="#6" className="text-muted-foreground hover:text-primary transition-colors">6. Governing Law</a>
            <a href="#7" className="text-muted-foreground hover:text-primary transition-colors">7. Contact</a>
          </nav>
        </Card>

        <Card className="flex-1 p-6 md:p-10 bg-card/50 border-border">
          <ScrollArea className="h-auto">
            <PolicySection title="1. Acceptance of Terms">
              <p>
                By accessing or using TriVisionX, you agree to be bound by these Terms of Service. If you do not agree,
                please do not use the platform. These terms apply to all users, including free tier, Pro, and Enterprise
                customers.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="2. Use of the Service">
              <p>
                You may use TriVisionX for lawful purposes only. You agree not to use the platform to generate harmful,
                illegal, or deceptive content, reverse-engineer the platform, or resell access without written permission
                from TriVisionX, Inc.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="3. Accounts & Security">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us
                immediately at <a href="mailto:security@trivisionx.ai" className="text-primary font-semibold hover:underline">security@trivisionx.ai</a> of any
                unauthorized access. We reserve the right to suspend accounts in violation of these terms.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="4. Intellectual Property">
              <p>
                TriVisionX and all associated trademarks, logos, and content are owned by TriVisionX, Inc. Your data and
                content remain yours. We claim no ownership over documents you upload or reports you generate.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="5. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, TriVisionX shall not be liable for indirect, incidental, or
                consequential damages arising from your use of the platform. Our total liability shall not exceed the fees
                you paid in the 3 months prior to the claim.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="6. Governing Law">
              <p>
                These terms are governed by the laws of the State of California. Disputes shall be resolved in the state or
                federal courts of San Francisco County, California.
              </p>
            </PolicySection>

            <Separator className="my-8" />

            <PolicySection title="7. Contact">
              <p>
                For questions about these terms, contact{" "}
                <a href="mailto:legal@trivisionx.ai" className="text-primary font-semibold hover:underline">legal@trivisionx.ai</a>.
              </p>
            </PolicySection>
          </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}
