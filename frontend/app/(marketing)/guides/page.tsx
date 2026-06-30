import { PageShell, Section } from "@/components/page-shell";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Guides — TriVisionX", description: "Step-by-step guides for building with TriVisionX." };

const guides = [
  { icon: "🚀", category: "getting-started", title: "Your First Agent Pipeline", description: "Set up your account, connect a data source, and run your first multi-agent research query.", readTime: "5 min", level: "Beginner" },
  { icon: "🗄️", category: "getting-started", title: "Indexing Your Knowledge Base", description: "Learn how to upload, chunk, and embed documents into Pinecone for semantic retrieval.", readTime: "8 min", level: "Beginner" },
  { icon: "🔌", category: "advanced", title: "Connecting to External APIs", description: "Use the TriVisionX webhook system to trigger agent pipelines from external events.", readTime: "10 min", level: "Advanced" },
  { icon: "🎭", category: "advanced", title: "Custom Agent Personas", description: "Configure agent personality, instruction sets, and output formats for your domain.", readTime: "12 min", level: "Advanced" },
  { icon: "📊", category: "getting-started", title: "Generating Research Reports", description: "Automate structured report generation with custom templates and scheduled runs.", readTime: "7 min", level: "Intermediate" },
  { icon: "🔐", category: "enterprise", title: "Enterprise SSO Setup", description: "Configure SAML 2.0 and OAuth for enterprise single sign-on and role-based access.", readTime: "15 min", level: "Enterprise" },
  { icon: "🧠", category: "advanced", title: "Multi-Model Routing Strategy", description: "Dynamically route queries to different LLMs based on task complexity and cost.", readTime: "11 min", level: "Advanced" },
  { icon: "🏢", category: "enterprise", title: "Audit Logs & Compliance", description: "Set up logging, retention policies, and compliance exports for regulated industries.", readTime: "14 min", level: "Enterprise" },
];

const levelColor: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10",
  Intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10",
  Advanced: "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10",
  Enterprise: "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/10",
};

function GuideCard({ guide }: { guide: (typeof guides)[number] }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="group relative cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 bg-card/60 backdrop-blur-sm h-full flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader className="pb-3 relative">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-2xl">{guide.icon}</span>
              <Badge variant="outline" className={`text-[10px] font-mono shrink-0 shadow-sm ${levelColor[guide.level]}`}>{guide.level}</Badge>
            </div>
            <CardTitle className="text-base group-hover:text-primary transition-colors leading-snug">{guide.title}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">{guide.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 mt-auto relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="w-3 h-3" /> {guide.readTime} read
              </span>
              <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Read guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 border-border/60 bg-card/90 backdrop-blur-xl">
        <div className="flex gap-3">
          <span className="text-3xl">{guide.icon}</span>
          <div>
            <h4 className="font-semibold text-sm mb-1">{guide.title}</h4>
            <p className="text-xs text-muted-foreground">{guide.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className={`text-[10px] font-mono shadow-sm ${levelColor[guide.level]}`}>{guide.level}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{guide.readTime} read</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function GuidesPage() {
  const allGuides = guides;
  const beginnerGuides = guides.filter(g => g.category === "getting-started");
  const advancedGuides = guides.filter(g => g.category === "advanced");
  const enterpriseGuides = guides.filter(g => g.category === "enterprise");

  return (
    <PageShell badge="Resources" title="Guides & Tutorials" subtitle="Practical, step-by-step tutorials to help you get the most out of TriVisionX.">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 flex-wrap h-auto">
          <TabsTrigger value="all" className="px-5">All <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{allGuides.length}</Badge></TabsTrigger>
          <TabsTrigger value="getting-started" className="px-5">Getting Started</TabsTrigger>
          <TabsTrigger value="advanced" className="px-5">Advanced</TabsTrigger>
          <TabsTrigger value="enterprise" className="px-5">Enterprise</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allGuides.map(g => <GuideCard key={g.title} guide={g} />)}
          </div>
        </TabsContent>
        <TabsContent value="getting-started">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beginnerGuides.map(g => <GuideCard key={g.title} guide={g} />)}
          </div>
        </TabsContent>
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {advancedGuides.map(g => <GuideCard key={g.title} guide={g} />)}
          </div>
        </TabsContent>
        <TabsContent value="enterprise">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enterpriseGuides.map(g => <GuideCard key={g.title} guide={g} />)}
          </div>
        </TabsContent>
      </Tabs>

      <Section title="Can't find what you need?" className="text-center mt-16 pt-12">
        <p className="text-muted-foreground mb-6">Request a guide or ask questions in the community.</p>
        <Link href="/community" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
          <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" /> Visit the Community →
        </Link>
      </Section>
    </PageShell>
  );
}
