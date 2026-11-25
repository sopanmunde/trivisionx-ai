import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-full p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[340px] rounded-full blur-[140px] bg-gradient-to-tr from-emerald-500/10 via-blue-500/15 to-indigo-500/10 dark:from-emerald-500/20 dark:via-blue-600/25 dark:to-cyan-400/20 -z-10" />

      <AnalyticsDashboard />
    </div>
  );
}
