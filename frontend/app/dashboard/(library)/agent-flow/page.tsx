import { AgentGraphVisualizer } from "@/components/agent-graph-visualizer";

export default function AgentFlowPage() {
  return (
    <div className="relative min-h-full p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[320px] rounded-full blur-[130px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/10 dark:from-blue-600/25 dark:via-purple-600/25 dark:to-cyan-400/20 -z-10" />

      <div className="border-b border-border/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          LangGraph Agent Orchestrator
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Interactive real-time visualization of TriVisionX autonomous multi-agent graph pipelines.
        </p>
      </div>

      <div className="dashboard-3d-container p-1 sm:p-2">
        <AgentGraphVisualizer />
      </div>
    </div>
  );
}
