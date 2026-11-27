"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";

type Support = "yes" | "no" | "partial";

interface Feature {
  name: string;
  trivisionx: Support;
  chatgpt: Support;
  perplexity: Support;
  notebooklm: Support;
}

const features: Feature[] = [
  { name: "Multi-Agent Orchestration (LangGraph)", trivisionx: "yes", chatgpt: "no", perplexity: "no", notebooklm: "no" },
  { name: "Custom Local LLMs (Ollama / LM Studio)", trivisionx: "yes", chatgpt: "no", perplexity: "no", notebooklm: "no" },
  { name: "Sandboxed Code Execution", trivisionx: "yes", chatgpt: "partial", perplexity: "no", notebooklm: "no" },
  { name: "Pinecone Vector RAG", trivisionx: "yes", chatgpt: "no", perplexity: "partial", notebooklm: "partial" },
  { name: "Citation Auditing (per claim)", trivisionx: "yes", chatgpt: "no", perplexity: "partial", notebooklm: "partial" },
  { name: "Workflow Automation (Cron / Event)", trivisionx: "yes", chatgpt: "no", perplexity: "no", notebooklm: "no" },
  { name: "Voice Transcription + Synthesis", trivisionx: "yes", chatgpt: "partial", perplexity: "no", notebooklm: "no" },
  { name: "Export: PDF / DOCX / XLSX", trivisionx: "yes", chatgpt: "partial", perplexity: "no", notebooklm: "partial" },
  { name: "GitHub / Notion / Slack Integrations", trivisionx: "yes", chatgpt: "no", perplexity: "no", notebooklm: "no" },
  { name: "Self-Hosted / On-Premise", trivisionx: "yes", chatgpt: "no", perplexity: "no", notebooklm: "no" },
];

interface ToolItem {
  key: "trivisionx" | "chatgpt" | "perplexity" | "notebooklm";
  label: string;
  highlight?: boolean;
}

const tools: ToolItem[] = [
  { key: "trivisionx", label: "TriVisionX", highlight: true },
  { key: "chatgpt", label: "ChatGPT" },
  { key: "perplexity", label: "Perplexity" },
  { key: "notebooklm", label: "NotebookLM" },
];

function SupportIcon({ value }: { value: Support }) {
  if (value === "yes") {
    return (
      <div className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs mx-auto">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="inline-flex items-center justify-center size-5 rounded-full bg-muted/60 text-muted-foreground/40 mx-auto">
        <X className="w-3.5 h-3.5" />
      </div>
    );
  }
  return (
    <div className="inline-flex items-center justify-center size-5 rounded-full bg-amber-500/10 text-amber-500/80 mx-auto">
      <Minus className="w-3.5 h-3.5" />
    </div>
  );
}

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden bg-background select-none">
      <div ref={ref} className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-secondary-foreground text-xs font-mono mb-6">
            <span className="size-1.5 rounded-full bg-primary" />
            Why TriVisionX
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-3">
            Built for <span className="text-primary">real AI engineers</span>.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Not a wrapper. Not a chat interface. A full multi-agent research platform.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-5 py-4 text-xs font-mono text-muted-foreground font-medium w-1/2">
                  Feature
                </th>
                {tools.map((tool) => (
                  <th
                    key={tool.key}
                    className={`text-center px-4 py-4 text-xs font-bold transition-colors ${tool.highlight
                      ? "text-primary bg-primary/[0.04] dark:bg-primary/[0.08] border-x border-primary/25"
                      : "text-muted-foreground font-medium"
                      }`}
                  >
                    {tool.highlight && (
                      <span className="inline-block mb-1 text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/30 tracking-wide font-bold">
                        ✦ OUR PICK
                      </span>
                    )}
                    <div>{tool.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.name}
                  className={`border-b border-border/40 last:border-0 ${i % 2 === 0 ? "bg-muted/15" : ""
                    } hover:bg-muted/30 transition-colors duration-150`}
                >
                  <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                    {feature.name}
                  </td>
                  {tools.map((tool) => (
                    <td
                      key={tool.key}
                      className={`text-center px-4 py-3.5 transition-colors ${tool.highlight ? "bg-primary/[0.04] dark:bg-primary/[0.08] border-x border-primary/25" : ""
                        }`}
                    >
                      <SupportIcon value={feature[tool.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-5 text-xs font-mono text-muted-foreground"
        >
          <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Full support</span>
          <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-yellow-500/70" /> Partial</span>
          <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-muted-foreground/40" /> Not available</span>
        </motion.div>
      </div>
    </section>
  );
}
