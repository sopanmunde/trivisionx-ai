"use client";

import React, { useState } from "react";
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
  Cpu,
  BarChart3,
  Flame,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

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
    type: string;
  }[];
  citations?: { title?: string; url?: string; snippet?: string }[];
  rawMarkdown?: string;
}

const QUICK_TARGETS = [
  { key: "openai", label: "OpenAI Enterprise" },
  { key: "perplexity", label: "Perplexity AI" },
  { key: "anthropic", label: "Anthropic Claude" },
  { key: "google-gemini", label: "Google Gemini" },
];

export function CompetitiveIntelligenceDashboard() {
  const [selectedTarget, setSelectedTarget] = useState<string>("OpenAI Enterprise");
  const [analyses, setAnalyses] = useState<Record<string, CompetitorData>>({});
  const [customQuery, setCustomQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"swot" | "matrix" | "signals">("swot");

  const currentData = analyses[selectedTarget] || null;

  const runCompetitiveAnalysis = async (targetName: string) => {
    const cleanTarget = targetName.trim();
    if (!cleanTarget || isAnalyzing) return;

    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      toast.error("Sign in with an account to run live competitive intelligence analysis.");
      return;
    }

    setSelectedTarget(cleanTarget);
    setIsAnalyzing(true);
    toast.info(`Invoking competitive_graph pipeline for ${cleanTarget}...`);

    try {
      const prompt = `Conduct an objective, grounded competitive intelligence analysis comparing TriVisionX AI (a LangGraph multi-agent research platform with Pinecone RAG, MongoDB audit logs, and BYOK model routing) against "${cleanTarget}".

Return ONLY a valid JSON object (no markdown fences outside JSON) with keys:
{
  "name": "${cleanTarget}",
  "category": "short category label",
  "moat": "primary architectural or ecosystem moat",
  "marketShare": "honest qualitative market positioning summary (do not invent exact percentages unless verified from web sources)",
  "pricing": "publicly known pricing tier summary or 'Enterprise custom pricing'",
  "swot": {
    "strengths": ["3 concise points"],
    "weaknesses": ["3 concise points"],
    "opportunities": ["2-3 concise points for TriVisionX"],
    "threats": ["2-3 concise industry headwinds"]
  },
  "matrix": [
    { "feature": "Multi-Agent LangGraph Orchestration", "triVisionX": true, "competitor": false, "status": "win" }
  ],
  "signals": [
    { "date": "YYYY-MM or Recent", "title": "signal headline from web search or public docs", "impact": "High", "type": "Release" }
  ]
}`;

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          msg: prompt,
          mode: "agent",
          workflow_type: "competitive",
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Analysis endpoint returned HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let rawOutput = "";
      let collectedCitations: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data: ")) continue;
          let evt: any;
          try {
            evt = JSON.parse(trimmed.slice(6));
          } catch {
            continue;
          }
          if (evt.error) throw new Error(evt.error);
          if (evt.type === "token" && evt.data) rawOutput += evt.data;
          if (evt.type === "citations" && Array.isArray(evt.data)) collectedCitations = evt.data;
          if (evt.type === "complete" && Array.isArray(evt.data?.citations)) {
            collectedCitations = evt.data.citations;
          }
        }
      }

      let parsed: CompetitorData | null = null;
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const obj = JSON.parse(jsonMatch[0]);
          parsed = {
            name: obj.name || cleanTarget,
            category: obj.category || "AI Platform",
            moat: obj.moat || "See full analysis output",
            marketShare: obj.marketShare || "Evaluated via agent pipeline",
            pricing: obj.pricing || "See provider pricing",
            swot: {
              strengths: Array.isArray(obj.swot?.strengths) ? obj.swot.strengths : [],
              weaknesses: Array.isArray(obj.swot?.weaknesses) ? obj.swot.weaknesses : [],
              opportunities: Array.isArray(obj.swot?.opportunities) ? obj.swot.opportunities : [],
              threats: Array.isArray(obj.swot?.threats) ? obj.swot.threats : [],
            },
            matrix: Array.isArray(obj.matrix) ? obj.matrix : [],
            signals: Array.isArray(obj.signals) ? obj.signals : [],
            citations: collectedCitations,
            rawMarkdown: rawOutput,
          };
        } catch {
          parsed = null;
        }
      }

      if (!parsed) {
        if (!rawOutput.trim()) {
          throw new Error("No output returned by competitive agent. Check active LLM API keys in Brain Dashboard.");
        }
        parsed = {
          name: cleanTarget,
          category: "Agent Analysis Output",
          moat: "Live synthesis completed",
          marketShare: "See qualitative report",
          pricing: "Public provider tiers",
          swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
          matrix: [],
          signals: [],
          citations: collectedCitations,
          rawMarkdown: rawOutput,
        };
      }

      setAnalyses((prev) => ({ ...prev, [cleanTarget]: parsed! }));
      toast.success(
        `Competitive analysis completed for ${cleanTarget}${collectedCitations.length ? ` (${collectedCitations.length} citations)` : ""}.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Competitive analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunDeepSweep = () => {
    runCompetitiveAnalysis(selectedTarget);
  };

  const handleExportReport = () => {
    if (!currentData) {
      toast.error("Run an analysis first to export a competitive report.");
      return;
    }
    const reportText = `# TriVisionX Competitive Intelligence Report: ${currentData.name}
Generated: ${new Date().toLocaleDateString()}
Category: ${currentData.category}
Positioning: ${currentData.marketShare}
Pricing: ${currentData.pricing}

## Core Strengths:
${currentData.swot.strengths.map(s => `- ${s}`).join("\n") || "N/A"}

## Core Vulnerabilities / Weaknesses:
${currentData.swot.weaknesses.map(w => `- ${w}`).join("\n") || "N/A"}

## Strategic Opportunities for TriVisionX:
${currentData.swot.opportunities.map(o => `- ${o}`).join("\n") || "N/A"}

## Market Threats:
${currentData.swot.threats.map(t => `- ${t}`).join("\n") || "N/A"}
${currentData.rawMarkdown ? `\n## Raw Agent Synthesis\n${currentData.rawMarkdown}\n` : ""}
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competitive-intelligence-${currentData.name.toLowerCase().replace(/\s+/g, "-")}.md`;
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
                competitive_graph
              </Badge>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Invoke TriVisionX&apos;s competitive research pipeline to generate SWOT breakdowns, feature matrices, and live citations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            disabled={!currentData}
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
            {isAnalyzing ? "Running Pipeline..." : "Run Competitive Analysis"}
          </Button>
        </div>
      </div>

      {/* Competitor Selector Pills */}
      <div className="dashboard-3d-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-foreground mr-1 flex items-center gap-1.5">
          <Cpu className="size-3.5 text-primary" /> Target Entity:
        </span>
        {QUICK_TARGETS.map((target) => (
          <button
            key={target.key}
            onClick={() => setSelectedTarget(target.label)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedTarget === target.label
                ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/40"
                : "dashboard-inner-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {target.label}
          </button>
        ))}

        <div className="flex items-center gap-1.5 ml-auto w-full md:w-auto">
          <Input
            placeholder="Analyze custom company (e.g. Mistral)..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customQuery.trim()) {
                const target = customQuery.trim();
                setCustomQuery("");
                runCompetitiveAnalysis(target);
              }
            }}
            className="text-xs h-8.5 w-64 bg-background border-black/15 dark:border-white/20 rounded-xl"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={isAnalyzing || !customQuery.trim()}
            onClick={() => {
              if (customQuery.trim()) {
                const target = customQuery.trim();
                setCustomQuery("");
                runCompetitiveAnalysis(target);
              }
            }}
            className="h-8.5 px-3 border-black/15 dark:border-white/20 rounded-xl"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!currentData ? (
        <Card className="dashboard-3d-card">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <Sparkles className="h-8 w-8 text-primary opacity-80" />
            <h3 className="text-sm font-bold text-foreground">
              Ready to Analyze &ldquo;{selectedTarget}&rdquo;
            </h3>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Click <strong>Run Competitive Analysis</strong> above (or enter any custom company) to query the backend <code>competitive_graph</code> agent with your configured LLM key and live web tools.
            </p>
            <Button
              size="sm"
              onClick={handleRunDeepSweep}
              disabled={isAnalyzing}
              className="mt-2 text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Running Pipeline..." : `Analyze ${selectedTarget}`}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                    <TrendingUp className="size-3 text-primary" /> Market Positioning
                  </span>
                  <p className="text-xs font-bold text-primary font-mono leading-relaxed">{currentData.marketShare}</p>
                </div>
                <div className="space-y-1.5 p-4 dashboard-inner-card">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="size-3 text-emerald-500" /> Pricing Overview
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
              <Flame className="h-3.5 w-3.5" /> Signals &amp; Citations
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
                    <ShieldAlert className="h-4 w-4" /> Vulnerabilities (TriVisionX Opportunity)
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
                  <CardDescription className="text-xs">Generated capability comparison</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/40 bg-emerald-500/10">
                  Agent Matrix
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
                  <CardTitle className="text-sm font-bold text-foreground">Market Signals &amp; Source Citations</CardTitle>
                  <CardDescription className="text-xs">Signals extracted during competitive_graph run</CardDescription>
                </div>
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
                {currentData.citations && currentData.citations.length > 0 && (
                  <div className="pt-3 border-t border-border/60 space-y-2">
                    <p className="text-xs font-bold text-foreground">Grounded Citations ({currentData.citations.length})</p>
                    {currentData.citations.map((cit, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-mono text-primary">[{idx + 1}]</span>
                        <span className="truncate">{cit.title || cit.url || "Source"}</span>
                        {cit.url && /^https?:\/\//i.test(cit.url) && (
                          <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline shrink-0">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
