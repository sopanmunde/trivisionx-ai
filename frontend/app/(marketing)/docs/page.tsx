import { PageShell, Section, CardGrid, FeatureCard } from "@/components/page-shell";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Documentation — TriVisionX", description: "Complete API and platform documentation for TriVisionX." };

const docSections = [
  { icon: "compass", title: "Quick Start", description: "Get your first agent pipeline running in under 5 minutes with our guided setup.", delay: 0 },
  { icon: "key-round", title: "Authentication", description: "JWT-based auth, API key management, and SSO configuration for enterprise deployments.", delay: 0.06 },
  { icon: "boxes", title: "Agent Pipelines", description: "Design, deploy, and monitor multi-agent LangGraph workflows with full observability.", delay: 0.12 },
  { icon: "file-code", title: "Document Ingestion", description: "Upload and index documents via REST API or the dashboard. Supports PDF, DOCX, TXT, images, and more.", delay: 0.18 },
  { icon: "binary", title: "Vector Search", description: "Query your Pinecone knowledge base with semantic search and MMR filtering.", delay: 0.24 },
  { icon: "file-pie-chart", title: "Report Generation", description: "Trigger structured research reports and export them via API or webhooks.", delay: 0.30 },
];

export default function DocsPage() {
  return (
    <PageShell badge="Documentation" title="Developer Documentation" subtitle="Everything you need to integrate, extend, and deploy TriVisionX in your stack.">
      <CardGrid className="mb-16">
        {docSections.map((s) => (
          <FeatureCard key={s.title} icon={s.icon} title={s.title} description={s.description} delay={s.delay} />
        ))}
      </CardGrid>

      <Section title="SDKs & Integrations">
        <p className="mb-8 text-muted-foreground">Official SDKs available for Python and TypeScript/JavaScript. Install them directly from your package manager to get started.</p>

        <Tabs defaultValue="python" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript / Node</TabsTrigger>
          </TabsList>

          <TabsContent value="python">
            <Card className="relative border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-muted/50 px-4 py-3 text-xs font-mono text-muted-foreground border-b border-border/50 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                  pip install trivisionx
                </span>
                <Badge variant="secondary" className="font-mono text-[10px] shadow-sm">Official</Badge>
              </div>
              <ScrollArea className="p-4 w-full">
                <pre className="text-xs font-mono text-foreground/90 leading-relaxed">
                  <span className="text-primary">from</span> trivisionx <span className="text-primary">import</span> Client{'\n\n'}
                  client = Client(api_key=<span className="text-emerald-500">tvx_...</span>){'\n\n'}
                  <span className="text-muted-foreground"># Run a research agent</span>{'\n'}
                  response = client.agents.run({'\n'}
                  query=<span className="text-emerald-500">Analyze recent trends in solid state batteries</span>,{'\n'}
                  agent=<span className="text-emerald-500">planner</span>{'\n'}
                  ){'\n\n'}
                  print(response.content)
                </pre>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="typescript">
            <Card className="relative border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-muted/50 px-4 py-3 text-xs font-mono text-muted-foreground border-b border-border/50 flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                  npm install @trivisionx/client
                </span>
                <Badge variant="secondary" className="font-mono text-[10px] shadow-sm">Official</Badge>
              </div>
              <ScrollArea className="p-4 w-full">
                <pre className="text-xs font-mono text-foreground/90 leading-relaxed">
                  <span className="text-primary">import</span> {'{'} TriVisionX {'}'} <span className="text-primary">from</span> <span className="text-emerald-500">@trivisionx/client</span>;{'\n\n'}
                  <span className="text-primary">const</span> client = <span className="text-primary">new</span> TriVisionX({'{'} apiKey: <span className="text-emerald-500">tvx_...</span> {'}'});{'\n\n'}
                  <span className="text-muted-foreground">Run a research agent</span>{'\n'}
                  <span className="text-primary">const</span> response = <span className="text-primary">await</span> client.agents.run({'{'}{'\n'}
                  query: <span className="text-emerald-500">Analyze recent trends in solid state batteries</span>,{'\n'}
                  agent: <span className="text-emerald-500">planner</span>{'\n'}
                  {'}'});{'\n\n'}
                  console.log(response.content);
                </pre>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <Card className="group relative p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors relative">LangChain Integration</h4>
            <p className="text-xs text-muted-foreground relative">Use TriVisionX as a tool in LangChain.</p>
          </Card>
          <Card className="group relative p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors relative">LangGraph Integration</h4>
            <p className="text-xs text-muted-foreground relative">Use TriVisionX as a tool in LangGraph.</p>
          </Card>
        </div>
      </Section>
    </PageShell>
  );
}
