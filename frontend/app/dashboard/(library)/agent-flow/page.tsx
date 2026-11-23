import { AgentGraphVisualizer } from "@/components/agent-graph-visualizer";

export default function AgentFlowPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          LangGraph Agent Orchestrator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive real-time visualization of TriVisionX autonomous multi-agent graph pipelines.
        </p>
      </div>

      <AgentGraphVisualizer />
    </div>
  );
}
