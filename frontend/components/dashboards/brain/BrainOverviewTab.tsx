"use client";

import React from "react";
import {
  Sparkles,
  Terminal,
  Activity,
  Sliders,
  Send,
  RefreshCw,
  Clock,
  Zap,
  Gauge,
  Layers,
  Award,
  ChevronRight,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ModelMetric,
  MainTabType,
} from "./types";

interface ProviderShareItem {
  id: string;
  name: string;
  tokens: number;
  percentage: number;
}

interface WeeklyTokenItem {
  date?: string;
  day: string;
  tokens: number;
  cost?: number;
  requests?: number;
}

interface BrainOverviewTabProps {
  liveTtft: number;
  liveTokensPerSec: number;
  liveReqPerMin: number;
  liveVectorLatency: number;
  totalTokens?: number;
  successRate?: number;
  cacheHitRate?: number;
  providerShare?: ProviderShareItem[];
  weeklyTokens?: WeeklyTokenItem[];
  fastestComparedModel?: ModelMetric;
  cheapestComparedModel?: ModelMetric;
  highestQualityComparedModel?: ModelMetric;
  setMainTab: (tab: MainTabType) => void;
}

function formatCompactTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function BrainOverviewTab({
  liveTtft,
  liveTokensPerSec,
  liveReqPerMin,
  liveVectorLatency,
  totalTokens = 0,
  successRate = 100,
  cacheHitRate = 0,
  providerShare = [],
  weeklyTokens = [],
  fastestComparedModel,
  cheapestComparedModel,
  highestQualityComparedModel,
  setMainTab,
}: BrainOverviewTabProps) {
  const daysFallback: WeeklyTokenItem[] = weeklyTokens.length > 0
    ? weeklyTokens
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, tokens: 0 }));
  const maxWeeklyTokens = Math.max(1, ...daysFallback.map((x) => x.tokens || 0));
  const shareColors = ["bg-emerald-500", "bg-purple-500", "bg-blue-500", "bg-amber-500", "bg-cyan-500"];
  const textColors = ["text-emerald-400", "text-purple-400", "text-blue-400", "text-amber-400", "text-cyan-400"];
  return (
    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-6 bg-background/50">
      {/* Banner: Command Center Welcome & Quick Actions */}
      <div className="dashboard-3d-container p-6 sm:p-7">
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold px-2.5 py-0.5">
                UNIFIED COMMAND CENTER
              </Badge>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-xs font-bold text-emerald-400">All Engines Operational</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              TriVisionX Brain Intelligence Command Center
            </h2>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
              Orchestrate active AI models, monitor live token streaming, and evaluate benchmarks from a single unified workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMainTab("telemetry")}
              className="h-10 text-xs font-bold gap-2 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-xs cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Activity className="size-4" /> Open Live Telemetry
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMainTab("configure")}
              className="h-10 text-xs font-bold gap-2 border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 shadow-xs cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Sliders className="size-4" /> Configs
            </Button>
          </div>
        </div>
      </div>

      {/* Section 1.5: Real-Time Telemetry Live Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-3d-card dashboard-3d-card-interactive p-4 flex items-center justify-between hover:border-emerald-500/40" onClick={() => setMainTab("telemetry")}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-400" /> Active Latency (TTFT)
            </p>
            <p className="text-2xl font-black font-mono text-foreground">{liveTtft} <span className="text-xs font-semibold text-muted-foreground">ms</span></p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold font-mono">Fast</Badge>
        </div>

        <div className="dashboard-3d-card dashboard-3d-card-interactive p-4 flex items-center justify-between hover:border-blue-500/40" onClick={() => setMainTab("telemetry")}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Zap className="size-3.5 text-blue-400" /> Token Stream Speed
            </p>
            <p className="text-2xl font-black font-mono text-foreground">{liveTokensPerSec} <span className="text-xs font-semibold text-muted-foreground">tok/s</span></p>
          </div>
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px] font-bold font-mono">Realtime</Badge>
        </div>

        <div className="dashboard-3d-card dashboard-3d-card-interactive p-4 flex items-center justify-between hover:border-indigo-500/40" onClick={() => setMainTab("telemetry")}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Gauge className="size-3.5 text-indigo-400" /> Active Throughput
            </p>
            <p className="text-2xl font-black font-mono text-foreground">{liveReqPerMin} <span className="text-xs font-semibold text-muted-foreground">req/min</span></p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold font-mono">{successRate.toFixed(1)}%</Badge>
        </div>

        <div className="dashboard-3d-card dashboard-3d-card-interactive p-4 flex items-center justify-between hover:border-purple-500/40" onClick={() => setMainTab("telemetry")}>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Layers className="size-3.5 text-purple-400" /> Vector RAG Search
            </p>
            <p className="text-2xl font-black font-mono text-foreground">{liveVectorLatency} <span className="text-xs font-semibold text-muted-foreground">ms</span></p>
          </div>
          <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px] font-bold font-mono">{cacheHitRate.toFixed(1)}% Cache</Badge>
        </div>
      </div>

      {/* Section 2: Performance Matrix Winners & Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Head-to-Head Winner Badges */}
        <div className="dashboard-3d-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-foreground">Engine Benchmark Highlights</h3>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-xs p-0 text-muted-foreground hover:text-foreground font-semibold cursor-pointer" onClick={() => setMainTab("matrix")}>
              Full Matrix <ChevronRight className="size-3" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 dashboard-inner-card flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fastest Engine</p>
                <p className="text-xs font-extrabold font-mono text-foreground mt-0.5">{fastestComparedModel?.name}</p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-mono font-bold">
                {fastestComparedModel?.throughput} t/s
              </Badge>
            </div>

            <div className="p-3.5 dashboard-inner-card flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Most Cost Effective</p>
                <p className="text-xs font-extrabold font-mono text-foreground mt-0.5">{cheapestComparedModel?.name}</p>
              </div>
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs font-mono font-bold">
                ${cheapestComparedModel?.costIn.toFixed(2)} / 1M
              </Badge>
            </div>

            <div className="p-3.5 dashboard-inner-card flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Highest Accuracy</p>
                <p className="text-xs font-extrabold font-mono text-foreground mt-0.5">{highestQualityComparedModel?.name}</p>
              </div>
              <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs font-mono font-bold">
                {highestQualityComparedModel?.mmlu}% MMLU
              </Badge>
            </div>
          </div>
        </div>

        {/* Provider Allocation & Token Load Overview (2 Cols) */}
        <div className="dashboard-3d-card lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <LineChart className="size-4 text-indigo-400" />
              <h3 className="text-sm font-extrabold text-foreground">Weekly Token Usage &amp; Distribution Overview</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground font-bold">
              {formatCompactTokens(totalTokens)} Cumulative Tokens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Weekly Token Load Bars */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">Weekly Token Load Timeline</p>
              <div className="h-36 flex items-end justify-between gap-1.5 pt-2">
                {daysFallback.map((d) => {
                  const percent = d.tokens > 0 ? Math.max(8, Math.round((d.tokens / maxWeeklyTokens) * 100)) : 4;
                  return (
                    <div key={d.date || d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground border border-border text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                        {d.tokens.toLocaleString()} tok
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-sm transition-all duration-200 group-hover:bg-emerald-400"
                        style={{ height: `${percent}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Provider Share */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground">Active Provider Share Distribution</p>
              {providerShare.length > 0 ? (
                <>
                  <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-muted/60 border border-border/60 p-0.5">
                    {providerShare.slice(0, 5).map((item, idx) => (
                      <div
                        key={item.id}
                        className={`h-full ${shareColors[idx % shareColors.length]}`}
                        style={{ width: `${item.percentage}%` }}
                        title={`${item.name} (${item.percentage}%)`}
                      />
                    ))}
                  </div>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    {providerShare.slice(0, 5).map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-foreground font-semibold">
                          <span className={`size-2.5 rounded-full ${shareColors[idx % shareColors.length]}`} /> {item.name}
                        </span>
                        <span className={`font-bold ${textColors[idx % textColors.length]}`}>{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                  No metered token traffic recorded yet. Ping or run a model query to populate distribution.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
