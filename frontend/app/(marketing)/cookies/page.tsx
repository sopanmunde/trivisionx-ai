import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Cookie Policy — TriVisionX",
  description: "How TriVisionX uses cookies.",
};

const cookies = [
  { name: "auth_token", type: "Essential", purpose: "Keeps you signed in across sessions. Expires after 7 days." },
  { name: "theme_preference", type: "Functional", purpose: "Remembers your light/dark mode preference." },
  { name: "_vercel_analytics", type: "Analytics", purpose: "Anonymous usage analytics via Vercel. No personal data collected." },
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

export default function CookiesPage() {
  return (
    <PageShell
      badge="Legal"
      title="Cookie Policy"
      subtitle="Last updated: June 1, 2025. This policy explains what cookies we use and why."
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
        <Card className="w-full md:w-64 p-5 sticky top-24 shrink-0 bg-muted/20 border-border hidden md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Contents</h3>
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#1" className="text-foreground hover:text-primary transition-colors font-medium">1. What Are Cookies?</a>
            <a href="#2" className="text-muted-foreground hover:text-primary transition-colors">2. Cookies We Use</a>
            <a href="#3" className="text-muted-foreground hover:text-primary transition-colors">3. Managing Cookies</a>
            <a href="#4" className="text-muted-foreground hover:text-primary transition-colors">4. Contact</a>
          </nav>
        </Card>

        <Card className="flex-1 p-6 md:p-10 bg-card/50 border-border">
          <ScrollArea className="h-auto">
            <PolicySection title="1. What Are Cookies?">
              <p>
                Cookies are small text files stored on your browser when you visit a website. They help us remember your
                preferences, keep you signed in, and understand how you use the platform.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="2. Cookies We Use">
              <div className="space-y-4">
                {cookies.map((c) => (
                  <Card key={c.name} className="p-4 border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-3">
                    <code className="text-xs font-bold text-primary bg-background px-2 py-1 border border-border rounded font-mono select-all shrink-0">
                      {c.name}
                    </code>
                    <Badge variant="outline" className="text-[10px] font-mono font-medium shrink-0 w-max">
                      {c.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed sm:ml-2">{c.purpose}</p>
                  </Card>
                ))}
              </div>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="3. Managing Cookies">
              <p>
                You can delete or block cookies through your browser settings. Note that disabling the <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">auth_token</code> cookie
                will require you to sign in each time. We do not use advertising or tracking cookies.
              </p>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="4. Contact">
              <p>
                Questions? Email <a href="mailto:privacy@trivisionx.ai" className="text-primary font-semibold hover:underline">privacy@trivisionx.ai</a>.
              </p>
            </PolicySection>
          </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}
