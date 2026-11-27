"use client";

import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Highlighter } from "@/components/ui/highlighter";
import AnimatedBeamMultipleOutputDemo from "@/registry/example/animated-beam-multiple-outputs";
import AnimatedListDemo from "@/registry/example/animated-list-demo";
import { BentoCard, BentoGrid } from "@/registry/magicui/bento-grid";
import { Marquee } from "@/registry/magicui/marquee";

const files = [
  {
    name: "research_report.pdf",
    body: "Structured multi-agent research synthesis generated with cited passages and formatted for PDF or DOCX export.",
  },
  {
    name: "vector_index_mmr",
    body: "Per-user Pinecone namespace retrieval tuned with Maximal Marginal Relevance (MMR) for diverse document context.",
  },
  {
    name: "langgraph_spec.json",
    body: "StateGraph orchestration featuring planner, retriever, citation verifier, summarizer, and reporter nodes.",
  },
  {
    name: "audit_trail.json",
    body: "MongoDB execution audit log recording node outputs, model provider selection, and attached document citations.",
  },
  {
    name: "gateway_vault.enc",
    body: "Fernet-encrypted BYOK credential vault routing prompts to OpenAI, Gemini, Anthropic, DeepSeek, Groq, and Ollama.",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Continuous Vector Memory",
    description: "Documents and session knowledge are automatically chunked, embedded, and preserved across agent runs.",
    href: "/dashboard",
    cta: "Open Workspace",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-border bg-card/60 hover:bg-card/90",
              "dark:border-border/60 dark:bg-card/40 dark:hover:bg-card/70",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium text-foreground">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs text-muted-foreground">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: "Real-Time Agent Streams",
    description: "Server-Sent Events (SSE) stream reasoning steps, tool outputs, and verified citations live as agents finish.",
    href: "/dashboard/analytics",
    cta: "View Analytics",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2Icon,
    name: "Universal Tool Mesh",
    description: "Connect reports and triggers to Slack, Microsoft Teams, Notion, Confluence, Jira, and MCP endpoints.",
    href: "/dashboard?tab=integrations",
    cta: "Browse Integrations",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute top-4 right-2 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Scheduled Swarm Cron",
    description: "Trigger recurring competitor sweeps, market audits, and automated synthesis on precise schedules.",
    className: "col-span-3 lg:col-span-1",
    href: "/dashboard?tab=calendar",
    cta: "Open Calendar",
    background: (
      <Calendar
        mode="single"
        selected={new Date()}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border border-border bg-card/50 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
];

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}

export function BentoDemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
      {/* Ambient background light gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-foreground text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>BUILT-IN PLATFORM ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Everything your workspace needs.
            <br />
            <span className="text-muted-foreground font-semibold">
              Fully{" "}
              <Highlighter action="underline" color="#3b82f6" strokeWidth={2.5} isView={true}>
                connected
              </Highlighter>{" "}
              out of the box.
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
            Experience live event dispatching, persistent file syncing, multi-agent orchestration, and temporal scheduling in a unified grid.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <BentoDemo />
        </motion.div>
      </div>
    </section>
  );
}

