"use client";

import React, { useState, useEffect } from "react";
import {
  Plug,
  Bot,
  Key,
  Database,
  Search,
  Server,
  Layers,
  Sparkles,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Code2,
  Terminal,
  Cpu,
  Globe,
  Sliders,
  CheckSquare,
  Calendar,
  Mail,
  FileText,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

interface IntegrationsDashboardProps {
  onNavigateToChat?: () => void;
}

const DEFAULT_INTEGRATION_CONFIG = {
  apps: {
    tasks: { enabled: true, autoSync: true, defaultList: "Inbox" },
    calendar: { enabled: true, syncInterval: 30, activeCalendars: ["Personal", "Work"] },
    email: { enabled: true, autoDraft: false, syncLabels: ["Inbox", "Sent"] },
    gallery: { enabled: true, syncFolders: ["Documents", "Images"], maxFileSize: 5 },
    notes: { enabled: true, notionSync: false, keepSync: true },
  },
  slack: { enabled: false, webhookUrl: "", channelName: "#research-reports" },
  teams: { enabled: false, webhookUrl: "" },
  notion: { enabled: false, apiKey: "", parentPageId: "", databaseId: "" },
  confluence: { enabled: false, domain: "", email: "", apiToken: "", spaceKey: "RESEARCH" },
  jira: { enabled: false, domain: "", email: "", apiToken: "", projectKey: "AI", defaultIssueType: "Task" },
  skills: [],
  mcp_plugins: [],
};

export function IntegrationsDashboard({ onNavigateToChat }: IntegrationsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"agents" | "providers" | "vectordb" | "search" | "mcp" | "apps">("agents");
  const [config, setConfig] = useState<any>(null);
  const [brainKeys, setBrainKeys] = useState<any[]>([]);
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [healthData, setHealthData] = useState<any>(null);
  const [providerInputs, setProviderInputs] = useState<Record<string, string>>({});
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillPrompt, setNewSkillPrompt] = useState("");

  // MCP Form
  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpUrl, setNewMcpUrl] = useState("");
  const [newMcpToken, setNewMcpToken] = useState("");

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const isDemo = localStorage.getItem("is_demo") === "true";

      if (!token || token === "demo_guest_token" || isDemo) {
        setConfig(DEFAULT_INTEGRATION_CONFIG);
        setBrainKeys([]);
        setHealthData(null);
        return;
      }

      const [intRes, keysRes, provRes, healthRes] = await Promise.all([
        fetch(`${API_BASE_URL}/integrations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/brain/keys`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/brain/providers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/health/`).catch(() => null),
      ]);

      if (intRes.ok) {
        setConfig(await intRes.json());
      } else {
        setConfig(DEFAULT_INTEGRATION_CONFIG);
        toast.error("Failed to load integration configurations");
      }

      if (keysRes.ok) {
        setBrainKeys(await keysRes.json());
      }

      if (provRes.ok) {
        const providers = await provRes.json();
        const ollama = Array.isArray(providers)
          ? providers.find((p: any) => p.id === "ollama" || p.providerId === "ollama")
          : null;
        if (ollama?.endpoint) setOllamaEndpoint(ollama.endpoint);
      }

      if (healthRes && healthRes.ok) {
        setHealthData(await healthRes.json());
      }
    } catch (e) {
      console.error(e);
      setConfig(DEFAULT_INTEGRATION_CONFIG);
      toast.error("Error connecting to integrations API");
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (updatedConfig = config) => {
    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      toast.error("Sign in with an account to persist integration changes.");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE_URL}/integrations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        toast.success("All integration & agent settings saved successfully");
      } else {
        toast.error("Failed to save configurations");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProviderKey = async (providerId: string, label: string) => {
    const apiKeyVal = (providerInputs[providerId] || "").trim();
    if (!apiKeyVal) return;
    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      toast.error("Sign in with an account to store API keys.");
      return;
    }
    try {
      setSavingProviderId(providerId);
      const res = await fetch(`${API_BASE_URL}/brain/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ providerId, label, key: apiKeyVal, isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to save API key");
      const created = await res.json();
      setBrainKeys((prev) => [created, ...prev]);
      setProviderInputs((prev) => ({ ...prev, [providerId]: "" }));
      toast.success(`${label} encrypted & saved`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save key");
    } finally {
      setSavingProviderId(null);
    }
  };

  const handleDeleteProviderKey = async (keyId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/brain/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete API key");
      setBrainKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast.success("API key removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove key");
    }
  };

  const handleSaveOllamaEndpoint = async () => {
    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      toast.error("Sign in to update provider endpoints.");
      return;
    }
    try {
      setSavingProviderId("ollama");
      const res = await fetch(`${API_BASE_URL}/brain/providers/ollama`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: ollamaEndpoint.trim(), isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to update Ollama endpoint");
      toast.success("Ollama endpoint saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to update Ollama endpoint");
    } finally {
      setSavingProviderId(null);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      description: newSkillDesc.trim(),
      systemPrompt: newSkillPrompt.trim(),
      isActive: true
    };
    const nextSkills = [...(config?.skills || []), newSkill];
    const updated = { ...config, skills: nextSkills };
    setConfig(updated);
    saveConfig(updated);
    setNewSkillName("");
    setNewSkillDesc("");
    setNewSkillPrompt("");
  };

  const handleToggleSkill = (id: string) => {
    const nextSkills = (config?.skills || []).map((s: any) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    const updated = { ...config, skills: nextSkills };
    setConfig(updated);
    saveConfig(updated);
  };

  const handleDeleteSkill = (id: string) => {
    const nextSkills = (config?.skills || []).filter((s: any) => s.id !== id);
    const updated = { ...config, skills: nextSkills };
    setConfig(updated);
    saveConfig(updated);
  };

  const handleAddMcpServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcpName.trim() || !newMcpUrl.trim()) return;
    const newMcp = {
      id: `mcp-${Date.now()}`,
      name: newMcpName.trim(),
      endpoint: newMcpUrl.trim(),
      token: newMcpToken.trim(),
      status: "configured"
    };
    const nextMcp = [...(config?.mcp_plugins || []), newMcp];
    const updated = { ...config, mcp_plugins: nextMcp };
    setConfig(updated);
    saveConfig(updated);
    setNewMcpName("");
    setNewMcpUrl("");
    setNewMcpToken("");
  };

  const handleDeleteMcp = (id: string) => {
    const nextMcp = (config?.mcp_plugins || []).filter((m: any) => m.id !== id);
    const updated = { ...config, mcp_plugins: nextMcp };
    setConfig(updated);
    saveConfig(updated);
  };

  const handleToggleAppEnabled = (appKey: "tasks" | "calendar" | "email" | "notes" | "gallery") => {
    const currentApp = config?.apps?.[appKey] || {};
    const updated = {
      ...config,
      apps: {
        ...(config?.apps || {}),
        [appKey]: {
          ...currentApp,
          enabled: !(currentApp.enabled ?? true),
        },
      },
    };
    setConfig(updated);
    saveConfig(updated);
  };

  if (isLoading || !config) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-background text-foreground space-y-4">
        <RefreshCw className="size-7 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground font-mono">Loading Agents & Integrations Hub...</p>
      </div>
    );
  }

  const connectedProvidersCount = brainKeys.filter((k: any) => k?.isActive).length;
  const activeSkillsCount = (config?.skills || []).filter((s: any) => s.isActive).length;
  const mcpCount = (config?.mcp_plugins || []).length;
  const pineconeHealth = healthData?.dependencies?.pinecone;

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground min-h-screen pb-16">
      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 lg:px-8 space-y-8">
        {/* Top Header & Metrics Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground shadow-2xs">
                <Plug className="size-3.5 text-foreground" /> Ecosystem Hub
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                ● Live Synced
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Agents & Integrations
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Orchestrate multi-agent swarms, configure LLM provider keys, vector memory indexes, Model Context Protocol (MCP) servers, and workspace apps.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchIntegrations()}
              disabled={isLoading}
              className="gap-2 h-9 text-xs font-semibold"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              Refresh Status
            </Button>
            <Button
              size="sm"
              onClick={() => saveConfig()}
              disabled={isSaving}
              className="gap-2 h-9 text-xs font-semibold shadow-sm"
            >
              <Save className="size-3.5" />
              {isSaving ? "Syncing..." : "Save All Changes"}
            </Button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="dashboard-3d-card dashboard-3d-card-interactive">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Connected Providers</p>
                <h3 className="text-2xl font-extrabold mt-1 text-foreground">{connectedProvidersCount} Active</h3>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Key className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-3d-card dashboard-3d-card-interactive">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Agent Skills</p>
                <h3 className="text-2xl font-extrabold mt-1 text-foreground">{activeSkillsCount} Active</h3>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bot className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-3d-card dashboard-3d-card-interactive">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vector Store RAG</p>
                <h3 className="text-xl font-extrabold mt-1 text-foreground truncate">
                  {pineconeHealth?.status === "healthy"
                    ? `Pinecone (${pineconeHealth.index || "Ready"})`
                    : pineconeHealth?.status === "unhealthy"
                    ? "Unavailable"
                    : "Server Configured"}
                </h3>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Database className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-3d-card dashboard-3d-card-interactive">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MCP Protocol Servers</p>
                <h3 className="text-2xl font-extrabold mt-1 text-foreground">{mcpCount} Registered</h3>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Server className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Navigation Hub */}
        <Tabs defaultValue="agents" value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto scrollbar-none bg-muted/60 p-1 rounded-xl border border-border gap-1 h-auto">
            <TabsTrigger value="agents" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Bot className="size-4" /> Agent Swarm & Skills
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Key className="size-4" /> LLM Model Keys
            </TabsTrigger>
            <TabsTrigger value="vectordb" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Database className="size-4" /> Vector DB & RAG
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Search className="size-4" /> Publish Channels & Web
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Server className="size-4" /> MCP Protocol Servers
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2 px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg transition-all cursor-pointer">
              <Layers className="size-4" /> Workspace Apps
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AGENTS & SKILLS */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Built-in Agent Roles */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="size-4" /> Multi-Agent Persona Orchestra
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono">4 Core Agents</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "planner", name: "Research Planner Agent", desc: "Decomposes complex requests into research pathways.", model: "Supervisor Node", icon: Sliders },
                    { id: "retriever", name: "Document RAG Analyst", desc: "Queries Pinecone MMR vectors for grounded citation facts.", model: "Pinecone Namespace RAG", icon: Database },
                    { id: "web_search", name: "Web Query Analyst", desc: "Queries live web search providers and SSRF-guarded pages.", model: "Web Search Tool", icon: Globe },
                    { id: "code_gen", name: "Technical & Code Analyst", desc: "Synthesizes technical explanations, code blocks, and reports.", model: "Active BYOK LLM", icon: Code2 },
                  ].map((agent) => (
                    <Card key={agent.id} className="border-border bg-card shadow-2xs hover:border-primary/40 transition-all">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
                            <agent.icon className="size-4" />
                          </div>
                          <div>
                            <CardTitle className="text-xs font-bold text-foreground">{agent.name}</CardTitle>
                            <span className="text-[10px] font-mono text-muted-foreground">{agent.model}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Ready
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">{agent.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Custom Agent Skills Section */}
                <div className="pt-4 border-t border-border space-y-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Terminal className="size-4" /> Registered Custom Agent Skills ({config?.skills?.length || 0})
                  </h3>

                  <div className="space-y-3">
                    {(config?.skills || []).map((skill: any) => (
                      <div key={skill.id} className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-foreground">{skill.name}</h4>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {skill.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{skill.description}</p>
                          {skill.systemPrompt && (
                            <code className="block text-[10px] font-mono p-2 rounded bg-muted text-foreground border border-border truncate mt-1">
                              {skill.systemPrompt}
                            </code>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={Boolean(skill.isActive)}
                            onCheckedChange={() => handleToggleSkill(skill.id)}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Custom Skill Form Card */}
              <Card className="border-border bg-card shadow-2xs h-fit">
                <CardHeader className="p-5 pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Plus className="size-4" /> Register New Agent Skill
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Inject custom domain instructions or formatting prompts into agent execution chains.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <form onSubmit={handleAddSkill} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Skill Name</label>
                      <Input
                        placeholder="e.g. Financial Report Formatter"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="h-8.5 text-xs bg-muted/30"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Description</label>
                      <Input
                        placeholder="Brief summary of when to execute"
                        value={newSkillDesc}
                        onChange={(e) => setNewSkillDesc(e.target.value)}
                        className="h-8.5 text-xs bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">System Prompt Injection</label>
                      <Textarea
                        placeholder="Instructions injected into agent context..."
                        value={newSkillPrompt}
                        onChange={(e) => setNewSkillPrompt(e.target.value)}
                        className="min-h-[90px] text-xs bg-muted/30 font-mono"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold gap-1.5">
                      <Plus className="size-3.5" /> Save Skill
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: LLM MODEL PROVIDER KEYS (Persisted encrypted in /api/brain/keys) */}
          <TabsContent value="providers" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">LLM Provider API Credentials</h3>
                <p className="text-xs text-muted-foreground">
                  Save encrypted BYOK keys for OpenAI, Gemini, Anthropic, DeepSeek, Groq, and Cohere directly to your Brain Vault.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "openai", name: "OpenAI API Key", placeholder: "sk-proj-...", docs: "https://platform.openai.com/api-keys" },
                  { id: "gemini", name: "Google Gemini API Key", placeholder: "AIzaSy...", docs: "https://aistudio.google.com/app/apikey" },
                  { id: "anthropic", name: "Anthropic Claude Key", placeholder: "sk-ant-...", docs: "https://console.anthropic.com/" },
                  { id: "deepseek", name: "DeepSeek API Key", placeholder: "sk-...", docs: "https://platform.deepseek.com/" },
                  { id: "groq", name: "Groq LPU Key", placeholder: "gsk_...", docs: "https://console.groq.com/keys" },
                  { id: "cohere", name: "Cohere API Key", placeholder: "co-...", docs: "https://dashboard.cohere.com/" },
                ].map((item) => {
                  const savedKeys = brainKeys.filter((k) => k.providerId === item.id);
                  return (
                    <Card key={item.id} className="border-border bg-card p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Key className="size-3.5 text-muted-foreground" /> {item.name}
                        </label>
                        <a
                          href={item.docs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          Get Key <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder={item.placeholder}
                          value={providerInputs[item.id] || ""}
                          onChange={(e) => setProviderInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="h-8.5 text-xs bg-muted/30 font-mono flex-1"
                        />
                        <Button
                          size="sm"
                          disabled={!providerInputs[item.id]?.trim() || savingProviderId === item.id}
                          onClick={() => handleSaveProviderKey(item.id, item.name)}
                          className="h-8.5 px-3 text-xs font-semibold shrink-0"
                        >
                          {savingProviderId === item.id ? "Saving..." : "Save"}
                        </Button>
                      </div>
                      {savedKeys.length > 0 ? (
                        <div className="space-y-1 pt-1">
                          {savedKeys.map((sk) => (
                            <div key={sk.id} className="flex items-center justify-between text-[11px] bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1">
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 truncate">
                                {sk.key}
                              </span>
                              <button
                                onClick={() => handleDeleteProviderKey(sk.id)}
                                className="text-muted-foreground hover:text-destructive ml-2"
                                title="Delete key"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground font-mono">No personal key stored</p>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Local Ollama Endpoint Card */}
              <Card className="border-border bg-card p-5 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Cpu className="size-4 text-foreground" /> Local Ollama Endpoint Host
                </h4>
                <p className="text-xs text-muted-foreground">Host URL for local open-weight LLMs running via Ollama (persisted in Brain Providers).</p>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="space-y-1 flex-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Ollama Base URL</label>
                    <Input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      className="h-8.5 text-xs bg-muted/30 font-mono"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveOllamaEndpoint}
                    disabled={savingProviderId === "ollama"}
                    className="h-8.5 px-4 text-xs font-semibold shrink-0"
                  >
                    {savingProviderId === "ollama" ? "Saving..." : "Save Endpoint"}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: VECTOR DB & RAG (Live Health Inspection) */}
          <TabsContent value="vectordb" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Vector Store &amp; Backend Dependencies</h3>
                <p className="text-xs text-muted-foreground">
                  Live health telemetry from <code>/api/health</code>. Documents are isolated per account using Pinecone namespaces.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "pinecone", name: "Pinecone Cloud Vector Index", desc: pineconeHealth?.index ? `Index: ${pineconeHealth.index}` : "Serverless vector store", icon: Database },
                  { key: "mongodb", name: "MongoDB Primary Database", desc: "Users, conversations, notes, tasks, events, telemetry", icon: Server },
                  { key: "langgraph", name: "LangGraph Pipeline Engine", desc: Array.isArray(healthData?.dependencies?.langgraph?.nodes) ? `Nodes: ${healthData.dependencies.langgraph.nodes.join(", ")}` : "Compiled multi-agent state graph", icon: Cpu },
                  { key: "redis", name: "Redis Semantic & API Cache", desc: healthData?.dependencies?.redis?.note || "Optional caching layer", icon: Zap },
                ].map((dep) => {
                  const statusObj = healthData?.dependencies?.[dep.key];
                  const statusLabel = statusObj?.status || "unknown";
                  const isHealthy = statusLabel === "healthy";
                  return (
                    <Card key={dep.key} className="border-border bg-card p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
                            <dep.icon className="size-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{dep.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-mono">{dep.desc}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono capitalize",
                            isHealthy
                              ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                              : "border-border text-muted-foreground"
                          )}
                        >
                          {statusLabel}
                          {typeof statusObj?.latency_ms === "number" ? ` • ${statusObj.latency_ms}ms` : ""}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: PUBLISH CHANNELS & WEB TOOLS (Persisted in /api/integrations) */}
          <TabsContent value="search" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-foreground">Publish Channels &amp; Web Research Tools</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure Slack, Teams, Notion, Confluence, and Jira publishing connectors (encrypted at rest in MongoDB).
                  </p>
                </div>
                <Button size="sm" onClick={() => saveConfig()} disabled={isSaving} className="h-8 text-xs font-semibold gap-1.5">
                  <Save className="size-3.5" /> {isSaving ? "Saving..." : "Save Channels"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slack */}
                <Card className="border-border bg-card p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground"># Slack Webhook</label>
                    <Switch
                      checked={Boolean(config?.slack?.enabled)}
                      onCheckedChange={(checked) => {
                        const updated = { ...config, slack: { ...(config?.slack || {}), enabled: checked } };
                        setConfig(updated);
                        saveConfig(updated);
                      }}
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="https://hooks.slack.com/services/..."
                    value={config?.slack?.webhookUrl || ""}
                    onChange={(e) => setConfig({ ...config, slack: { ...(config?.slack || {}), webhookUrl: e.target.value } })}
                    className="h-8.5 text-xs bg-muted/30 font-mono"
                  />
                  <Input
                    placeholder="#research-reports"
                    value={config?.slack?.channelName || ""}
                    onChange={(e) => setConfig({ ...config, slack: { ...(config?.slack || {}), channelName: e.target.value } })}
                    className="h-8.5 text-xs bg-muted/30"
                  />
                </Card>

                {/* Teams */}
                <Card className="border-border bg-card p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Microsoft Teams Webhook</label>
                    <Switch
                      checked={Boolean(config?.teams?.enabled)}
                      onCheckedChange={(checked) => {
                        const updated = { ...config, teams: { ...(config?.teams || {}), enabled: checked } };
                        setConfig(updated);
                        saveConfig(updated);
                      }}
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="https://outlook.office.com/webhook/..."
                    value={config?.teams?.webhookUrl || ""}
                    onChange={(e) => setConfig({ ...config, teams: { ...(config?.teams || {}), webhookUrl: e.target.value } })}
                    className="h-8.5 text-xs bg-muted/30 font-mono"
                  />
                </Card>

                {/* Notion */}
                <Card className="border-border bg-card p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Notion Workspace</label>
                    <Switch
                      checked={Boolean(config?.notion?.enabled)}
                      onCheckedChange={(checked) => {
                        const updated = { ...config, notion: { ...(config?.notion || {}), enabled: checked } };
                        setConfig(updated);
                        saveConfig(updated);
                      }}
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="Notion Integration Token (secret_...)"
                    value={config?.notion?.apiKey || ""}
                    onChange={(e) => setConfig({ ...config, notion: { ...(config?.notion || {}), apiKey: e.target.value } })}
                    className="h-8.5 text-xs bg-muted/30 font-mono"
                  />
                  <Input
                    placeholder="Parent Page ID"
                    value={config?.notion?.parentPageId || ""}
                    onChange={(e) => setConfig({ ...config, notion: { ...(config?.notion || {}), parentPageId: e.target.value } })}
                    className="h-8.5 text-xs bg-muted/30 font-mono"
                  />
                </Card>

                {/* Server Search Capabilities Info */}
                <Card className="border-border bg-card p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="size-3.5 text-muted-foreground" /> Server Live Web Search
                    </label>
                    <Badge variant="outline" className="text-[9px] font-mono">Backend Env</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Autonomous web search uses server-configured Tavily, SerpAPI, or Brave keys with DuckDuckGo fallback and SSRF protection on webpage extraction.
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: MCP PROTOCOL SERVERS */}
          <TabsContent value="mcp" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Server className="size-4" /> Registered MCP Protocol Servers ({config?.mcp_plugins?.length || 0})
                  </h3>
                  <p className="text-xs text-muted-foreground">Model Context Protocol (MCP) endpoints connecting external databases, tools, and execution runtimes.</p>
                </div>

                <div className="space-y-3">
                  {(config?.mcp_plugins || []).map((mcp: any) => (
                    <Card key={mcp.id} className="border-border bg-card p-4 shadow-2xs">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-foreground">{mcp.name}</h4>
                            <Badge variant="outline" className="text-[9px] font-mono capitalize">
                              {mcp.status || "configured"}
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground truncate">{mcp.endpoint}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteMcp(mcp.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Add MCP Form */}
              <Card className="border-border bg-card shadow-2xs h-fit">
                <CardHeader className="p-5 pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Plus className="size-4" /> Connect New MCP Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <form onSubmit={handleAddMcpServer} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Server Name</label>
                      <Input
                        placeholder="e.g. Postgres DB MCP"
                        value={newMcpName}
                        onChange={(e) => setNewMcpName(e.target.value)}
                        className="h-8.5 text-xs bg-muted/30"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">MCP Endpoint URL</label>
                      <Input
                        placeholder="https://mcp.internal.api/sse"
                        value={newMcpUrl}
                        onChange={(e) => setNewMcpUrl(e.target.value)}
                        className="h-8.5 text-xs bg-muted/30 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Bearer Auth Token (Optional)</label>
                      <Input
                        type="password"
                        placeholder="mcp_token_..."
                        value={newMcpToken}
                        onChange={(e) => setNewMcpToken(e.target.value)}
                        className="h-8.5 text-xs bg-muted/30 font-mono"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold gap-1.5">
                      <Plus className="size-3.5" /> Register MCP Server
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 6: WORKSPACE APPS */}
          <TabsContent value="apps" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Workspace Application Connectors</h3>
                <p className="text-xs text-muted-foreground">Toggle built-in task management, calendar, inbox email, and documentation apps (persisted in MongoDB).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    { key: "tasks", name: "Task Management Engine", desc: "Automated Kanban board and subtask execution.", icon: CheckSquare },
                    { key: "calendar", name: "Smart Calendar & Scheduling", desc: "Event scheduling and email notification reminders.", icon: Calendar },
                    { key: "email", name: "Inbox & Email Assistant", desc: "Draft email replies and SMTP delivery.", icon: Mail },
                    { key: "notes", name: "Notes & Docs Knowledge", desc: "Document editing and AI markdown assistance.", icon: FileText },
                  ] as const
                ).map((app) => {
                  const isEnabled = config?.apps?.[app.key]?.enabled ?? true;
                  return (
                    <Card key={app.key} className="border-border bg-card p-4 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
                          <app.icon className="size-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{app.name}</h4>
                          <p className="text-[11px] text-muted-foreground">{app.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={Boolean(isEnabled)}
                        onCheckedChange={() => handleToggleAppEnabled(app.key)}
                      />
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
