import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy — TriVisionX",
  description: "How TriVisionX collects, uses, and protects your data.",
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

export default function PrivacyPage() {
  return (
    <PageShell
      badge="Legal"
      title="Privacy Policy"
      subtitle="Last updated: June 1, 2025. We are committed to protecting your personal information and your right to privacy."
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
        {/* Table of Contents sidebar */}
        <Card className="w-full md:w-64 p-5 sticky top-24 shrink-0 bg-muted/20 border-border hidden md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Contents</h3>
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#1" className="text-foreground hover:text-primary transition-colors font-medium">1. Information We Collect</a>
            <a href="#2" className="text-muted-foreground hover:text-primary transition-colors">2. How We Use Your Information</a>
            <a href="#3" className="text-muted-foreground hover:text-primary transition-colors">3. Data Storage & Security</a>
            <a href="#4" className="text-muted-foreground hover:text-primary transition-colors">4. Third-Party Services</a>
            <a href="#5" className="text-muted-foreground hover:text-primary transition-colors">5. Your Rights</a>
            <a href="#6" className="text-muted-foreground hover:text-primary transition-colors">6. Contact</a>
          </nav>
        </Card>

        {/* Content area */}
        <Card className="flex-1 p-6 md:p-10 bg-card/50 border-border">
          <ScrollArea className="h-auto">
            <PolicySection title="1. Information We Collect">
              <p>
                We collect information you provide directly to us (name, email, password) when you create an account. We
                also collect usage data (pages visited, API calls made, document uploads) to improve the platform. We do not
                sell your personal data to third parties.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Account Info:</strong> Email, encrypted password hash.</li>
                <li><strong className="text-foreground">Usage Data:</strong> API hit rates, token usage, dashboard interactions.</li>
                <li><strong className="text-foreground">Payment Info:</strong> Processed securely via Stripe (we do not store raw card data).</li>
              </ul>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="2. How We Use Your Information">
              <p>
                We use your information to operate and improve the platform, communicate with you about your account, send
                product updates (with your consent), ensure security and prevent fraud, and comply with legal obligations.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="3. Data Storage & Security">
              <p>
                All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Authentication tokens are hashed using
                bcrypt. We store data in SOC 2 Type II certified data centers. We undergo regular penetration testing.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="4. Third-Party Services">
              <p>
                We use Pinecone for vector storage, MongoDB Atlas for database, and Vercel for hosting. Each of these
                providers has their own privacy policies. We use Google and GitHub for OAuth — only your public profile and
                email are accessed.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="5. Your Rights">
              <p>
                You may request access to your data, request deletion of your account and data, opt out of marketing
                communications at any time, and export your data in JSON format.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="6. Contact">
              <p>
                For privacy-related questions, contact us at{" "}
                <a href="mailto:privacy@trivisionx.ai" className="text-primary font-semibold hover:underline">privacy@trivisionx.ai</a> or write to: TriVisionX, Inc.,
                123 Mission St, San Francisco, CA 94105.
              </p>
            </PolicySection>
          </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}
