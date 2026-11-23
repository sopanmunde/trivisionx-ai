"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, Search, FileText, CheckCircle, Globe, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NodeStatus = "idle" | "active" | "done" | "waiting";

interface AgentNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  status: NodeStatus;
  color: string;
}

interface Edge {
  from: string;
  to: string;
}

const initialNodes: AgentNode[] = [
  { id: "planner",   label: "Planner",   sublabel: "Intent routing",     icon: <Brain className="w-4 h-4" />,       x: 50,  y: 20,  status: "idle", color: "primary" },
  { id: "retriever", label: "Retriever", sublabel: "Vector RAG",          icon: <Search className="w-4 h-4" />,      x: 25,  y: 48,  status: "idle", color: "blue" },
  { id: "websearch", label: "Web Search",sublabel: "Live data fetch",     icon: <Globe className="w-4 h-4" />,       x: 75,  y: 48,  status: "idle", color: "violet" },
  { id: "summarizer",label: "Summarizer",sublabel: "Context synthesis",   icon: <Cpu className="w-4 h-4" />,         x: 50,  y: 68,  status: "idle", color: "amber" },
  { id: "citation",  label: "Citation",  sublabel: "Source verification", icon: <CheckCircle className="w-4 h-4" />, x: 25,  y: 88,  status: "idle", color: "green" },
  { id: "report",    label: "Report",    sublabel: "Final export",        icon: <FileText className="w-4 h-4" />,    x: 75,  y: 88,  status: "idle", color: "rose" },
];

const edges: Edge[] = [
  { from: "planner",   to: "retriever" },
  { from: "planner",   to: "websearch" },
  { from: "retriever", to: "summarizer" },
  { from: "websearch", to: "summarizer" },
  { from: "summarizer",to: "citation" },
  { from: "summarizer",to: "report" },
];

const pipeline = [
  ["planner"],
  ["retriever", "websearch"],
  ["summarizer"],
  ["citation", "report"],
];

const colorMap: Record<string, string> = {
  primary: "border-primary/80 bg-primary/10 text-primary shadow-primary/20",
  blue:    "border-blue-500/80 bg-blue-500/10 text-blue-400 shadow-blue-500/20",
  violet:  "border-violet-500/80 bg-violet-500/10 text-violet-400 shadow-violet-500/20",
  amber:   "border-amber-500/80 bg-amber-500/10 text-amber-400 shadow-amber-500/20",
  green:   "border-green-500/80 bg-green-500/10 text-green-400 shadow-green-500/20",
  rose:    "border-rose-500/80 bg-rose-500/10 text-rose-400 shadow-rose-500/20",
};

function NodeCard({ node }: { node: AgentNode }) {
  const isActive = node.status === "active";
  const isDone = node.status === "done";

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      className={`absolute w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 ${
        isDone
          ? "border-green-500/60 bg-green-500/10 text-green-400 shadow-xs"
          : isActive
          ? (colorMap[node.color] || "border-primary bg-primary/10") + " shadow-lg"
          : "border-border/60 bg-card/85 text-foreground"
      }`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <div className={`flex items-center gap-1.5 mb-1 ${isActive ? "" : isDone ? "text-green-400" : "text-muted-foreground"}`}>
        {isDone ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : node.icon}
        <span className="text-xs font-bold truncate">{node.label}</span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground truncate block">{node.sublabel}</span>
      {isActive && (
        <motion.div
          className="mt-1.5 h-0.5 rounded-full bg-current opacity-60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.6, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function AgentGraphVisualizer() {
  const [nodes, setNodes] = useState<AgentNode[]>(initialNodes);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const currentQuery = "Research: Deep-dive multi-agent coordination with LangGraph and vector memory";

  const reset = () => {
    setNodes(initialNodes.map((n) => ({ ...n, status: "idle" })));
    setStep(-1);
    setRunning(false);
  };

  const runPipeline = () => {
    reset();
    setRunning(true);
    setStep(0);
  };

  useEffect(() => {
    if (!running || step < 0 || step >= pipeline.length) {
      if (step >= pipeline.length) setRunning(false);
      return;
    }

    const activeIds = pipeline[step];

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: activeIds.includes(n.id)
          ? "active"
          : n.status === "active"
          ? "done"
          : n.status,
      }))
    );

    const timer = setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          status: activeIds.includes(n.id) ? "done" : n.status,
        }))
      );
      setStep((s) => s + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [step, running]);

  const doneCount = nodes.filter((n) => n.status === "done").length;
  const progress = (doneCount / nodes.length) * 100;

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/90 dark:bg-card/70 backdrop-blur-xl overflow-hidden [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_8px_32px_rgba(0,0,0,.08)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_16px_40px_rgba(0,0,0,.5)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/70" />
            <span className="size-2.5 rounded-full bg-yellow-500/70" />
            <span className="size-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">langgraph_agent_orchestrator.ts</span>
        </div>
        <div className="flex items-center gap-2">
          {running && (
            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30 gap-1">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Running Phase {step + 1}/{pipeline.length}
            </Badge>
          )}
          {!running && step >= pipeline.length && (
            <Badge variant="outline" className="text-[10px] font-mono text-green-500 border-green-500/30">
              ✓ Orchestration Complete
            </Badge>
          )}
          <Button size="sm" variant={running ? "outline" : "default"} className="h-7 text-xs px-3" onClick={running ? reset : runPipeline}>
            {running ? "Reset" : "▶ Execute Pipeline"}
          </Button>
        </div>
      </div>

      {/* Query pill */}
      <div className="px-5 py-2.5 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted-foreground shrink-0">Incoming Prompt:</span>
          <span className="text-foreground truncate">{currentQuery}</span>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="relative bg-background/40 min-h-[380px]">
        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from)!;
            const toNode = nodes.find((n) => n.id === edge.to)!;
            const isActive = fromNode.status === "done" || fromNode.status === "active";
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "4 4"}
                opacity={isActive ? 0.8 : 0.35}
                style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
              />
            );
          })}
        </svg>

        {/* Node cards */}
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-t border-border/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            Pipeline progress: {doneCount} of {nodes.length} subgraphs finalized
          </span>
          <span className="text-[10px] font-mono text-foreground font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
