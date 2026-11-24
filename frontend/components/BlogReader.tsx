"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Bookmark,
  X,
  Share2,
  Check,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export interface BlogPost {
  category: "Engineering" | "Research" | "Product";
  author: string;
  authorInitials: string;
  authorColor: string;
  authorBio: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  featured?: boolean;
  content?: string[];
  codeSnippet?: string;
}

const categoryVariant: Record<string, string> = {
  Engineering: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  Research: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
  Product: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
};

const ARTICLE_BODIES: Record<string, { paragraphs: string[]; code?: string; takeaways: string[] }> = {
  "Building Self-Correcting Agent Pipelines with LangGraph": {
    paragraphs: [
      "Traditional language model chains suffer from an inevitable compound error rate: if Step 1 hallucinates a parameter, Steps 2 through 5 will amplify the divergence. In TriVisionX, we solved this by converting linear prompt cascades into cyclic state graphs via LangGraph.",
      "Our architecture deploys an explicit 'Verifier' node right before final synthesis. The verifier parses generated citations against raw retrieved chunks stored in the agent state. If semantic overlap falls below 0.82 cosine similarity, the edge transitions backwards to the Retriever node with an expanded query vector.",
      "During stress testing on 1,200 complex multi-hop research queries, this autonomous self-correction mechanism dropped hallucination rates from 24.1% down to 6.5%."
    ],
    code: `workflow = StateGraph(AgentState)
workflow.add_node("planner", planner_node)
workflow.add_node("retriever", retriever_node)
workflow.add_node("verifier", citation_verifier_node)
workflow.add_node("reporter", report_node)

def should_retry(state: AgentState):
    if state.get("confidence", 1.0) < 0.82 and state.get("retries", 0) < 3:
        return "retriever"
    return "reporter"

workflow.add_conditional_edges("verifier", should_retry, {
    "retriever": "retriever",
    "reporter": "reporter"
})`,
    takeaways: [
      "Cyclic graphs allow self-correction that linear DAGs cannot achieve.",
      "Citation verification must occur on raw chunks before report generation.",
      "Bounded retry counters prevent infinite loops while maintaining high factual fidelity."
    ]
  },
  "Maximal Marginal Relevance: Why Diversity in RAG Matters": {
    paragraphs: [
      "Standard vector retrieval selects top-K chunks strictly by cosine similarity. In dense corporate documents, this often returns five nearly identical paragraphs from page 2, starving the model of diverse context across the full report.",
      "TriVisionX implements Maximal Marginal Relevance (MMR) retrieval across all Pinecone index queries. By balancing semantic relevance with diversity against already selected chunks (using lambda = 0.65), our synthesis engine captures cross-cutting insights from disparate sections.",
      "The result is a 38% increase in cross-topic recall across long-form financial and legal documents."
    ],
    takeaways: [
      "Cosine similarity alone creates information redundancy in top-K retrieval.",
      "MMR with lambda=0.65 provides the optimal trade-off between relevance and diversity.",
      "Embedding models benefit greatly when paired with post-retrieval reranking."
    ]
  },
  "Introducing Multi-Model Routing: Let the Task Choose the Model": {
    paragraphs: [
      "Not every query requires a frontier reasoning model. Summarizing meeting minutes or formatting markdown can be accomplished in 120ms with Groq Llama 3 70B, reserving high-cost models like GPT-4o and Claude 3.5 Sonnet for intricate code refactoring and academic synthesis.",
      "Our intelligent model router inspects query complexity, tool requirements, and context token length to automatically dispatch to the most cost-effective provider.",
      "Users have experienced a 62% reduction in end-to-end API costs without any measurable degradation in response accuracy."
    ],
    takeaways: [
      "Dynamic routing matches prompt difficulty to the optimal model tier.",
      "Sub-second streaming from Groq provides immediate tactile feedback.",
      "Seamless provider failover ensures zero downtime during upstream provider outages."
    ]
  }
};

export function BlogReader({ posts }: { posts: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => !p.featured);

  const handleShare = (title: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getArticleDetails = (title: string) => {
    return ARTICLE_BODIES[title] || {
      paragraphs: [
        "In production AI deployments, reliability and deterministic behavior are the primary drivers of user trust.",
        "TriVisionX continues to push the frontier of multimodal agentic workflows with unified memory, verifiable citations, and real-time telemetry."
      ],
      takeaways: [
        "End-to-end transparency builds confidence for enterprise compliance.",
        "Modular LangGraph pipelines scale efficiently across microservices."
      ]
    };
  };

  return (
    <>
      {/* Featured Post Card */}
      <Card
        onClick={() => setSelectedPost(featured)}
        className="mb-10 group cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
      >
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
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Read article
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rest.map((post) => (
          <Card
            key={post.title}
            onClick={() => setSelectedPost(post)}
            className="group cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col h-full"
          >
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
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Article Modal Reader */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] font-mono ${categoryVariant[selectedPost.category]}`}>
                    {selectedPost.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">• {selectedPost.readTime} read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(selectedPost.title)}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                    Share
                  </Button>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal Article Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                    {selectedPost.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`${selectedPost.authorColor} text-white text-xs font-mono font-semibold`}>
                        {selectedPost.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedPost.author}</p>
                      <p className="text-xs text-muted-foreground">{selectedPost.authorBio}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-sm font-medium text-foreground italic leading-relaxed">
                  "{selectedPost.excerpt}"
                </div>

                {/* Article Body Paragraphs */}
                <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
                  {getArticleDetails(selectedPost.title).paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* Code Snippet if present */}
                {getArticleDetails(selectedPost.title).code && (
                  <div className="rounded-xl overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 p-4 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                      <span>Python LangGraph Pipeline</span>
                      <span>TriVisionX Engine</span>
                    </div>
                    <pre className="overflow-x-auto leading-relaxed">
                      <code>{getArticleDetails(selectedPost.title).code}</code>
                    </pre>
                  </div>
                )}

                {/* Key Takeaways Card */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Key Architecture Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {getArticleDetails(selectedPost.title).takeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">TriVisionX Engineering & Research Publications</span>
                <Button size="sm" onClick={() => setSelectedPost(null)} className="text-xs h-8">
                  Done Reading
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
