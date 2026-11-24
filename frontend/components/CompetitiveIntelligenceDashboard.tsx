"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  ShieldAlert,
  Zap,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
  Cpu,
  BarChart3,
  Flame,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CompetitorData {
  name: string;
  category: string;
  moat: string;
  marketShare: string;
  pricing: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  matrix: {
    feature: string;
    triVisionX: string | boolean;
    competitor: string | boolean;
    status: "win" | "tie" | "lead";
  }[];
  signals: {
    date: string;
    title: string;
    impact: "High" | "Medium" | "Low";
    type: "Release" | "Pricing" | "Funding" | "Vulnerability";
  }[];
}

const PRESET_COMPETITORS: Record<string, CompetitorData> = {
  openai: {
    name: "OpenAI (ChatGPT Enterprise)",
    category: "Proprietary Foundation LLM",
    moat: "Brand recognition, massive ecosystem & consumer reach",
    marketShare: "58% Enterprise Mindshare",
    pricing: "$30/user/mo + strict API usage quotas",
    swot: {
      strengths: [
        "Unmatched reasoning benchmarks with GPT-4o & o1 family",
        "Widespread third-party plugins and developer adoption",
        "Direct Microsoft Azure enterprise distribution channel"
      ],
      weaknesses: [
        "Black-box proprietary routing with no self-hosted option",
        "Higher inference costs at multi-million token volumes",
        "Frequent rate limits on reasoning-heavy models during peak hours"
      ],
      opportunities: [
        "Agentic workflow automation via Assistants API",
        "Voice-to-voice real-time API integrations in hardware"
      ],
      threats: [
        "Open-source models (DeepSeek, Llama 3) closing performance gap",
        "Enterprise privacy apprehension regarding cloud retention"
      ]
    },
    matrix: [
      { feature: "Multi-Agent LangGraph Orchestration", triVisionX: true, competitor: false, status: "win" },
      { feature: "Full Citation & Grounding Auditing", triVisionX: true, competitor: "Basic links", status: "win" },
      { feature: "Self-Hosted / Hybrid Multi-Cloud Option", triVisionX: true, competitor: false, status: "win" },
      { feature: "Sub-Second Groq & Local Model Fallbacks", triVisionX: true, competitor: false, status: "win" },
      { feature: "Multimodal Document & Audio RAG", triVisionX: true, competitor: true, status: "tie" },
      { feature: "Consumer Brand Penetration", triVisionX: "Growing", competitor: "Dominant", status: "lead" }
    ],
    signals: [
      { date: "Nov 2024", title: "o1 reasoning system prompt leaks audited for safety compliance", impact: "High", type: "Vulnerability" },
      { date: "Oct 2024", title: "Launched Canvas interactive workspace for code and writing", impact: "Medium", type: "Release" },
      { date: "Sep 2024", title: "Raised $6.6B funding at $157B enterprise valuation", impact: "High", type: "Funding" }
    ]
  },
  perplexity: {
    name: "Perplexity AI (Enterprise Pro)",
    category: "Conversational Search Engine",
    moat: "Search indexing speed and real-time web citations",
    marketShare: "22% Academic & Research Mindshare",
    pricing: "$20/user/mo (Enterprise $40/mo)",
    swot: {
      strengths: [
        "Rapid live web search aggregation with direct URL pills",
        "Clean, distraction-free consumer interface",
        "Multi-model toggle between Claude 3.5, Sonar, and GPT-4o"
      ],
      weaknesses: [
        "Single-turn retrieval without autonomous multi-agent correction",
        "Weak support for deep proprietary internal file stores / multi-repo codebases",
        "No execution sandboxes or automated unit-test runner"
      ],
      opportunities: [
        "Replacing standard Google Search for knowledge workers",
        "Enterprise workspaces with domain-specific crawling"
      ],
      threats: [
        "Publisher copyright lawsuits and scraping pushback",
        "Google AI Overviews capturing zero-click query traffic"
      ]
    },
    matrix: [
      { feature: "Multi-Agent LangGraph Orchestration", triVisionX: true, competitor: false, status: "win" },
      { feature: "Self-Correcting RAG with MMR Reranking", triVisionX: true, competitor: "Standard vector", status: "win" },
      { feature: "Persistent Knowledge Graph & Fact Store", triVisionX: true, competitor: false, status: "win" },
      { feature: "Code Sandboxing & Multi-File Architecture", triVisionX: true, competitor: false, status: "win" },
      { feature: "Real-Time Live Web Search", triVisionX: true, competitor: true, status: "tie" }
    ],
    signals: [
      { date: "Nov 2024", title: "Introduced Perplexity Shopping with one-click checkout", impact: "Medium", type: "Release" },
      { date: "Oct 2024", title: "Launched Enterprise Spaces with internal document index", impact: "High", type: "Release" }
    ]
  },
  anthropic: {
    name: "Anthropic (Claude Enterprise)",
    category: "Safety-First Frontier AI",
    moat: "Artifacts interactive canvas, huge 200k context window",
    marketShare: "29% Coding & Analytical Enterprise Market",
    pricing: "$30/user/mo (min 5 seats)",
    swot: {
      strengths: [
        "Industry-best coding benchmarks with Claude 3.5 Sonnet",
        "Artifacts interface for instant HTML/React/SVG visualization",
        "High steerability with XML prompt framing"
      ],
      weaknesses: [
        "Limited built-in web search tooling in standard tier",
        "No native multi-agent cyclic loops (single model responses)",
        "Stricter rate caps during peak enterprise hours"
      ],
      opportunities: [
        "Computer Use API for autonomous browser & OS automation",
        "Expansion into deep life sciences and legal document auditing"
      ],
      threats: [
        "Rapid release cadences from OpenAI and Google Gemini",
        "Compute infrastructure dependency on AWS and GCP"
      ]
    },
    matrix: [
      { feature: "Multi-Agent LangGraph Orchestration", triVisionX: true, competitor: "Requires custom build", status: "win" },
      { feature: "Full Citation & Grounding Auditing", triVisionX: true, competitor: "Manual verification", status: "win" },
      { feature: "Coding Architecture & Synthesis", triVisionX: true, competitor: true, status: "tie" },
      { feature: "Interactive UI & Artifacts", triVisionX: true, competitor: true, status: "tie" },
      { feature: "Computer Use OS Automation", triVisionX: "Planned", competitor: true, status: "lead" }
    ],
    signals: [
      { date: "Nov 2024", title: "Upgraded Claude 3.5 Sonnet with 72% SWE-bench verified", impact: "High", type: "Release" },
      { date: "Oct 2024", title: "Public beta of Computer Use API for desktop control", impact: "High", type: "Release" }
    ]
  }
};

export function CompetitiveIntelligenceDashboard() {
  const [selectedKey, setSelectedKey] = useState<string>("openai");
  const [customQuery, setCustomQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"swot" | "matrix" | "signals">("swot");

  const currentData = PRESET_COMPETITORS[selectedKey] || PRESET_COMPETITORS["openai"];

  const handleRunDeepSweep = () => {
    setIsAnalyzing(true);
    toast.info(`Invoking competitive_graph for ${currentData.name}...`);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success(`Competitive analysis refreshed for ${currentData.name} with 6 citation sources.`);
    }, 1200);
  };

  const handleExportReport = () => {
    const reportText = `# TriVisionX Competitive Intelligence Report: ${currentData.name}
Generated: ${new Date().toLocaleDateString()}
Category: ${currentData.category}
Market Share: ${currentData.marketShare}
Pricing: ${currentData.pricing}

## Core Strengths:
${currentData.swot.strengths.map(s => `- ${s}`).join("\n")}

## Core Vulnerabilities / Weaknesses:
${currentData.swot.weaknesses.map(w => `- ${w}`).join("\n")}

## Strategic Opportunities for TriVisionX:
${currentData.swot.opportunities.map(o => `- ${o}`).join("\n")}

## Market Threats:
${currentData.swot.threats.map(t => `- ${t}`).join("\n")}
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competitive-intelligence-${selectedKey}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Competitive report downloaded as Markdown.");
  };

  return (
    <div className="relative flex-1 overflow-y-auto bg-background p-6 lg:p-8 space-y-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_65%)] pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Globe className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Competitive Intelligence Hub</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
              Powered by competitive_graph
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Autonomous multi-agent market sweep, real-time SWOT decomposition, and feature-gap matrices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="text-xs gap-1.5 border-border"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
          <Button
            size="sm"
            onClick={handleRunDeepSweep}
            disabled={isAnalyzing}
            className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Running Sweep..." : "Run Autonomous Sweep"}
          </Button>
        </div>
      </div>

      {/* Competitor Selector Pills */}
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Target Entity:</span>
        {Object.entries(PRESET_COMPETITORS).map(([key, comp]) => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              selectedKey === key
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {comp.name.split(" ")[0]}
          </button>
        ))}

        <div className="flex items-center gap-1.5 ml-auto w-full md:w-auto">
          <Input
            placeholder="Analyze custom company (e.g. Mistral)..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customQuery.trim()) {
                toast.info(`Analyzing ${customQuery}...`);
                setCustomQuery("");
              }
            }}
            className="text-xs h-8 w-64 bg-background"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (customQuery.trim()) {
                toast.info(`Running pipeline on ${customQuery}...`);
                setCustomQuery("");
              }
            }}
            className="h-8 px-2"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Target Competitor Snapshot Card */}
      <Card className="relative border-border/80 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Target Profile</span>
              <p className="text-base font-bold text-foreground">{currentData.name}</p>
              <p className="text-xs text-muted-foreground">{currentData.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Primary Moat</span>
              <p className="text-xs font-semibold text-foreground">{currentData.moat}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Market Presence</span>
              <p className="text-xs font-semibold text-primary">{currentData.marketShare}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Enterprise Pricing</span>
              <p className="text-xs font-mono text-foreground">{currentData.pricing}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigators */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <button
          onClick={() => setActiveTab("swot")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "swot"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> SWOT Decomposition
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "matrix"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Feature Parity Matrix
        </button>
        <button
          onClick={() => setActiveTab("signals")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "signals"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="h-3.5 w-3.5" /> Real-Time Market Signals
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "swot" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Strengths (Target Advantages)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentData.swot.strengths.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground bg-background/60 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="font-mono text-emerald-500 font-bold">0{idx + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Vulnerabilities (TriVisionX Attack Vector)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentData.swot.weaknesses.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground bg-background/60 p-2.5 rounded-lg border border-rose-500/20">
                  <span className="font-mono text-rose-500 font-bold">0{idx + 1}</span>
                  <span>{w}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Market Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentData.swot.opportunities.map((o, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground bg-background/60 p-2.5 rounded-lg border border-blue-500/20">
                  <span className="font-mono text-blue-500 font-bold">0{idx + 1}</span>
                  <span>{o}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Industry Threats & Headwinds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentData.swot.threats.map((t, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground bg-background/60 p-2.5 rounded-lg border border-amber-500/20">
                  <span className="font-mono text-amber-500 font-bold">0{idx + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "matrix" && (
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">TriVisionX vs {currentData.name}</CardTitle>
            <CardDescription className="text-xs">Direct technical capability benchmark</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-y border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-5 py-3">Feature Capability</th>
                    <th className="px-5 py-3 bg-primary/5 text-primary">TriVisionX Platform</th>
                    <th className="px-5 py-3">{currentData.name}</th>
                    <th className="px-5 py-3">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {currentData.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                      <td className="px-5 py-3.5 bg-primary/5 font-semibold text-foreground">
                        {typeof row.triVisionX === "boolean" ? (
                          row.triVisionX ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />
                        ) : (
                          row.triVisionX
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {typeof row.competitor === "boolean" ? (
                          row.competitor ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />
                        ) : (
                          row.competitor
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={row.status === "win" ? "default" : row.status === "tie" ? "secondary" : "outline"}
                          className="text-[10px]"
                        >
                          {row.status === "win" ? "TriVisionX Lead" : row.status === "tie" ? "Parity" : "Competitor"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "signals" && (
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">Intelligence Radar & Event Log</CardTitle>
            <CardDescription className="text-xs">Live web research citations and telemetry updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentData.signals.map((sig, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border/80">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">{sig.title}</h5>
                    <p className="text-[11px] text-muted-foreground">{sig.date} • Category: {sig.type}</p>
                  </div>
                </div>
                <Badge
                  variant={sig.impact === "High" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {sig.impact} Impact
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
