"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  FileText,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

interface MetricCardProps {
  title: string;
  value: string;
  badgeText: string;
  isPositive: boolean;
  icon: React.ReactNode;
  subtitle: string;
}

function MetricCard({ title, value, badgeText, isPositive, icon, subtitle }: MetricCardProps) {
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
            {badgeText}
          </span>
          <span className="text-muted-foreground font-mono text-[11px] truncate">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCompactNumber(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return String(val);
}

const BAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const isDemo = localStorage.getItem("is_demo") === "true";
      if (!token || token === "demo_guest_token" || isDemo) {
        setStats(null);
        setAuditLogs([]);
        setTelemetryLogs([]);
        setDocumentsCount(0);
        return;
      }

      const [statsRes, logsRes, docsRes, telRes] = await Promise.all([
        fetch(`${API_BASE_URL}/brain/telemetry/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/audit-logs?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_BASE_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_BASE_URL}/brain/telemetry?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (logsRes && logsRes.ok) {
        const logJson = await logsRes.json();
        setAuditLogs(logJson.audit_logs || []);
      }
      if (docsRes && docsRes.ok) {
        const docs = await docsRes.json();
        setDocumentsCount(Array.isArray(docs) ? docs.length : 0);
      }
      if (telRes && telRes.ok) {
        const tel = await telRes.json();
        setTelemetryLogs(Array.isArray(tel) ? tel : []);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const windowCutoffMs = useMemo(() => {
    const now = Date.now();
    if (timeRange === "24h") return now - 24 * 60 * 60 * 1000;
    if (timeRange === "7d") return now - 7 * 24 * 60 * 60 * 1000;
    return now - 30 * 24 * 60 * 60 * 1000;
  }, [timeRange]);

  const filteredAuditLogs = useMemo(
    () =>
      auditLogs.filter((l) => {
        if (!l.timestamp) return true;
        const ts = Date.parse(l.timestamp);
        return Number.isNaN(ts) || ts >= windowCutoffMs;
      }),
    [auditLogs, windowCutoffMs]
  );

  const filteredTelemetry = useMemo(
    () =>
      telemetryLogs.filter((t) => {
        const raw = t.timestamp || t.created_at;
        if (!raw) return true;
        const ts = Date.parse(raw);
        return Number.isNaN(ts) || ts >= windowCutoffMs;
      }),
    [telemetryLogs, windowCutoffMs]
  );

  const agentStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of filteredAuditLogs) {
      const key = `${log.workflow_type || log.mode || "research"}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((acc, [, v]) => acc + v, 0);
    return entries.slice(0, 5).map(([name, count], idx) => ({
      name: `${name.charAt(0).toUpperCase()}${name.slice(1)} Workflow`,
      count: String(count),
      share: total > 0 ? Math.round((count / total) * 100) : 0,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    }));
  }, [filteredAuditLogs]);

  const totalTokensWindow = filteredTelemetry.reduce(
    (sum, t) => sum + Number(t.tokensIn || 0) + Number(t.tokensOut || 0),
    0
  );
  const avgLatencyWindow =
    filteredTelemetry.length > 0
      ? filteredTelemetry.reduce((sum, t) => sum + Number(t.latency || 0), 0) / filteredTelemetry.length
      : Number(stats?.avgLatency || 0);
  const totalInvocations = filteredAuditLogs.length || filteredTelemetry.length;
  const successRateDisplay =
    typeof stats?.successRate === "number" ? `${stats.successRate}%` : "N/A";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Live telemetry, audit execution history, and indexed document counts from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Executions (Window)"
          value={String(totalInvocations)}
          badgeText={successRateDisplay}
          isPositive={true}
          icon={<Zap className="w-4 h-4" />}
          subtitle={`overall success (${timeRange})`}
        />
        <MetricCard
          title="Documents Indexed"
          value={String(documentsCount)}
          badgeText="MongoDB + Pinecone"
          isPositive={true}
          icon={<FileText className="w-4 h-4" />}
          subtitle="user namespace files"
        />
        <MetricCard
          title="Tokens Processed"
          value={formatCompactNumber(totalTokensWindow || Number(stats?.totalTokens || 0))}
          badgeText={`$${Number(stats?.totalCost || 0).toFixed(4)}`}
          isPositive={true}
          icon={<Cpu className="w-4 h-4" />}
          subtitle={`est. cost (${timeRange})`}
        />
        <MetricCard
          title="Avg Model Latency"
          value={avgLatencyWindow > 0 ? `${(avgLatencyWindow / 1000).toFixed(2)}s` : "0.00s"}
          badgeText={`${Number(stats?.cacheHitRate ?? 0)}% cache`}
          isPositive={true}
          icon={<Clock className="w-4 h-4" />}
          subtitle="measured TTFT / run"
        />
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Distribution */}
        <Card className="dashboard-3d-card lg:col-span-1">
          <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Workflow Distribution
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                {agentStats.length} Active
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Share across recorded audit executions ({timeRange}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {agentStats.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center font-mono">
                No workflow runs recorded in the selected window yet.
              </p>
            ) : (
              agentStats.map((agent) => (
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Executions */}
        <Card className="dashboard-3d-card lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Recent Agent Pipeline Executions
              </CardTitle>
              <span className="text-xs text-muted-foreground font-mono">
                MongoDB audit_logs
              </span>
            </div>
            <CardDescription className="text-xs">
              Audited multi-agent and quick-mode queries for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono">
                    <th className="pb-2.5 font-medium">Audit ID</th>
                    <th className="pb-2.5 font-medium">Query</th>
                    <th className="pb-2.5 font-medium">Workflow</th>
                    <th className="pb-2.5 font-medium">Provider / Model</th>
                    <th className="pb-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No audited queries recorded in this time window.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.slice(0, 8).map((log) => {
                      const ok = log.status === "success";
                      return (
                        <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 text-primary truncate max-w-[90px]">{log.id}</td>
                          <td className="py-2.5 text-foreground truncate max-w-[200px] font-sans">
                            {log.query}
                          </td>
                          <td className="py-2.5 text-muted-foreground">{log.workflow_type || log.mode || "research"}</td>
                          <td className="py-2.5 text-muted-foreground truncate max-w-[140px]">
                            {log.provider || "default"}/{log.model || "default"}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className={`inline-flex items-center gap-1 text-[11px] ${ok ? "text-green-500" : "text-rose-500"}`}>
                              {ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {log.status || "unknown"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
