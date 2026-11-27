"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Share2,
  Send,
  ExternalLink,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Database,
  Cpu,
  CornerDownRight,
  SlidersHorizontal,
  FolderDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  query?: string;
  citations?: any[];
  type?: "report" | "task";
  taskId?: string;
  taskTitle?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  reportId,
  query,
  citations = [],
  type = "report",
  taskId,
  taskTitle
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"download" | "publish">("download");
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (format: "pdf" | "docx" | "xlsx" | "md") => {
    try {
      setIsExporting(format);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const isDemo = typeof window !== "undefined" && localStorage.getItem("is_demo") === "true";

      let endpoint = "";
      if (type === "task") {
        if (isDemo || !token || token === "demo_guest_token") {
          toast.error("Sign in with an account to export persisted tasks.");
          return;
        }
        if (format === "xlsx") endpoint = `${API_BASE_URL}/tasks/export/excel`;
        else if (format === "pdf") endpoint = `${API_BASE_URL}/tasks/export/pdf`;
        else if (format === "docx") endpoint = `${API_BASE_URL}/tasks/export/docx`;
        else endpoint = `${API_BASE_URL}/tasks/export/md`;
      } else if (reportId) {
        if (isDemo || !token || token === "demo_guest_token") {
          toast.error("Sign in with an account to download persisted reports.");
          return;
        }
        endpoint = format === "md"
          ? `${API_BASE_URL}/reports/${reportId}/export`
          : `${API_BASE_URL}/reports/${reportId}/export/${format}`;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Export failed (HTTP ${res.status})`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = type === "task" ? `task-board.${format}` : `research-report-${reportId || "export"}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setDownloadSuccess(format);
        setTimeout(() => setDownloadSuccess(null), 2500);
        toast.success(`Exported as ${format.toUpperCase()} successfully!`);
        return;
      }

      if (format !== "md") {
        toast.error("Generate and save a research report first to export PDF, DOCX, or XLSX.");
        return;
      }

      const topicTitle = query || taskTitle || "TriVisionX AI Session Export";
      const contentStr = `# ${topicTitle}

> **TriVisionX AI Enterprise Copilot** | Exported on ${new Date().toLocaleString()}

---

## Executive Session Overview
Research summary and extracted citations exported from your current workspace session.

${
  citations && citations.length > 0
    ? `### Sources & Citations\n` +
      citations
        .map((c: any, i: number) => {
          const title = typeof c === "string" ? c : c.title || c.url || c.filename || `Reference #${i + 1}`;
          const url = c.url ? ` (${c.url})` : "";
          return `${i + 1}. **${title}**${url}`;
        })
        .join("\n")
    : `*No citations attached to this session.*`
}
`;

      const fallbackBlob = new Blob([contentStr], { type: "text/markdown;charset=utf-8" });
      const fallbackUrl = window.URL.createObjectURL(fallbackBlob);
      const fallbackA = document.createElement("a");
      fallbackA.href = fallbackUrl;
      fallbackA.download = `trivisionx-${type}-${Date.now()}.md`;
      document.body.appendChild(fallbackA);
      fallbackA.click();
      window.URL.revokeObjectURL(fallbackUrl);
      document.body.removeChild(fallbackA);

      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 2500);
      toast.success("Exported as MD successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Failed to export ${format.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handlePublish = async (platform: "slack" | "teams" | "notion" | "confluence" | "jira") => {
    try {
      setIsPublishing(platform);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const isDemo = typeof window !== "undefined" && localStorage.getItem("is_demo") === "true";

      if (isDemo || !token || token === "demo_guest_token") {
        toast.error("Sign in with an account and configure Integrations to publish.");
        return;
      }

      let endpoint = "";
      if (platform === "jira" && taskId) {
        endpoint = `${API_BASE_URL}/tasks/${taskId}/export/jira`;
      } else if (reportId) {
        endpoint = `${API_BASE_URL}/reports/${reportId}/publish/${platform}`;
      } else {
        toast.error("Generate or save a report first before publishing to external channels.");
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || `Failed to publish to ${platform}`);
      }

      toast.success(data.message || `Published to ${platform.toUpperCase()} successfully!`);
      if (data.url && /^https?:\/\//i.test(data.url)) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Publishing to ${platform.toUpperCase()} failed. Check Integrations.`);
    } finally {
      setIsPublishing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[620px] p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border border-border/80 shadow-[0_24px_80px_rgba(0,0,0,0.5)] rounded-2xl md:rounded-3xl transition-all duration-300"
      >
        {/* Ambient Top Glow Mesh */}
        <div className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_70%)] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-6 pb-4 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Product Themed Icon Badge */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/30 to-purple-500/30 blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
                  <Share2 className="h-5 w-5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                    Export &amp; Integration Hub
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 border-primary/30 bg-primary/5 text-primary">
                    v2.5
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Export formatted executive reports or push directly to collaborative workspaces
                </DialogDescription>
              </div>
            </div>

            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-transparent hover:border-border transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Context Topic Capsule */}
          {(query || taskTitle) && (
            <div className="mt-4 p-2.5 px-3.5 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground font-medium shrink-0">Topic:</span>
                <span className="text-foreground font-semibold truncate">
                  {query || taskTitle}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0 bg-background/60 px-2 py-0.5 rounded-md border border-border/40">
                {type === "task" ? "Task Board" : "Research Session"}
              </span>
            </div>
          )}
        </div>

        {/* Product-Themed Segmented Tab Navigation */}
        <div className="px-6 pt-3">
          <div className="flex p-1 rounded-xl bg-muted/60 border border-border/70">
            <button
              onClick={() => setActiveTab("download")}
              className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "download"
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>File Formats (PDF, DOCX, XLSX)</span>
            </button>
            <button
              onClick={() => setActiveTab("publish")}
              className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "publish"
                  ? "bg-background text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="h-3.5 w-3.5 text-purple-500" />
              <span>Team Integrations (Slack, Notion, Jira)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-4 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin">
          {activeTab === "download" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* PDF Executive Report */}
              <button
                onClick={() => handleDownload("pdf")}
                disabled={isExporting !== null}
                className="group relative p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-red-500/15 transition-transform duration-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/30">
                    PDF Document
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-red-500 transition-colors">
                    PDF Executive Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Formatted publication layout with verified citations, headers &amp; branding
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                  <span className="font-mono">Vector Audited</span>
                  {isExporting === "pdf" ? (
                    <span className="flex items-center gap-1 text-red-500 font-semibold animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Generating PDF...
                    </span>
                  ) : downloadSuccess === "pdf" ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Check className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="group-hover:translate-x-0.5 group-hover:text-foreground transition-all flex items-center gap-1 font-medium">
                      Download <FolderDown className="h-3 w-3 opacity-70" />
                    </span>
                  )}
                </div>
              </button>

              {/* MS Word Document */}
              <button
                onClick={() => handleDownload("docx")}
                disabled={isExporting !== null}
                className="group relative p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-500/15 transition-transform duration-300">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    Word (.docx)
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors">
                    MS Word Document
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Editable document format for Microsoft 365, Google Docs &amp; LibreOffice
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                  <span className="font-mono">Office 365 Ready</span>
                  {isExporting === "docx" ? (
                    <span className="flex items-center gap-1 text-blue-500 font-semibold animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Generating DOCX...
                    </span>
                  ) : downloadSuccess === "docx" ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Check className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="group-hover:translate-x-0.5 group-hover:text-foreground transition-all flex items-center gap-1 font-medium">
                      Download <FolderDown className="h-3 w-3 opacity-70" />
                    </span>
                  )}
                </div>
              </button>

              {/* Structured Spreadsheet */}
              <button
                onClick={() => handleDownload("xlsx")}
                disabled={isExporting !== null}
                className="group relative p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500/15 transition-transform duration-300">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Excel (.xlsx)
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                    Structured Spreadsheet
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Multi-tab workbook with telemetry metrics, findings &amp; citation data
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                  <span className="font-mono">Tables &amp; Formulas</span>
                  {isExporting === "xlsx" ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Generating XLSX...
                    </span>
                  ) : downloadSuccess === "xlsx" ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Check className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="group-hover:translate-x-0.5 group-hover:text-foreground transition-all flex items-center gap-1 font-medium">
                      Download <FolderDown className="h-3 w-3 opacity-70" />
                    </span>
                  )}
                </div>
              </button>

              {/* Raw Markdown */}
              <button
                onClick={() => handleDownload("md")}
                disabled={isExporting !== null}
                className="group relative p-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 text-left flex flex-col justify-between space-y-3 cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-500/15 transition-transform duration-300">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/30">
                    Markdown (.md)
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors">
                    Raw Markdown File
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Clean GitHub Flavored Markdown (GFM) document with full metadata
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                  <span className="font-mono">GFM Syntax</span>
                  {isExporting === "md" ? (
                    <span className="flex items-center gap-1 text-purple-500 font-semibold animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Generating MD...
                    </span>
                  ) : downloadSuccess === "md" ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <Check className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="group-hover:translate-x-0.5 group-hover:text-foreground transition-all flex items-center gap-1 font-medium">
                      Download <FolderDown className="h-3 w-3 opacity-70" />
                    </span>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Slack */}
              <div className="p-3.5 px-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    #
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Slack Channel</h4>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                        Webhook Active
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Push summary card with interactive citations directly to team Slack
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish("slack")}
                  disabled={isPublishing !== null}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground shrink-0 cursor-pointer"
                >
                  {isPublishing === "slack" ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5 text-emerald-500" />}
                  Push Slack
                </Button>
              </div>

              {/* Microsoft Teams */}
              <div className="p-3.5 px-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    T
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Microsoft Teams</h4>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-indigo-500/5 text-indigo-500 border-indigo-500/20">
                        Adaptive Cards
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Send rich adaptive cards into Teams channel webhooks
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish("teams")}
                  disabled={isPublishing !== null}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground shrink-0 cursor-pointer"
                >
                  {isPublishing === "teams" ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5 text-indigo-500" />}
                  Push Teams
                </Button>
              </div>

              {/* Notion Workspace */}
              <div className="p-3.5 px-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted border border-border/80 text-foreground flex items-center justify-center font-bold text-sm">
                    N
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Notion Workspace</h4>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-muted text-muted-foreground border-border">
                        Knowledge Base
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Publish structured report page directly into Notion team pages
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish("notion")}
                  disabled={isPublishing !== null}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground shrink-0 cursor-pointer"
                >
                  {isPublishing === "notion" ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Share2 className="h-3.5 w-3.5 text-foreground" />}
                  Notion Page
                </Button>
              </div>

              {/* Confluence */}
              <div className="p-3.5 px-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Atlassian Confluence</h4>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-blue-500/5 text-blue-500 border-blue-500/20">
                        Atlassian API
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Publish formatted documentation into enterprise Confluence spaces
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish("confluence")}
                  disabled={isPublishing !== null}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground shrink-0 cursor-pointer"
                >
                  {isPublishing === "confluence" ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Share2 className="h-3.5 w-3.5 text-blue-500" />}
                  Confluence
                </Button>
              </div>

              {/* Jira Software */}
              <div className="p-3.5 px-4 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 transition-all flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                    J
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Jira Software</h4>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-sky-500/5 text-sky-500 border-sky-500/20">
                        Issue Tracker
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Create tracking ticket from findings, action items or bug reports
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish("jira")}
                  disabled={isPublishing !== null}
                  className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-primary hover:text-primary-foreground shrink-0 cursor-pointer"
                >
                  {isPublishing === "jira" ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5 text-sky-500" />}
                  Create Issue
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Product Themed Footer */}
        <div className="px-6 py-3.5 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-[11px]">
              Configure Webhooks &amp; OAuth keys in{" "}
              <a href="/dashboard?tab=integrations" className="text-primary hover:underline font-medium">
                Integrations Settings
              </a>
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
