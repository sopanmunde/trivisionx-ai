"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Sparkles,
  Activity,
  Sliders,
  Terminal,
  Grid3X3,
  Scale,
  RefreshCw,
  Clock,
  Gauge,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { ExportModal } from "./ExportModal";
import {
  LLMProvider,
  ApiKey,
  ModelMetric,
  TelemetryLog,
  ProviderType,
  ProviderStatus,
  MainTabType,
  COMPARE_METRICS,
} from "./dashboards/brain/types";
import { BrainProviderSidebar } from "./dashboards/brain/BrainProviderSidebar";
import { BrainOverviewTab } from "./dashboards/brain/BrainOverviewTab";
import { BrainTelemetryTab } from "./dashboards/brain/BrainTelemetryTab";
import { BrainConfigTab } from "./dashboards/brain/BrainConfigTab";
import { BrainMatrixTab } from "./dashboards/brain/BrainMatrixTab";
import { BrainUsageSidebar } from "./dashboards/brain/BrainUsageSidebar";

export function BrainDashboard() {
  const [activeTab, setActiveTab] = useState<ProviderType>("cloud");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("openai");

  const [cloudProviders, setCloudProviders] = useState<LLMProvider[]>([]);
  const [localProviders, setLocalProviders] = useState<LLMProvider[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Main Tabs: overview | telemetry | configure | playground | matrix
  const [mainTab, setMainTab] = useState<MainTabType>("overview");

  // Real-Time Telemetry State
  const [telemetryLive, setTelemetryLive] = useState(true);
  const [telemetryInterval, setTelemetryInterval] = useState<number>(2);
  const [telemetryWindow, setTelemetryWindow] = useState<"1m" | "5m" | "1h" | "24h">("5m");

  const [liveTokensPerSec, setLiveTokensPerSec] = useState(0);
  const [liveTtft, setLiveTtft] = useState(0);
  const [liveP95, setLiveP95] = useState(0);
  const [liveReqPerMin, setLiveReqPerMin] = useState(0);
  const [liveVectorLatency, setLiveVectorLatency] = useState(0);
  const [totalTokensStat, setTotalTokensStat] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [providerShare, setProviderShare] = useState<any[]>([]);
  const [weeklyTokens, setWeeklyTokens] = useState<any[]>([]);

  const [telemetryStreamLogs, setTelemetryStreamLogs] = useState<TelemetryLog[]>([]);

  const [throughputGraph, setThroughputGraph] = useState<number[]>([]);

  const filterLogsByWindow = (logs: TelemetryLog[], win: "1m" | "5m" | "1h" | "24h") => {
    const windowMsMap = { "1m": 60_000, "5m": 300_000, "1h": 3_600_000, "24h": 86_400_000 };
    const cutoff = Date.now() - windowMsMap[win];
    return logs.filter((l: any) => {
      if (!l.created_at) return true;
      const t = Date.parse(l.created_at);
      return Number.isNaN(t) || t >= cutoff;
    });
  };

  // Live Real Telemetry Polling Loop (disabled in unauthenticated/demo sessions)
  useEffect(() => {
    if (!telemetryLive) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || token === "demo_guest_token" || localStorage.getItem("is_demo") === "true") return;

    const pollRealTelemetry = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resStats, resLogs] = await Promise.all([
          fetch(`${API_BASE_URL}/brain/telemetry/stats`, { headers }),
          fetch(`${API_BASE_URL}/brain/telemetry`, { headers })
        ]);

        if (resStats.ok) {
          const stats = await resStats.json();
          setLiveTokensPerSec(stats.liveTokensPerSec ?? 0);
          setLiveTtft(stats.liveTtft ?? 0);
          setLiveP95(stats.liveP95 ?? 0);
          setLiveReqPerMin(stats.liveReqPerMin ?? 0);
          setLiveVectorLatency(stats.liveVectorLatency ?? 0);
          setTotalTokensStat(stats.totalTokens ?? 0);
          setSuccessRate(stats.successRate ?? 100);
          setCacheHitRate(stats.cacheHitRate ?? 0);
          setProviderShare(Array.isArray(stats.providerShare) ? stats.providerShare : []);
          setWeeklyTokens(Array.isArray(stats.weeklyTokens) ? stats.weeklyTokens : []);
        }

        if (resLogs.ok) {
          const logs: TelemetryLog[] = await resLogs.json();
          if (Array.isArray(logs)) {
            const windowed = filterLogsByWindow(logs, telemetryWindow);
            setTelemetryStreamLogs(windowed);
            const graphPoints = windowed.slice(0, 15).reverse().map((l) => {
              if (l.latency && l.latency > 0 && l.tokensOut > 0) {
                return Math.round((l.tokensOut / l.latency) * 1000);
              }
              return 0;
            });
            setThroughputGraph(graphPoints);
          }
        }
      } catch (e) {
        console.error("Telemetry update failed:", e);
      }
    };

    pollRealTelemetry();
    const timer = setInterval(pollRealTelemetry, telemetryInterval * 1000);
    return () => clearInterval(timer);
  }, [telemetryLive, telemetryInterval, telemetryWindow]);

  // Advanced configurations
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [topP, setTopP] = useState<number>(0.9);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are an advanced AI assistant powered by TriVisionX.");

  // Benchmark speed states
  const [benchmarkStatus, setBenchmarkStatus] = useState<"idle" | "running" | "done">("idle");
  const [benchmarkSpeed, setBenchmarkSpeed] = useState(0);
  const [benchmarkLatency, setBenchmarkLatency] = useState(0);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);

  // Metrics Matrix State
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>(["gpt-4o", "claude-3-5-sonnet"]);
  const [matrixSortBy, setMatrixSortBy] = useState<keyof ModelMetric>("throughput");
  const [matrixSortOrder, setMatrixSortOrder] = useState<"asc" | "desc">("desc");

  // Key adding states
  const [addKeyMode, setAddKeyMode] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newKeyVal, setNewKeyVal] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [localEndpoint, setLocalEndpoint] = useState("");
  const [endpointEdited, setEndpointEdited] = useState(false);

  const allProviders = [...cloudProviders, ...localProviders];
  const listProviders = activeTab === "cloud" ? cloudProviders : localProviders;
  const provider = allProviders.find((p) => p.id === selectedProviderId) ?? allProviders[0] ?? {
    id: "openai",
    name: "OpenAI",
    type: "cloud",
    logo: "OA",
    description: "",
    models: ["gpt-4o"],
    status: "disconnected" as ProviderStatus,
    isActive: false,
    endpoint: "",
    usageTokens: 0,
    usageCost: 0,
    latency: 0,
    tokensPerSec: 0
  };
  const providerKeys = apiKeys.filter((k) => k.providerId === selectedProviderId);
  const activeProvider = allProviders.find((p) => p.isActive);

  const totalTokens = cloudProviders.reduce((a, p) => a + (p.usageTokens ?? 0), 0);
  const totalCost = cloudProviders.reduce((a, p) => a + (p.usageCost ?? 0), 0);
  const endpoint = endpointEdited ? localEndpoint : (provider?.endpoint ?? "");

  const fetchData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || token === "demo_guest_token" || localStorage.getItem("is_demo") === "true") {
        setIsLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [resProviders, resKeys, resTelemetry] = await Promise.all([
        fetch(`${API_BASE_URL}/brain/providers`, { headers }),
        fetch(`${API_BASE_URL}/brain/keys`, { headers }),
        fetch(`${API_BASE_URL}/brain/telemetry/stats`, { headers })
      ]);

      if (resProviders.ok) {
        const data = await resProviders.json();
        setCloudProviders(data.filter((p: any) => p.type === "cloud"));
        setLocalProviders(data.filter((p: any) => p.type === "local"));
      }
      if (resKeys.ok) {
        const data = await resKeys.json();
        setApiKeys(data);
      }
      if (resTelemetry.ok) {
        const stats = await resTelemetry.json();
        if (stats.recentLogs && stats.recentLogs.length > 0) {
          setTelemetryStreamLogs(stats.recentLogs);
        }
        setLiveTokensPerSec(stats.liveTokensPerSec ?? 0);
        setLiveTtft(stats.liveTtft ?? 0);
        setLiveP95(stats.liveP95 ?? 0);
        setLiveReqPerMin(stats.liveReqPerMin ?? 0);
        setLiveVectorLatency(stats.liveVectorLatency ?? 0);
        setTotalTokensStat(stats.totalTokens ?? 0);
        setSuccessRate(stats.successRate ?? 100);
        setCacheHitRate(stats.cacheHitRate ?? 0);
        setProviderShare(Array.isArray(stats.providerShare) ? stats.providerShare : []);
        setWeeklyTokens(Array.isArray(stats.weeklyTokens) ? stats.weeklyTokens : []);
      }
    } catch (e) {
      console.error("Failed to fetch brain configs", e);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Handle active provider selection
  const activateProvider = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };
      setCloudProviders((p) => p.map((x) => ({ ...x, isActive: x.id === id })));
      setLocalProviders((p) => p.map((x) => ({ ...x, isActive: x.id === id })));

      await Promise.all(allProviders.map(p =>
        fetch(`${API_BASE_URL}/brain/providers/${p.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ isActive: p.id === id })
        })
      ));
    } catch (e) {
      console.error("Failed to sync provider active state", e);
    }
  };

  // Real Connection Ping (persists any pending endpoint edit first)
  const testConnection = async (id: string) => {
    setTestingId(id);
    const setT = (p: LLMProvider) => p.id === id ? { ...p, status: "testing" as ProviderStatus } : p;
    setCloudProviders((p) => p.map(setT));
    setLocalProviders((p) => p.map(setT));

    try {
      const token = localStorage.getItem("token");
      if (endpointEdited && id === selectedProviderId && endpoint.trim()) {
        await fetch(`${API_BASE_URL}/brain/providers/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint: endpoint.trim() }),
        });
        setEndpointEdited(false);
      }

      const res = await fetch(`${API_BASE_URL}/brain/providers/${id}/ping`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      let status: ProviderStatus = "error";
      let latency = 0;

      if (res.ok) {
        const data = await res.json();
        if (data.status === "connected") {
          status = "connected";
          latency = data.latency;
          toast.success(`${allProviders.find(p => p.id === id)?.name || "Provider"} is connected! Latency: ${latency}ms`);
        } else {
          toast.error(`Connection check failed: ${data.detail || "Unknown error"}`);
        }
      } else {
        toast.error("Failed to contact the backend verification service.");
      }

      await fetch(`${API_BASE_URL}/brain/providers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, latency })
      });

      const setF = (p: LLMProvider) => p.id === id ? { ...p, status, latency } : p;
      setCloudProviders((p) => p.map(setF));
      setLocalProviders((p) => p.map(setF));
      fetchData();
    } catch (e) {
      console.error("Failed connection ping", e);
      toast.error("Connection failed.");

      const setErr = (p: LLMProvider) => p.id === id ? { ...p, status: "error" as ProviderStatus } : p;
      setCloudProviders((p) => p.map(setErr));
      setLocalProviders((p) => p.map(setErr));
      fetchData();
    } finally {
      setTestingId(null);
    }
  };

  // Real Performance Benchmark
  const runSpeedBenchmark = async () => {
    const id = provider.id;
    setBenchmarkStatus("running");
    setBenchmarkProgress(15);
    setBenchmarkSpeed(0);
    setBenchmarkLatency(0);

    const progressTimer = setInterval(() => {
      setBenchmarkProgress((prev) => (prev < 85 ? prev + Math.floor(Math.random() * 8) + 2 : prev));
    }, 150);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/brain/providers/${id}/benchmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      clearInterval(progressTimer);
      setBenchmarkProgress(100);

      if (res.ok) {
        const data = await res.json();
        const finalLatency = data.latency;
        const finalSpeed = data.tokensPerSec;

        setBenchmarkSpeed(finalSpeed);
        setBenchmarkLatency(finalLatency);
        setBenchmarkStatus("done");

        const updateP = (p: LLMProvider) => p.id === id ? { ...p, latency: finalLatency, tokensPerSec: finalSpeed } : p;
        setCloudProviders(c => c.map(updateP));
        setLocalProviders(l => l.map(updateP));
        toast.success(`Speed test complete: ${finalSpeed} tok/s at ${finalLatency}ms latency!`);
        fetchData();
      } else {
        const err = await res.json();
        const msg = typeof err.detail === "string" ? err.detail : typeof err.detail === "object" ? (err.detail.message || JSON.stringify(err.detail)) : err.message || "Server error";
        throw new Error(msg);
      }
    } catch (e: any) {
      clearInterval(progressTimer);
      setBenchmarkProgress(0);
      setBenchmarkStatus("idle");
      console.error("Benchmark failed", e);
      toast.error(e.message || "Benchmark failed. Ensure a valid API key is set.");
      fetchData();
    }
  };



  const saveKey = async () => {
    if (!newLabel.trim() || !newKeyVal.trim()) return;
    const payload = {
      providerId: selectedProviderId,
      label: newLabel.trim(),
      key: newKeyVal.trim(),
      isActive: true
    };
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/brain/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const createdKey = await res.json();
        setApiKeys((prev) => [...prev, createdKey]);
        setNewLabel("");
        setNewKeyVal("");
        setAddKeyMode(false);

        await fetch(`${API_BASE_URL}/brain/providers/${selectedProviderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: "connected" })
        });
        const setC = (p: LLMProvider) => p.id === selectedProviderId ? { ...p, status: "connected" as ProviderStatus } : p;
        setCloudProviders((p) => p.map(setC));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save key");
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/brain/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete key");
    }
  };

  const toggleKey = async (id: string) => {
    const target = apiKeys.find((k) => k.id === id);
    if (!target) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/brain/keys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !target.isActive })
      });
      if (res.ok) {
        const updatedKey = await res.json();
        setApiKeys((prev) => prev.map((k) => k.id === id ? updatedKey : k));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectProvider = (id: string, type: ProviderType) => {
    setSelectedProviderId(id);
    setActiveTab(type);
    setAddKeyMode(false);
    setEndpointEdited(false);
    const p = allProviders.find((x) => x.id === id);
    if (p) setSelectedModel(p.models[0]);
  };

  const toggleCompareId = (id: string) => {
    setSelectedCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSort = (field: keyof ModelMetric) => {
    if (matrixSortBy === field) {
      setMatrixSortOrder(matrixSortOrder === "asc" ? "desc" : "asc");
    } else {
      setMatrixSortBy(field);
      setMatrixSortOrder("desc");
    }
  };

  const sortedCompareMetrics = [...COMPARE_METRICS].sort((a, b) => {
    const valA = a[matrixSortBy];
    const valB = b[matrixSortBy];
    if (typeof valA === "number" && typeof valB === "number") {
      return matrixSortOrder === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  const selectedMetrics = COMPARE_METRICS.filter((x) => selectedCompareIds.includes(x.id));
  const fastestComparedModel = [...selectedMetrics].sort((a, b) => b.throughput - a.throughput)[0];
  const cheapestComparedModel = [...selectedMetrics].sort((a, b) => a.costIn - b.costIn)[0];
  const highestQualityComparedModel = [...selectedMetrics].sort((a, b) => b.mmlu - a.mmlu)[0];

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center h-full min-h-[500px] bg-background">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="size-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold">Loading brain configurations...</span>
        </div>
      </div>
    );
  }

  const workspaceModes: { id: MainTabType; label: string; icon: any; color: string }[] = [
    { id: "overview", label: "CMD Center", icon: Sparkles, color: "text-primary" },
    { id: "telemetry", label: "Tracking", icon: Activity, color: "text-emerald-400" },
    { id: "configure", label: "Config", icon: Sliders, color: "text-blue-400" },
    { id: "matrix", label: "Metrics", icon: Scale, color: "text-amber-400" },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col overflow-hidden bg-background p-3 sm:p-5 gap-3.5 sm:gap-4">
        {/* ── TOP HEADER BAR (3D Card) ────────────────────────────────────────────── */}
        <div className="dashboard-3d-card p-4 sm:p-5 shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 shadow-xs shrink-0">
                <Brain className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-foreground leading-none flex items-center gap-2 flex-wrap">
                  Brain Dashboard
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold py-0.5 px-2 bg-primary/15 text-primary border border-primary/25">
                    v2.6 Real-Time
                  </Badge>
                </h1>
                <p className="text-xs font-medium text-muted-foreground mt-1 hidden sm:block">LLM provider engine controls, security API keys, performance benchmarks &amp; real-time telemetry</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {activeProvider && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 shadow-2xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">Active Engine:</span>
                  <span className="text-xs font-extrabold text-foreground">{activeProvider.name}</span>
                  <Badge variant="outline" className="text-[9px] font-semibold h-4.5 px-1.5 border-emerald-500/40 text-emerald-400">
                    {activeProvider.type === "local" ? "Local" : "Cloud"}
                  </Badge>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExportOpen(true)}
                className="h-8 sm:h-9 text-xs font-bold gap-1.5 sm:gap-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 shadow-xs cursor-pointer"
              >
                <Plug className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:inline">Export &amp; Integrations Hub</span>
                <span className="inline xs:hidden sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── 3D WORKSPACE CONTAINER ──────────────────────────────────────── */}
        <div className="dashboard-3d-container flex flex-1 flex-col min-h-0 overflow-hidden relative">
          {/* UNIFIED TOP TAB NAVIGATION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-black/15 dark:border-white/20 bg-muted/30 shrink-0 gap-2">
            <div className="flex items-center gap-2">
              {mainTab === "overview" && <Sparkles className="size-4 text-primary animate-pulse" />}
              {mainTab === "telemetry" && <Activity className="size-4 text-emerald-400 animate-pulse" />}
              {mainTab === "configure" && <Sliders className="size-4 text-blue-400" />}
              {mainTab === "matrix" && <Scale className="size-4 text-amber-400" />}
              <h2 className="text-sm font-extrabold text-foreground capitalize truncate">
                {mainTab === "overview" ? "Command Center" :
                  mainTab === "telemetry" ? "Real-Time Telemetry" :
                    mainTab === "configure" ? `${provider.name} Settings` : "LLM Metrics Matrix"}
              </h2>
            </div>

            <div className="dashboard-inner-card flex items-center gap-1 p-1 overflow-x-auto scrollbar-none max-w-full">
              {workspaceModes.map((item) => {
                const Icon = item.icon;
                const isActive = mainTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMainTab(item.id)}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                      isActive
                        ? "bg-background text-foreground shadow-xs border border-black/15 dark:border-white/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-3", item.color, isActive && "animate-pulse")} />
                    {item.label}
                    {item.id === "telemetry" && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-extrabold px-1 py-0 border border-emerald-500/30">LIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN BODY: CONFIGURATION / TELEMETRY / MATRIX AREA */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* TAB CONTENT VIEWS */}
              <div className="flex-1 flex min-h-0 relative">
                {mainTab === "overview" && (
                  <BrainOverviewTab
                    liveTtft={liveTtft}
                    liveTokensPerSec={liveTokensPerSec}
                    liveReqPerMin={liveReqPerMin}
                    liveVectorLatency={liveVectorLatency}
                    totalTokens={totalTokensStat || totalTokens}
                    successRate={successRate}
                    cacheHitRate={cacheHitRate}
                    providerShare={providerShare}
                    weeklyTokens={weeklyTokens}
                    fastestComparedModel={fastestComparedModel}
                    cheapestComparedModel={cheapestComparedModel}
                    highestQualityComparedModel={highestQualityComparedModel}
                    setMainTab={setMainTab}
                  />
                )}

                {mainTab === "telemetry" && (
                  <BrainTelemetryTab
                    telemetryLive={telemetryLive}
                    setTelemetryLive={setTelemetryLive}
                    telemetryInterval={telemetryInterval}
                    setTelemetryInterval={setTelemetryInterval}
                    telemetryWindow={telemetryWindow}
                    setTelemetryWindow={setTelemetryWindow}
                    liveTtft={liveTtft}
                    liveP95={liveP95}
                    liveTokensPerSec={liveTokensPerSec}
                    liveReqPerMin={liveReqPerMin}
                    liveVectorLatency={liveVectorLatency}
                    totalTokens={totalTokensStat || totalTokens}
                    successRate={successRate}
                    cacheHitRate={cacheHitRate}
                    providerShare={providerShare}
                    providers={allProviders}
                    throughputGraph={throughputGraph}
                    telemetryStreamLogs={telemetryStreamLogs}
                    setTelemetryStreamLogs={setTelemetryStreamLogs}
                    onRefresh={fetchData}
                  />
                )}

                {mainTab === "configure" && (
                  <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                    <BrainProviderSidebar
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      listProviders={listProviders}
                      selectedProviderId={selectedProviderId}
                      selectProvider={selectProvider}
                    />
                    <BrainConfigTab
                      provider={provider}
                      activateProvider={activateProvider}
                      testConnection={testConnection}
                      testingId={testingId}
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                      temperature={temperature}
                      setTemperature={setTemperature}
                      maxTokens={maxTokens}
                      setMaxTokens={setMaxTokens}
                      topP={topP}
                      setTopP={setTopP}
                      systemPrompt={systemPrompt}
                      setSystemPrompt={setSystemPrompt}
                      benchmarkStatus={benchmarkStatus}
                      runSpeedBenchmark={runSpeedBenchmark}
                      benchmarkProgress={benchmarkProgress}
                      benchmarkSpeed={benchmarkSpeed}
                      benchmarkLatency={benchmarkLatency}
                      endpoint={endpoint}
                      setLocalEndpoint={setLocalEndpoint}
                      setEndpointEdited={setEndpointEdited}
                      providerKeys={providerKeys}
                      addKeyMode={addKeyMode}
                      setAddKeyMode={setAddKeyMode}
                      newLabel={newLabel}
                      setNewLabel={setNewLabel}
                      newKeyVal={newKeyVal}
                      setNewKeyVal={setNewKeyVal}
                      showKey={showKey}
                      setShowKey={setShowKey}
                      saveKey={saveKey}
                      deleteKey={deleteKey}
                      toggleKey={toggleKey}
                    />
                  </div>
                )}

                {mainTab === "matrix" && (
                  <BrainMatrixTab
                    sortedCompareMetrics={sortedCompareMetrics}
                    selectedCompareIds={selectedCompareIds}
                    toggleCompareId={toggleCompareId}
                    handleSort={handleSort}
                    selectedMetrics={selectedMetrics}
                    fastestComparedModel={fastestComparedModel}
                    cheapestComparedModel={cheapestComparedModel}
                    highestQualityComparedModel={highestQualityComparedModel}
                  />
                )}
              </div>
            </div>

            {/* RIGHT: Usage Stats Visualization Drawer */}
            {mainTab !== "telemetry" && mainTab !== "overview" && (
              <BrainUsageSidebar providers={allProviders} weeklyTokens={weeklyTokens} />
            )}
          </div>
        </div>

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          query="AI Model & Brain Playground Session"
        />
      </div>
    </TooltipProvider>
  );
}

export default BrainDashboard;
