import { PageShell, Section } from "@/components/page-shell";
import type { Metadata } from "next";
import { Calendar, Clock, ArrowUpRight, Rss, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Blog — TriVisionX",
  description: "Engineering insights, AI research, and product updates from the TriVisionX team.",
};

const posts = [
  {
    category: "Engineering",
    author: "Alice Chen",
    authorInitials: "AC",
    authorColor: "bg-blue-500",
    authorBio: "Senior Engineer at TriVisionX. Specializes in LangGraph orchestration and multi-agent systems.",
    title: "Building Self-Correcting Agent Pipelines with LangGraph",
    excerpt: "How we designed a 5-agent architecture that autonomously validates its own outputs, reducing hallucination rates by 73%.",
    date: "June 15, 2025",
    readTime: "8 min",
    featured: true,
  },
  {
    category: "Research",
    author: "Bob Smith",
    authorInitials: "BS",
    authorColor: "bg-purple-500",
    authorBio: "AI Researcher focused on retrieval-augmented generation and vector search at TriVisionX.",
    title: "Maximal Marginal Relevance: Why Diversity in RAG Matters",
    excerpt: "A deep-dive into how MMR retrieval outperforms vanilla cosine similarity in long-context research tasks.",
    date: "June 8, 2025",
    readTime: "6 min",
    featured: false,
  },
  {
    category: "Product",
    author: "Charlie Davis",
    authorInitials: "CD",
    authorColor: "bg-emerald-500",
    authorBio: "Product Manager driving the TriVisionX platform roadmap and developer experience.",
    title: "Introducing Multi-Model Routing: Let the Task Choose the Model",
    excerpt: "Intelligent routing between GPT-4o, Claude 3.5, Gemini 1.5 Pro, and Groq based on task complexity and cost.",
    date: "May 28, 2025",
    readTime: "4 min",
    featured: false,
  },
  {
    category: "Engineering",
    author: "Alice Chen",
    authorInitials: "AC",
    authorColor: "bg-blue-500",
    authorBio: "Senior Engineer at TriVisionX. Specializes in LangGraph orchestration and multi-agent systems.",
    title: "How We Handle Document Ingestion at Scale",
    excerpt: "From PDF parsing to chunking strategies, embedding models, and Pinecone upsert batching — our full pipeline explained.",
    date: "May 19, 2025",
    readTime: "10 min",
    featured: false,
  },
  {
    category: "Research",
    author: "Diana Prince",
    authorInitials: "DP",
    authorColor: "bg-rose-500",
    authorBio: "Research Lead building the citation verification and source transparency layer at TriVisionX.",
    title: "Citation Auditing in AI: A Framework for Source Transparency",
    excerpt: "We believe every AI output should be traceable. Here's the technical architecture behind our citation verification layer.",
    date: "May 10, 2025",
    readTime: "7 min",
    featured: false,
  },
  {
    category: "Product",
    author: "Bob Smith",
    authorInitials: "BS",
    authorColor: "bg-purple-500",
    authorBio: "AI Researcher focused on retrieval-augmented generation and vector search at TriVisionX.",
    title: "TriVisionX v2.0: Streaming, SSO, and More",
    excerpt: "Today we're shipping our biggest release yet — real-time streaming responses, Google/GitHub SSO, and a redesigned dashboard.",
    date: "April 30, 2025",
    readTime: "5 min",
    featured: false,
  },
];

const categoryVariant: Record<string, string> = {
  Engineering: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  Research: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  Product: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
};

export default function BlogPage() {
  const featured = posts.find((p) => p.featured)!;
  const rest = posts.filter((p) => !p.featured);
  const categories = ["Engineering", "Research", "Product"] as const;

  return (
    <PageShell
      badge={<><Rss className="w-3 h-3 inline mr-1" />Blog</>}
      title="Insights & Updates"
      subtitle="Engineering deep-dives, AI research, and product announcements from the TriVisionX team."
    >
      {/* Featured Post */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="mb-10 group cursor-pointer hover:border-primary/50 transition-colors duration-200 overflow-hidden">
            <CardHeader className="pb-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`text-[11px] font-mono ${categoryVariant[featured.category]}`}>
                  {featured.category}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-mono gap-1">
                  <Bookmark className="w-3 h-3" />
                  Featured
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {featured.excerpt}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={`${featured.authorColor} text-white text-xs font-mono font-semibold`}>
                      {featured.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none mb-1">{featured.author}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{featured.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime} read</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  Read article
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-4">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className={`${featured.authorColor} text-white text-xs font-mono font-semibold`}>
                {featured.authorInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{featured.author}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{featured.authorBio}</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {categories.map((cat) => (
          <Card key={cat} className="p-4 text-center bg-muted/30 border-dashed">
            <p className="text-2xl font-extrabold text-foreground tracking-tight mb-0.5">
              {posts.filter((p) => p.category === cat).length}
            </p>
            <p className="text-xs font-mono text-muted-foreground">{cat}</p>
          </Card>
        ))}
      </div>

      {/* All Posts Grid */}
      <Section title="All Articles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((post) => (
            <HoverCard key={post.title}>
              <HoverCardTrigger asChild>
                <Card className="group cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col h-full">
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] font-mono ${categoryVariant[post.category]}`}>
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-4 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div>
                      <Separator className="mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className={`${post.authorColor} text-white text-[9px] font-mono font-semibold`}>
                              {post.authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">{post.author}</span>
                          <span className="text-xs text-muted-foreground font-mono hidden sm:flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{post.date}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 p-4">
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className={`${post.authorColor} text-white text-xs font-mono font-semibold`}>
                      {post.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{post.authorBio}</p>
                    <Badge variant="outline" className={`text-[10px] font-mono mt-1 ${categoryVariant[post.category]}`}>
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <Section title="Stay Updated">
        <Card className="p-8 bg-muted/30 border-dashed text-center">
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <Rss className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Get articles in your inbox</h3>
              <p className="text-sm text-muted-foreground">
                New engineering articles, research findings, and product news — delivered monthly.
              </p>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              Send your email to{" "}
              <span className="text-foreground font-semibold">blog@trivisionx.ai</span>{" "}
              to subscribe.
            </p>
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
