"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Pin,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface MemoryItem {
  id: string;
  category: "fact" | "document" | "preference" | "session";
  content: string;
  source: string;
  confidence?: number;
  timestamp: string;
  pinned?: boolean;
  deletable?: boolean;
}

export function MemoryTimeline() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "fact" | "document" | "preference" | "session">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const [pineconeIndex, setPineconeIndex] = useState<string>("Server Configured");
  const [avgLatencyMs, setAvgLatencyMs] = useState<number | null>(null);

  const loadMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const isDemo = localStorage.getItem("is_demo") === "true";
      if (!token || token === "demo_guest_token" || isDemo) {
        setMemories([]);
        setTotalChunks(0);
        setAvgLatencyMs(null);
        return;
      }

      const [memRes, docsRes, statsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE_URL}/brain/memories?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_BASE_URL}/brain/telemetry/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${API_BASE_URL}/health/`).catch(() => null),
      ]);

      const items: MemoryItem[] = [];

      if (memRes.ok) {
        const facts = await memRes.json();
        if (Array.isArray(facts)) {
          for (const f of facts) {
            items.push({
              id: f.id,
              category: "fact",
              content: f.fact,
              source: "MongoDB User Memory Vault",
              timestamp: f.created_at ? new Date(f.created_at).toLocaleString() : "Saved",
              pinned: false,
              deletable: true,
            });
          }
        }
      }

      let chunksSum = 0;
      if (docsRes && docsRes.ok) {
        const docs = await docsRes.json();
        if (Array.isArray(docs)) {
          for (const d of docs) {
            const chunks = Number(d.chunk_count || 0);
            chunksSum += chunks;
            items.push({
              id: `doc-${d.id || d._id || d.filename}`,
              category: "document",
              content: `${d.filename} (${chunks} indexed chunks, ${String(d.file_type || "file").toUpperCase()})`,
              source: "Pinecone Document Index",
              timestamp: d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : "Indexed",
              deletable: false,
            });
          }
        }
      }
      setTotalChunks(chunksSum);

      if (statsRes && statsRes.ok) {
        const stats = await statsRes.json();
        if (typeof stats?.avgLatency === "number" && stats.avgLatency > 0) {
          setAvgLatencyMs(Math.round(stats.avgLatency));
        }
      }

      if (healthRes && healthRes.ok) {
        const h = await healthRes.json();
        const idx = h?.dependencies?.pinecone?.index;
        if (idx) setPineconeIndex(idx);
      }

      setMemories(items);
    } catch (err) {
      console.error("Failed to load memory timeline:", err);
      toast.error("Failed to load long-term memory timeline");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const filteredMemories = memories.filter((m) => {
    const matchesFilter = filter === "all" || m.category === filter;
    const matchesSearch =
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTogglePin = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };

  const handleDelete = async (id: string) => {
    const target = memories.find((m) => m.id === id);
    if (target && !target.deletable) {
      toast.info("Manage uploaded document chunks from the Documents panel.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/brain/memories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove memory");
      setMemories(prev => prev.filter(m => m.id !== id));
      toast.success("Memory removed from persistent vault.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete memory");
    }
  };

  const handleAddMemory = async () => {
    const cleanText = newMemoryText.trim();
    if (!cleanText || isSubmitting) return;
    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      toast.error("Sign in with an account to persist facts.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/brain/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fact: cleanText }),
      });
      if (!res.ok) throw new Error("Failed to save fact");
      const created = await res.json();
      const newMem: MemoryItem = {
        id: created.id,
        category: "fact",
        content: created.fact || cleanText,
        source: "MongoDB User Memory Vault",
        timestamp: "Just now",
        pinned: true,
        deletable: true,
      };
      setMemories(prev => [newMem, ...prev]);
      setNewMemoryText("");
      setIsAdding(false);
      toast.success("Fact saved to persistent memory!");
    } catch (err: any) {
      toast.error(err.message || "Failed to persist fact");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (category: MemoryItem["category"]) => {
    switch (category) {
      case "preference":
        return <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">Preference</Badge>;
      case "fact":
        return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Semantic Fact</Badge>;
      case "document":
        return <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Document Chunk</Badge>;
      case "session":
        return <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Session Insight</Badge>;
    }
  };

  return (
    <div className="relative flex-1 overflow-y-auto bg-background p-6 lg:p-8 space-y-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_65%)] pointer-events-none" />

      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Brain className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Long-Term Memory Timeline</h1>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              MongoDB + Pinecone
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Persisted user facts and indexed document chunks scoped strictly to your workspace account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={loadMemories}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Teach TriVisionX Fact
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="dashboard-3d-card dashboard-3d-card-interactive">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Database className="size-3 text-primary" /> Indexed Chunks
            </span>
            <p className="text-xl font-extrabold text-foreground tracking-tight">{totalChunks} chunks</p>
            <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="size-2.5" /> {memories.filter(m => m.category === "fact").length} saved facts
            </span>
          </CardContent>
        </Card>
        <Card className="dashboard-3d-card dashboard-3d-card-interactive">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3 text-purple-500" /> Vector Index
            </span>
            <p className="text-sm font-bold text-foreground truncate">{pineconeIndex}</p>
            <span className="text-[10px] font-mono text-muted-foreground">HuggingFace / Google Embeddings</span>
          </CardContent>
        </Card>
        <Card className="dashboard-3d-card dashboard-3d-card-interactive">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="size-3 text-cyan-500" /> Mean LLM Latency
            </span>
            <p className="text-xl font-extrabold text-foreground tracking-tight">
              {avgLatencyMs !== null ? `${avgLatencyMs} ms` : "No runs yet"}
            </p>
            <span className="text-[10px] font-mono text-primary">Measured from telemetry logs</span>
          </CardContent>
        </Card>
        <Card className="dashboard-3d-card dashboard-3d-card-interactive">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-emerald-500" /> Tenant Isolation
            </span>
            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Per-User Namespace
            </p>
            <span className="text-[10px] font-mono text-muted-foreground">Scoped user_id partition</span>
          </CardContent>
        </Card>
      </div>

      {/* Add Memory Drawer */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="dashboard-3d-card border-primary/40 bg-primary/5">
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Manually Encode Permanent Fact / Rule
                  </h4>
                  <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer">
                    Cancel
                  </button>
                </div>
                <Input
                  placeholder="e.g., Always format mathematical proofs in LaTeX display equations..."
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
                  className="text-xs h-9 bg-background border-border/80 focus-visible:ring-primary"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={handleAddMemory} className="text-xs h-8 bg-primary text-primary-foreground font-semibold">
                    Commit to Memory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 rounded-xl bg-card border border-border/70 [box-shadow:0_0_0_1px_rgba(0,0,0,.02)]">
          {(["all", "fact", "document", "preference", "session"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search vectors & facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-card border-border/80"
          />
        </div>
      </div>

      {/* Memory Timeline List */}
      <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-primary/40 before:via-border/60 before:to-transparent">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs font-mono">
            No persistent memories match your search filter.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div key={mem.id} className="relative flex items-start gap-4 pl-8 group">
              {/* Timeline marker */}
              <div className={`absolute left-2 top-4 h-3 w-3 rounded-full border-2 bg-background transition-transform group-hover:scale-125 ${
                mem.pinned ? "border-primary ring-2 ring-primary/30" : "border-border"
              }`} />

              <Card className="dashboard-3d-card flex-1 hover:border-primary/40 transition-all">
                <CardContent className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(mem.category)}
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {mem.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {typeof mem.confidence === "number" && (
                        <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {(mem.confidence * 100).toFixed(0)}% match
                        </span>
                      )}
                      <button
                        onClick={() => handleTogglePin(mem.id)}
                        className={`p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer ${mem.pinned ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                        title={mem.pinned ? "Unpin memory" : "Pin memory"}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      {mem.deletable && (
                        <button
                          onClick={() => handleDelete(mem.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete memory"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">
                    {mem.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="truncate">Source: <span className="font-medium text-foreground">{mem.source}</span></span>
                    <span className="text-[10px] font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/20">vector_id: {mem.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
