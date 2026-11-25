"use client";

import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  Cpu,
  Database,
  FileText,
  Zap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  subtitle: string;
}

function MetricCard({ title, value, change, isPositive, icon, subtitle }: MetricCardProps) {
  return (
    <Card className="dashboard-3d-card dashboard-3d-card-interactive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tight text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
              isPositive
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {change}
            <ArrowUpRight className="w-3 h-3" />
          </span>
          <span className="text-muted-foreground font-mono text-[11px] truncate">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const agentStats = [
  { name: "Research Agent", count: "4,821", share: 38, color: "bg-blue-500" },
  { name: "Coding Agent", count: "3,119", share: 25, color: "bg-emerald-500" },
  { name: "Data Analysis Agent", count: "2,284", share: 18, color: "bg-amber-500" },
  { name: "Competitive Agent", count: "1,270", share: 10, color: "bg-violet-500" },
  { name: "Summary & Technical", count: "1,142", share: 9, color: "bg-rose-500" },
];

const recentLogs = [
  { id: "LOG-9142", query: "Autonomous multi-agent swarms with LangGraph", agent: "Research", time: "2 min ago", status: "Success", latency: "1.8s" },
  { id: "LOG-9141", query: "Evaluate and correct AST sandbox code execution", agent: "Coding", time: "8 min ago", status: "Success", latency: "2.4s" },
  { id: "LOG-9140", query: "Pinecone vector retrieval MMR similarity search", agent: "Retrieval", time: "14 min ago", status: "Success", latency: "0.9s" },
  { id: "LOG-9139", query: "PDF invoice tabular extraction with Vision OCR", agent: "Data", time: "26 min ago", status: "Success", latency: "3.1s" },
  { id: "LOG-9138", query: "Weekly competitive intelligence market breakdown", agent: "Competitive", time: "42 min ago", status: "Success", latency: "4.2s" },
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time telemetry, agent orchestration metrics, and Pinecone vector usage.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? "default" : "ghost"}
              className="h-7 text-xs px-3 rounded-lg"
              onClick={() => setTimeRange(range)}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Invocations"
          value="12,636"
          change="+18.4%"
          isPositive={true}
          icon={<Zap className="w-4 h-4" />}
          subtitle="vs. prior period"
        />
        <MetricCard
          title="Documents Ingested"
          value="1,492"
          change="+12.1%"
          isPositive={true}
          icon={<FileText className="w-4 h-4" />}
          subtitle="Pinecone synced"
        />
        <MetricCard
          title="Tokens Processed"
          value="48.2M"
          change="+24.6%"
          isPositive={true}
          icon={<Cpu className="w-4 h-4" />}
          subtitle="Across all LLMs"
        />
        <MetricCard
          title="Avg Pipeline Latency"
          value="1.92s"
          change="-8.3%"
          isPositive={true}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Optimal response rate"
        />
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Distribution */}
        <Card className="dashboard-3d-card lg:col-span-1">
          <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Agent Workload Distribution
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                5 Graphs
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Invocation share by specialized subgraph.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {agentStats.map((agent) => (
              <div key={agent.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{agent.name}</span>
                  <span className="font-mono text-muted-foreground">{agent.count} ({agent.share}%)</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${agent.color}`}
                    style={{ width: `${agent.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vector Memory & Pinecone Status */}
        <Card className="dashboard-3d-card lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Recent Agent Pipeline Executions
              </CardTitle>
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live streaming
              </span>
            </div>
            <CardDescription className="text-xs">
              Audit log of real-time multi-agent graph executions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono">
                    <th className="pb-2.5 font-medium">Trace ID</th>
                    <th className="pb-2.5 font-medium">Query</th>
                    <th className="pb-2.5 font-medium">Agent</th>
                    <th className="pb-2.5 font-medium">Latency</th>
                    <th className="pb-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 text-primary">{log.id}</td>
                      <td className="py-2.5 text-foreground truncate max-w-[200px] font-sans">
                        {log.query}
                      </td>
                      <td className="py-2.5 text-muted-foreground">{log.agent}</td>
                      <td className="py-2.5 text-muted-foreground">{log.latency}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
