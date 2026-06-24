import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Licenses — TriVisionX",
  description: "Open source licenses used in TriVisionX.",
};

const dependencies = [
  { name: "Next.js", license: "MIT", desc: "The React framework for production." },
  { name: "FastAPI", license: "MIT", desc: "High-performance Python web framework." },
  { name: "LangChain / LangGraph", license: "MIT", desc: "Agentic AI orchestration framework." },
  { name: "Pydantic", license: "MIT", desc: "Data validation and settings management." },
  { name: "Framer Motion", license: "MIT", desc: "Production-ready motion library for React." },
  { name: "Pinecone Client", license: "Apache 2.0", desc: "Vector database SDK." },
  { name: "Motor (AsyncIO MongoDB)", license: "Apache 2.0", desc: "Async MongoDB driver for Python." },
  { name: "python-jose", license: "MIT", desc: "JSON Web Tokens (JWT) for Python." },
  { name: "bcrypt", license: "Apache 2.0", desc: "Password hashing library." },
  { name: "Tailwind CSS", license: "MIT", desc: "Utility-first CSS framework." },
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

export default function LicensesPage() {
  return (
    <PageShell
      badge="Legal"
      title="Open Source Licenses"
      subtitle="TriVisionX is built with and grateful for the open-source community. Here are the key dependencies and their licenses."
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
        <Card className="w-full md:w-64 p-5 sticky top-24 shrink-0 bg-muted/20 border-border hidden md:block">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Contents</h3>
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#1" className="text-foreground hover:text-primary transition-colors font-medium">1. Core Dependencies</a>
            <a href="#2" className="text-muted-foreground hover:text-primary transition-colors">2. TriVisionX License</a>
          </nav>
        </Card>

        <Card className="flex-1 p-6 md:p-10 bg-card/50 border-border">
          <ScrollArea className="h-auto">
            <PolicySection title="1. Core Dependencies">
              <div className="space-y-3">
                {dependencies.map((dep) => (
                  <Card key={dep.name} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-muted/30 border-border px-4 py-3 transition-colors duration-200">
                    <code className="text-xs font-bold text-primary select-all sm:w-44 shrink-0 font-mono">
                      {dep.name}
                    </code>
                    <Badge variant="outline" className="text-[10px] font-mono font-medium justify-center w-24 shrink-0 py-0.5">
                      {dep.license}
                    </Badge>
                    <span className="text-xs text-muted-foreground leading-relaxed sm:ml-auto">
                      {dep.desc}
                    </span>
                  </Card>
                ))}
              </div>
            </PolicySection>
            
            <Separator className="my-8" />

            <PolicySection title="2. TriVisionX License">
              <p>
                The TriVisionX platform (SaaS) is proprietary software. The underlying infrastructure libraries and
                open-source contributions made by TriVisionX are available under the MIT license on GitHub.
              </p>
            </PolicySection>
          </ScrollArea>
        </Card>
      </div>
    </PageShell>
  );
}
