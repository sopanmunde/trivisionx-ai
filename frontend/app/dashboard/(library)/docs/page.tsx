"use client";

import { DashboardDocsTable } from "@/components/DashboardDocsTable"
import DocumentViewerDemo from "@/components/DocumentViewerDemo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardDocsPage() {
  return (
    <div className="relative min-h-full bg-background pb-16">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-[140px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/10 dark:from-blue-600/25 dark:via-purple-600/25 dark:to-cyan-400/20 -z-10" />

      <div className="relative px-6 py-8 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-3 border-b border-border/80 pb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
              Pinecone Knowledge Vault
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Document Library &amp; Vector Store
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Browse and manage your uploaded research documents, semantic vectors, and conversation contexts with sub-20ms MMR retrieval.
          </p>
        </div>

        {/* Tabs & 3D Container */}
        <Tabs defaultValue="library" className="w-full space-y-6">
          <TabsList className="p-1 rounded-xl bg-card border border-border/80 shadow-xs">
            <TabsTrigger value="library" className="rounded-lg text-xs font-semibold">Library Table</TabsTrigger>
            <TabsTrigger value="viewer" className="rounded-lg text-xs font-semibold">Document Viewer</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="dashboard-3d-container p-4 sm:p-6">
            <DashboardDocsTable />
          </TabsContent>

          <TabsContent value="viewer" className="dashboard-3d-container p-4 sm:p-6">
            <DocumentViewerDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

