import { PageShell, Section } from "@/components/page-shell";
import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BlogReader, type BlogPost } from "@/components/BlogReader";

export const metadata: Metadata = {
  title: "Blog — TriVisionX",
  description: "Engineering insights, AI research, and product updates from the TriVisionX team.",
};

const posts: BlogPost[] = [
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
  const categories = ["Engineering", "Research", "Product"] as const;

  return (
    <PageShell
      badge={<><Rss className="w-3 h-3 inline mr-1" />Blog</>}
      title="Insights & Updates"
      subtitle="Engineering deep-dives, AI research, and product announcements from the TriVisionX team."
    >
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

      {/* Interactive Blog Reader with full modals */}
      <BlogReader posts={posts} />

      {/* Newsletter */}
      <Section title="Stay Updated">
        <Card className="p-8 bg-muted/30 border-dashed text-center mt-12">
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
