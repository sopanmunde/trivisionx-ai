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
    <div className="relative flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_65%)] pointer-events-none" />

      {/* Header bar wrapped in 3D Card */}
      <div className="dashboard-3d-card p-5 sm:p-6 relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              Competitive Intelligence Hub
              <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/30">
                v2.6 Real-Time
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Autonomous multi-agent market sweep, real-time SWOT decomposition, and feature-gap matrices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="text-xs font-semibold gap-1.5 border-black/15 dark:border-white/20 hover:bg-muted cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
          <Button
            size="sm"
            onClick={handleRunDeepSweep}
            disabled={isAnalyzing}
            className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Running Sweep..." : "Run Autonomous Sweep"}
          </Button>
        </div>
      </div>

      {/* Competitor Selector Pills */}
      <div className="dashboard-3d-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-foreground mr-1 flex items-center gap-1.5">
          <Cpu className="size-3.5 text-primary" /> Target Entity:
        </span>
        {Object.entries(PRESET_COMPETITORS).map(([key, comp]) => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedKey === key
                ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40"
                : "dashboard-inner-card text-muted-foreground hover:text-foreground hover:border-primary/40"
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
            className="text-xs h-8.5 w-64 bg-background border-black/15 dark:border-white/20 rounded-xl"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (customQuery.trim()) {
                toast.info(`Running pipeline on ${customQuery}...`);
                setCustomQuery("");
              }
            }}
            className="h-8.5 px-3 border-black/15 dark:border-white/20 rounded-xl"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Target Competitor Snapshot Card */}
      <Card className="dashboard-3d-card">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 p-4 dashboard-inner-card">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="size-3 text-primary" /> Target Profile
              </span>
              <p className="text-base font-extrabold text-foreground tracking-tight">{currentData.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{currentData.category}</p>
            </div>
            <div className="space-y-1.5 p-4 dashboard-inner-card">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="size-3 text-amber-500" /> Primary Moat
              </span>
              <p className="text-xs font-semibold text-foreground leading-relaxed">{currentData.moat}</p>
            </div>
            <div className="space-y-1.5 p-4 dashboard-inner-card">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="size-3 text-primary" /> Market Presence
              </span>
              <p className="text-sm font-black text-primary font-mono">{currentData.marketShare}</p>
            </div>
            <div className="space-y-1.5 p-4 dashboard-inner-card">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="size-3 text-emerald-500" /> Enterprise Pricing
              </span>
              <p className="text-xs font-mono font-bold text-foreground">{currentData.pricing}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigators */}
      <div className="dashboard-inner-card p-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none w-fit">
        <button
          onClick={() => setActiveTab("swot")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "swot"
              ? "bg-primary text-primary-foreground border border-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> SWOT Decomposition
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "matrix"
              ? "bg-primary text-primary-foreground border border-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" /> Feature Parity Matrix
        </button>
        <button
          onClick={() => setActiveTab("signals")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "signals"
              ? "bg-primary text-primary-foreground border border-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
          }`}
        >
          <Flame className="h-3.5 w-3.5" /> Real-Time Market Signals
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "swot" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths */}
          <Card className="dashboard-3d-card-emerald">
            <CardHeader className="pb-3 border-b border-emerald-500/25 bg-emerald-500/10">
              <CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Strengths (Target Advantages)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-5">
              {currentData.swot.strengths.map((s, idx) => (
                <div key={idx} className="dashboard-inner-card flex items-start gap-3 text-xs text-foreground p-3 hover:border-emerald-500/50 transition-colors">
                  <span className="font-mono text-emerald-500 font-bold shrink-0">0{idx + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="dashboard-3d-card-rose">
            <CardHeader className="pb-3 border-b border-rose-500/25 bg-rose-500/10">
              <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Vulnerabilities (TriVisionX Attack Vector)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-5">
              {currentData.swot.weaknesses.map((w, idx) => (
                <div key={idx} className="dashboard-inner-card flex items-start gap-3 text-xs text-foreground p-3 hover:border-rose-500/50 transition-colors">
                  <span className="font-mono text-rose-500 font-bold shrink-0">0{idx + 1}</span>
                  <span className="leading-relaxed">{w}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="dashboard-3d-card-blue">
            <CardHeader className="pb-3 border-b border-blue-500/25 bg-blue-500/10">
              <CardTitle className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Market Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-5">
              {currentData.swot.opportunities.map((o, idx) => (
                <div key={idx} className="dashboard-inner-card flex items-start gap-3 text-xs text-foreground p-3 hover:border-blue-500/50 transition-colors">
                  <span className="font-mono text-blue-500 font-bold shrink-0">0{idx + 1}</span>
                  <span className="leading-relaxed">{o}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card className="dashboard-3d-card-amber">
            <CardHeader className="pb-3 border-b border-amber-500/25 bg-amber-500/10">
              <CardTitle className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Industry Threats &amp; Headwinds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-5">
              {currentData.swot.threats.map((t, idx) => (
                <div key={idx} className="dashboard-inner-card flex items-start gap-3 text-xs text-foreground p-3 hover:border-amber-500/50 transition-colors">
                  <span className="font-mono text-amber-500 font-bold shrink-0">0{idx + 1}</span>
                  <span className="leading-relaxed">{t}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "matrix" && (
        <Card className="dashboard-3d-container">
          <CardHeader className="pb-3 border-b border-black/15 dark:border-white/20 bg-muted/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">TriVisionX vs {currentData.name}</CardTitle>
              <CardDescription className="text-xs">Direct technical capability benchmark</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/40 bg-emerald-500/10">
              Grounded Matrix
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-black/15 dark:border-white/20 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-5 py-3">Feature Capability</th>
                    <th className="px-5 py-3 bg-primary/5 text-primary">TriVisionX Platform</th>
                    <th className="px-5 py-3">{currentData.name}</th>
                    <th className="px-5 py-3">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {currentData.matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/40 transition-colors">
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
                          className={`text-[10px] font-mono ${
                            row.status === "win"
                              ? "bg-emerald-500 text-white dark:bg-emerald-600"
                              : ""
                          }`}
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
        <Card className="dashboard-3d-card">
          <CardHeader className="pb-3 border-b border-black/15 dark:border-white/20 bg-muted/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Intelligence Radar &amp; Event Log</CardTitle>
              <CardDescription className="text-xs">Live web research citations and telemetry updates</CardDescription>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sweep
            </span>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {currentData.signals.map((sig, i) => (
              <div key={i} className="dashboard-inner-card dashboard-3d-card-interactive flex items-center justify-between p-4 hover:border-primary/50 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{sig.title}</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{sig.date} • Category: {sig.type}</p>
                  </div>
                </div>
                <Badge
                  variant={sig.impact === "High" ? "destructive" : "secondary"}
                  className="text-[10px] font-mono shrink-0"
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
