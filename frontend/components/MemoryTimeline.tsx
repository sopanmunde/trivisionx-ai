"use client";

import React, { useState } from "react";
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
  Tag,
  CheckCircle2,
  FileText,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface MemoryItem {
  id: string;
  category: "fact" | "document" | "preference" | "session";
  content: string;
  source: string;
  confidence: number;
  timestamp: string;
  pinned?: boolean;
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    category: "preference",
    content: "User prioritizes LangGraph multi-agent cyclic graphs with verified source citations over single-turn answers.",
    source: "Learned from Chat Session #4",
    confidence: 0.98,
    timestamp: "2 hours ago",
    pinned: true
  },
  {
    id: "mem-2",
    category: "fact",
    content: "Primary deployment target is Next.js 15 App Router frontend paired with FastAPI backend and Pinecone vector index.",
    source: "Repo Configuration Ingestion",
    confidence: 0.95,
    timestamp: "Yesterday",
    pinned: true
  },
  {
    id: "mem-3",
    category: "document",
    content: "Multi-Agent LangGraph Architecture & StateGraph Nodes: 18 chunks embedded via text-embedding-3-small.",
    source: "Uploaded PDF: architecture_design.md",
    confidence: 0.92,
    timestamp: "Nov 21, 2024"
  },
  {
    id: "mem-4",
    category: "preference",
    content: "When generating comparative intelligence matrices, always evaluate against OpenAI, Perplexity, and Anthropic.",
    source: "Direct User Prompt Directive",
    confidence: 0.99,
    timestamp: "Nov 20, 2024"
  },
  {
    id: "mem-5",
    category: "session",
    content: "Completed full competitive audit of Perplexity AI Enterprise spaces vs TriVisionX hybrid RAG.",
    source: "Agent Graph: competitive_graph",
    confidence: 0.89,
    timestamp: "Nov 19, 2024"
  }
];

export function MemoryTimeline() {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [filter, setFilter] = useState<"all" | "fact" | "document" | "preference" | "session">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredMemories = memories.filter((m) => {
    const matchesFilter = filter === "all" || m.category === filter;
    const matchesSearch =
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTogglePin = (id: string) => {
    setMemories(memories.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
    toast.info("Memory priority updated.");
  };

  const handleDelete = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
    toast.success("Memory removed from persistent vector store.");
  };

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: "preference",
      content: newMemoryText.trim(),
      source: "Manual Knowledge Entry",
      confidence: 1.0,
      timestamp: "Just now",
      pinned: true
    };
    setMemories([newMem, ...memories]);
    setNewMemoryText("");
    setIsAdding(false);
    toast.success("New persistent memory encoded into Pinecone vector index!");
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
              Pinecone Live Synced
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Episodic memory store, auto-extracted facts, and cross-session knowledge preserved across agent runs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Indexed Memory Chunks</span>
            <p className="text-xl font-bold text-foreground mt-0.5">142 vectors</p>
            <span className="text-[10px] text-emerald-500">100% active retention</span>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Embedding Backbone</span>
            <p className="text-sm font-semibold text-foreground mt-1">text-embedding-3</p>
            <span className="text-[10px] text-muted-foreground">1536-dimensional</span>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Mean Retrieval Latency</span>
            <p className="text-xl font-bold text-foreground mt-0.5">14.2 ms</p>
            <span className="text-[10px] text-primary">Sub-20ms Pinecone Serverless</span>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">Zero-Trust Security</span>
            <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Isolated Tenant
            </p>
            <span className="text-[10px] text-muted-foreground">SOC2 AES-256</span>
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
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Manually Encode Permanent Fact / Rule
                  </h4>
                  <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground text-xs">
                    Cancel
                  </button>
                </div>
                <Input
                  placeholder="e.g., Always format mathematical proofs in LaTeX display equations..."
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMemory()}
                  className="text-xs h-9 bg-background"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={handleAddMemory} className="text-xs h-8">
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
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["all", "fact", "document", "preference", "session"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search vectors & facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8 bg-background"
          />
        </div>
      </div>

      {/* Memory Timeline List */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">
            No persistent memories match your search filter.
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div key={mem.id} className="relative flex items-start gap-4 pl-8 group">
              {/* Timeline marker */}
              <div className={`absolute left-2 top-3 h-3 w-3 rounded-full border-2 bg-background ${
                mem.pinned ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`} />

              <Card className="flex-1 border-border/80 bg-card/80 hover:border-primary/40 transition-all">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(mem.category)}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {mem.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {(mem.confidence * 100).toFixed(0)}% match
                      </span>
                      <button
                        onClick={() => handleTogglePin(mem.id)}
                        className={`p-1 rounded hover:bg-muted transition-colors ${mem.pinned ? "text-primary" : "text-muted-foreground"}`}
                        title={mem.pinned ? "Unpin memory" : "Pin memory"}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {mem.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                    <span className="truncate">Source: {mem.source}</span>
                    <span className="text-[10px] font-mono text-primary/80">vector_id: {mem.id}</span>
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
