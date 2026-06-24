import { PageShell, CardGrid, FeatureCard, Section } from "@/components/page-shell";
import type { Metadata } from "next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Features — TriVisionX",
  description: "Explore the full capabilities of TriVisionX's agentic AI platform.",
};

const pipelineSteps = [
  {
    id: "planner",
    name: "Planner",
    description: "Decomposes the user's query into smaller, manageable sub-tasks. It decides the optimal execution path and determines which tools or agents are needed.",
    code: `{\n  "agent": "planner",\n  "status": "success",\n  "tasks": [\n    {"id": "t1", "action": "retrieve", "target": "Q3 financials"},\n    {"id": "t2", "action": "verify", "depends_on": "t1"}\n  ]\n}`
  },
  {
    id: "researcher",
    name: "Researcher",
    description: "Executes searches against the vector database using Semantic MMR. It retrieves diverse, highly relevant context to ground the generation.",
    code: `{\n  "agent": "researcher",\n  "documents_found": 14,\n  "sources": [\n    "doc_781 (score: 0.92)",\n    "doc_442 (score: 0.88)"\n  ]\n}`
  },
  {
    id: "validator",
    name: "Validator",
    description: "Checks retrieved documents for hallucinations or contradictions. It filters out irrelevant data before passing it to the synthesizer.",
    code: `{\n  "agent": "validator",\n  "checks_passed": true,\n  "confidence": 0.98,\n  "flagged": []\n}`
  },
  {
    id: "synthesizer",
    name: "Synthesizer",
    description: "Merges the verified findings into a coherent, cited narrative. It streams the response token-by-token back to the client.",
    code: `{\n  "agent": "synthesizer",\n  "model": "gpt-4o",\n  "tokens": 842,\n  "latency_ms": 420\n}`
  },
  {
    id: "critic",
    name: "Critic",
    description: "Reviews the final output against the original query to ensure all constraints were met. If not, it can trigger a self-correction loop.",
    code: `{\n  "agent": "critic",\n  "approved": true,\n  "feedback": "All constraints met. Citations are accurate."\n}`
  }
];

export default function FeaturesPage() {
  return (
    <PageShell
      badge="Platform"
      title="Everything You Need to Build with AI"
      subtitle="Multi-agent orchestration, semantic retrieval, and real-time synthesis — unified in one enterprise-grade platform."
    >
      <CardGrid className="mb-16">
        {[
          { icon: "cpu", title: "Multi-Agent Orchestration", description: "Deploy self-correcting LangGraph pipelines with 5-agent collaboration — Planner, Researcher, Validator, Synthesizer, and Critic.", delay: 0 },
          { icon: "search", title: "Semantic MMR Retrieval", description: "Context retrieval powered by Pinecone with Maximal Marginal Relevance to surface diverse, high-quality results.", delay: 0.05 },
          { icon: "shuffle", title: "Multi-Model Routing", description: "Dynamically route queries to GPT-4o, Claude, Gemini, or Groq based on cost, speed, and task complexity.", delay: 0.1 },
          { icon: "upload", title: "Document Ingestion Pipeline", description: "Upload PDFs, Docs, images, and more. Automatically chunk, embed, and index into your vector knowledge base.", delay: 0.15 },
          { icon: "shield-check", title: "Citation Auditing", description: "Every AI-generated insight is traceable back to verified source documents, ensuring compliance and trust.", delay: 0.2 },
          { icon: "activity", title: "Real-Time Streaming", description: "Get streaming responses with token-by-token output for a premium, low-latency interaction experience.", delay: 0.25 },
        ].map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} delay={f.delay} />
        ))}
      </CardGrid>

      <Section title="Interactive Pipeline Architecture" className="border-none mt-0 pt-0">
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Explore how our 5-agent architecture processes a query in real-time. Each agent has a specific role, working autonomously to ensure high-quality, hallucination-free outputs.
        </p>

        <Tabs defaultValue="planner" className="w-full">
          <ScrollArea className="w-full pb-4">
            <TabsList className="w-full justify-start md:justify-center mb-6 min-w-max">
              {pipelineSteps.map((step) => (
                <TabsTrigger key={step.id} value={step.id} className="px-6">
                  {step.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {pipelineSteps.map((step) => (
            <TabsContent key={step.id} value={step.id}>
              <Card className="border-border bg-card/50 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
                    <Badge className="w-max mb-4 font-mono">{step.name} Agent</Badge>
                    <h3 className="text-2xl font-bold mb-3">{step.name} Role</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="p-8 bg-muted/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="text-xs font-mono text-muted-foreground ml-2">Trace Log</span>
                    </div>
                    <pre className="text-[11px] sm:text-xs font-mono text-muted-foreground bg-background p-4 rounded-lg border border-border overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </Section>
    </PageShell>
  );
}
