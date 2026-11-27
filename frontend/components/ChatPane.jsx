"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Pencil,
  RefreshCw,
  Check,
  X,
  Square,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Stethoscope,
  BookOpen,
  FileText,
  FileType,
  FileSpreadsheet,
  FileCode,
  FileJson,
  File as FileIcon,
  Archive,
  Presentation,
  Bot,
  ChevronDown,
  FlaskConical,
  Code2,
  BarChart3,
  Globe,
  FileSearch,
  Route,
  BrainCircuit,
  Layers,
  Loader2,
} from "lucide-react";
import { TriVisionXLogo } from "./TriVisionXLogo";
import { motion, AnimatePresence } from "framer-motion";
import Message from "./Message";
import Composer from "./Composer";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

function getFileInfo(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return { icon: FileType, bg: "bg-red-500", label: "PDF" };
  if (["docx", "doc", "rtf", "odt"].includes(ext)) return { icon: FileText, bg: "bg-blue-500", label: ext.toUpperCase() };
  if (["xlsx", "xls", "csv"].includes(ext)) return { icon: FileSpreadsheet, bg: "bg-green-500", label: ext.toUpperCase() };
  if (["pptx", "ppt"].includes(ext)) return { icon: Presentation, bg: "bg-orange-500", label: ext.toUpperCase() };
  if (["json", "jsonl", "xml", "yaml", "yml"].includes(ext)) return { icon: FileJson, bg: "bg-yellow-500", label: ext.toUpperCase() };
  if (["html", "htm", "md", "mdx", "rst"].includes(ext)) return { icon: FileCode, bg: "bg-cyan-500", label: ext.toUpperCase() };
  if (["py", "js", "ts", "jsx", "tsx", "java", "cpp", "c", "cs", "go", "rs", "rb", "php", "sh", "sql"].includes(ext)) return { icon: FileCode, bg: "bg-indigo-500", label: ext.toUpperCase() };
  if (ext === "zip") return { icon: Archive, bg: "bg-zinc-600", label: "ZIP" };
  return { icon: FileIcon, bg: "bg-zinc-600", label: ext.toUpperCase() || "File" };
}

function MessageFileCard({ attachedFile }) {
  const info = getFileInfo(attachedFile.name);
  const Icon = info.icon;
  const shortName = attachedFile.name.length > 32 ? attachedFile.name.slice(0, 30) + "…" : attachedFile.name;
  return (
    <div className="flex justify-end mb-2">
      <Card className="flex items-center gap-2.5 rounded-xl border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 px-3 py-2 shadow-xs max-w-[280px]">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm text-white", info.bg)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-snug">{shortName}</p>
          <Badge variant="secondary" className="mt-0.5 text-[9px] px-1.5 py-0.5 font-bold tracking-wider leading-none">
            {info.label}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

function ThinkingMessage({ onPause, agentState }) {
  const getAgentInfo = (state) => {
    switch (state) {
      case "supervisor":
        return { label: "Supervisor Agent", desc: "Analyzing request intent & selecting optimal pipeline...", color: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300" };
      case "voice_preprocessor":
        return { label: "Voice Preprocessor", desc: "Transcribing and cleaning voice input...", color: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300" };
      case "planner":
        return { label: "Research Planner", desc: "Formulating multi-step research plan & query routing...", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" };
      case "memory_retriever":
        return { label: "Memory Recall", desc: "Querying historical conversation memory database...", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300" };
      case "vision_extractor":
        return { label: "Vision Document Extractor", desc: "Extracting OCR text, charts, and tables from file...", color: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300" };
      case "retriever":
        return { label: "Document Vector Retriever", desc: "Executing MMR semantic search over Pinecone chunks...", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" };
      case "web_researcher":
        return { label: "Web Search Analyst", desc: "Performing web query search for live data...", color: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300" };
      case "citation":
        return { label: "Citation Validator", desc: "Scoring snippet relevance confidence & deduplicating...", color: "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300" };
      case "summarizer":
        return { label: "Synthesis Summarizer", desc: "Synthesizing evidence & drafting structured response...", color: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300" };
      case "reporter":
        return { label: "Report Assembly", desc: "Formatting final markdown report & quality evaluation...", color: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300" };
      case "code_generation":
        return { label: "Code Generator", desc: "Synthesizing clean code implementation...", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300" };
      case "code_review":
        return { label: "Code Reviewer", desc: "Scanning generated code for logic & security...", color: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300" };
      case "testing":
        return { label: "Test Runner", desc: "Executing verification test cases...", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" };
      case "data_analysis":
        return { label: "Data Analyst", desc: "Processing numerical data datasets...", color: "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300" };
      default:
        return { label: "Agent Pipeline", desc: "Orchestrating agent workflow execution...", color: "border-primary/30 bg-primary/10 text-primary" };
    }
  };

  const agentInfo = getAgentInfo(agentState);

  return (
    <div className="flex gap-2.5 sm:gap-4 px-1 sm:px-2 w-full justify-start">
      <Avatar className="mt-1 h-7 w-7 sm:h-8 sm:w-8 border border-border bg-muted shrink-0">
        <AvatarFallback className="bg-muted text-foreground">
          <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 py-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />

          <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 truncate max-w-[200px] sm:max-w-none", agentInfo.color)}>
            {agentInfo.label}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            className="ml-auto sm:ml-2 h-6 rounded-md px-2 text-[10px] font-medium border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
          >
            <Square className="h-2 w-2 mr-1 fill-current" /> Stop
          </Button>
        </div>

        <p className="text-[11.5px] sm:text-[12.5px] font-mono text-muted-foreground mt-0.5 break-words">
          {agentInfo.desc}
        </p>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  {
    label: "Deep Cited Research",
    icon: FlaskConical,
    mode: "research",
    prompt: "Execute a deep cited research overview on my uploaded documents.",
  },
  {
    label: "Run Code Sandbox",
    icon: Code2,
    mode: "agent",
    prompt: "Write and execute Python code in sandbox to analyze data.",
  },
  {
    label: "Live Web Grounding",
    icon: Globe,
    mode: "web",
    prompt: "Search the live web for current breakthrough updates and summarize findings.",
  },
  {
    label: "Workspace Briefing",
    icon: Layers,
    mode: "chat",
    prompt: "Review my upcoming calendar schedule and summarize high-priority tasks.",
  },
  {
    label: "Competitive Matrix",
    icon: BarChart3,
    mode: "research",
    prompt: "Generate a competitive comparison matrix between market solutions.",
  },
];

const ChatPane = forwardRef(function ChatPane(
  {
    conversation,
    onSend,
    onEditMessage,
    onResendMessage,
    isThinking,
    isResponding,
    onPauseThinking,
    agentState,
    providerSwitchEvent,
    onDismissProviderSwitch,
    supervisorDecision,
    selectedBot,
    user,
    onNavigateTo,
    onAddNewSkill,
  },
  ref,
) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const composerRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const switchTimerRef = useRef(null);

  useEffect(() => {
    if (providerSwitchEvent) {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      switchTimerRef.current = setTimeout(() => {
        onDismissProviderSwitch?.();
      }, 6000);
    }
    return () => {
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    };
  }, [providerSwitchEvent, onDismissProviderSwitch]);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) =>
        composerRef.current?.insertTemplate(templateContent),
      getSelectedBot: () =>
        composerRef.current?.getSelectedBot(),
      setMode: (m) =>
        composerRef.current?.setMode?.(m),
      setValue: (val) =>
        composerRef.current?.setValue?.(val),
      focus: () =>
        composerRef.current?.focus?.(),
    }),
    [],
  );

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 150);
  }, []);

  const messages = Array.isArray(conversation?.messages)
    ? conversation.messages
    : [];
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 250) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, isThinking]);

  function scrollToBottom() {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowScrollBtn(false);
  }

  const handleFeatureLaunch = (item) => {
    if (item.mode && composerRef.current?.setMode) {
      composerRef.current.setMode(item.mode);
    }
    if (composerRef.current?.setValue) {
      composerRef.current.setValue(item.prompt);
      composerRef.current.focus?.();
    }
  };

  function handleSuggestion(text) {
    composerRef.current?.setValue?.(text);
    composerRef.current?.focus?.();
  }

  function startEdit(m) {
    setEditingId(m.id);
    setDraft(m.content);
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft("");
  }
  function saveEdit() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    cancelEdit();
  }
  function saveAndResend() {
    if (!editingId) return;
    onEditMessage?.(editingId, draft);
    onResendMessage?.(editingId);
    cancelEdit();
  }

  async function copyToClipboard(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { }
  }

  if (!conversation) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background text-foreground relative overflow-hidden">

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 sm:px-6 py-5 sm:py-8 bg-transparent relative z-10 scrollbar-thin">
          <div className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl mx-auto pt-6 sm:pt-0">
            {/* Top Logo & Greeting */}
            <div className="w-full max-w-2xl flex flex-col items-center justify-center mb-4 sm:mb-6 text-center">
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                <TriVisionXLogo size="lg" animate={false} />
                <div className="flex flex-col items-center gap-1 sm:gap-1.5 px-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                    Hello{user?.first_name ? `, ${user.first_name}` : ""}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    Autonomous Multi-Agent Workspace with Deep Citations & Live Sandbox
                  </p>
                </div>
              </div>
            </div>

            {/* Central Composer Input */}
            <div className="w-full max-w-3xl relative z-10 mb-4 sm:mb-5">
              <Composer
                ref={composerRef}
                onSend={async (text, mode, fileRef, activeFeatures) => {
                  if (isThinking || isResponding || busy) {
                    onPauseThinking?.();
                    return;
                  }
                  if (!text.trim() && !fileRef) return;
                  setBusy(true);
                  await onSend?.(text, mode, fileRef, activeFeatures);
                  setBusy(false);
                }}
                busy={busy || isThinking || isResponding}
                selectedBot={selectedBot}
                onNavigateTo={onNavigateTo}
                onAddNewSkill={onAddNewSkill}
              />
            </div>

            {/* Quick Prompt Pills — Clean shadcn outline buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 relative z-10">
              {QUICK_PROMPTS.map((s) => {
                const Icon = s.icon;
                return (
                  <Button
                    key={s.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeatureLaunch(s)}
                    className="rounded-full h-8 px-3.5 gap-1.5 text-xs font-medium bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="whitespace-nowrap">{s.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer Hint */}
          <div className="mx-auto mt-6 text-center text-[10.5px] sm:text-[11px] text-zinc-500/80 dark:text-zinc-400/80 flex items-center justify-center gap-2 flex-wrap">
            <span>AI can make mistakes. Verify important information.</span>
            <span className="opacity-40">•</span>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              Type <code className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[10.5px] border border-zinc-300/60 dark:border-zinc-700/60 font-bold">/</code> for skills & tools
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Active Conversation Telemetry & Session Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background px-3 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center gap-2 min-w-0 pl-11 lg:pl-0">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg border border-border bg-card shadow-2xs shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[12px] sm:text-[13px] font-semibold text-foreground truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">
                  {typeof selectedBot === "string" ? selectedBot : (selectedBot?.name || "TriVisionX Autonomous Core")}
                </span>
                <Badge variant="outline" className="hidden sm:inline-flex text-[9.5px] px-1.5 py-0 font-medium tracking-wide border-primary/20 text-primary bg-primary/5">
                  Autonomous Swarm
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isThinking || isResponding ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                )} />
                <span className="hidden xs:inline">
                  {isThinking ? "Thinking" : isResponding ? "Responding" : "Ready"}
                </span>
                <span className="text-muted-foreground/60">•</span>
                <span>{messages.length} msg{messages.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          {/* Provider Switch Notification Banner */}
          <AnimatePresence>
            {providerSwitchEvent && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-2 bg-muted/60 border-b border-border px-4 py-2 text-[11.5px] sm:text-[12px] text-amber-800 dark:text-amber-300 font-medium relative z-10"
              >
                <span className="truncate">
                  Switched from <strong>{providerSwitchEvent.from}</strong> to{" "}
                  <strong>{providerSwitchEvent.to}</strong>
                  {providerSwitchEvent.reason === "quota_exhausted"
                    ? " (quota exhausted)"
                    : ""}
                </span>
                <button
                  onClick={onDismissProviderSwitch}
                  className="ml-2 rounded-full p-0.5 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages scroll area — native div so scrollIntoView works reliably */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto relative z-10 scroll-smooth"
          >
            <div className="mx-auto max-w-4xl px-2.5 sm:px-4 md:px-6 py-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="group"
                    >
                      {editingId === m.id ? (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="border-border bg-card shadow-sm">
                            <CardContent className="p-3">
                              <Textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="w-full resize-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 sm:p-3 text-[13.5px] sm:text-[14px] rounded-lg shadow-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 min-h-[90px] leading-relaxed transition-all"
                                autoFocus
                                placeholder="Edit message..."
                              />
                              <div className="mt-3 flex items-center justify-end gap-1.5 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={cancelEdit}
                                  className="h-8 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2.5 sm:px-3 cursor-pointer select-none"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={saveAndResend}
                                  className="h-8 rounded-lg text-xs font-semibold px-2.5 sm:px-3 cursor-pointer select-none border-zinc-200 dark:border-zinc-800"
                                >
                                  Save & Resend
                                </Button>
                                <Button
                                  onClick={saveEdit}
                                  className="h-8 rounded-lg text-xs font-semibold px-2.5 sm:px-3 cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 select-none shadow-xs"
                                >
                                  Save
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        <div className="relative">
                          {/* File card above user message */}
                          {m.role === "user" && m.attachedFile && (
                            <MessageFileCard attachedFile={m.attachedFile} />
                          )}
                          <Message
                            role={m.role}
                            content={m.content}
                            sources={m.sources}
                            quality_score={m.quality_score}
                            agent_steps={m.agent_steps}
                            source_heatmap={m.source_heatmap}
                          />

                          {/* Hover action bar — accessible touch on mobile, hover on desktop */}
                          <div
                            className={cn(
                              "mt-1.5 flex items-center gap-1 sm:gap-1.5 transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100",
                              m.role === "user"
                                ? "justify-end pr-1 sm:pr-2"
                                : "justify-start pl-8 sm:pl-10 md:pl-12",
                            )}
                          >
                            {/* Copy */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyToClipboard(m.content, m.id)}
                                  className="h-7 w-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs transition-colors shrink-0"
                                >
                                  {copiedId === m.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Copy to clipboard</TooltipContent>
                            </Tooltip>

                            {m.role === "user" && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => startEdit(m)}
                                      className="h-7 w-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs transition-colors shrink-0"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Edit message</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => onResendMessage?.(m.id)}
                                      className="h-7 w-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs transition-colors shrink-0"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Resend message</TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            {m.role === "assistant" && (
                              <div className="flex items-center gap-1 sm:gap-1.5 ml-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs transition-colors">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Good response</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-xs transition-colors">
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Bad response</TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isThinking && (
                  <>
                    {/* Supervisor Decision Inline Card — Shadcn UI + Magic UI Colors */}
                    {supervisorDecision && agentState !== "supervisor" && (() => {
                      const agentThemeMap = {
                        coding: {
                          bg: "from-indigo-500/15 via-blue-500/10 to-cyan-500/15 dark:from-indigo-950/50 dark:via-blue-950/40 dark:to-cyan-950/50 border-indigo-500/40 dark:border-indigo-400/40 shadow-indigo-500/10",
                          text: "text-indigo-600 dark:text-indigo-400",
                          badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
                        },
                        data_analysis: {
                          bg: "from-emerald-500/15 via-teal-500/10 to-cyan-500/15 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-cyan-950/50 border-emerald-500/40 dark:border-emerald-400/40 shadow-emerald-500/10",
                          text: "text-emerald-600 dark:text-emerald-400",
                          badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                        },
                        research: {
                          bg: "from-violet-500/15 via-purple-500/10 to-indigo-500/15 dark:from-violet-950/50 dark:via-purple-950/40 dark:to-indigo-950/50 border-violet-500/40 dark:border-violet-400/40 shadow-violet-500/10",
                          text: "text-violet-600 dark:text-violet-400",
                          badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
                        },
                        technical: {
                          bg: "from-amber-500/15 via-orange-500/10 to-yellow-500/15 dark:from-amber-950/50 dark:via-orange-950/40 dark:to-yellow-950/50 border-amber-500/40 dark:border-amber-400/40 shadow-amber-500/10",
                          text: "text-amber-600 dark:text-amber-400",
                          badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                        },
                        competitive: {
                          bg: "from-rose-500/15 via-pink-500/10 to-purple-500/15 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-purple-950/50 border-rose-500/40 dark:border-rose-400/40 shadow-rose-500/10",
                          text: "text-rose-600 dark:text-rose-400",
                          badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
                        },
                        summary: {
                          bg: "from-blue-500/15 via-sky-500/10 to-indigo-500/15 dark:from-blue-950/50 dark:via-sky-950/40 dark:to-indigo-950/50 border-blue-500/40 dark:border-blue-400/40 shadow-blue-500/10",
                          text: "text-blue-600 dark:text-blue-400",
                          badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                        },
                      };

                      const agentKey = supervisorDecision.selected_agent?.toLowerCase() || "research";
                      const theme = agentThemeMap[agentKey] || agentThemeMap.research;

                      return (
                        <div className="flex gap-2 sm:gap-4 px-1 sm:px-2 w-full justify-start mb-2">
                          <div className="ml-0 sm:ml-9 md:ml-12 flex items-start gap-2.5 sm:gap-3 rounded-xl border border-border bg-card px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs w-full max-w-full sm:max-w-xl">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                              <Route className={cn("h-4 w-4", theme.text)} />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", theme.text)}>
                                  Supervisor Agent
                                </span>
                                <Badge variant="secondary" className={cn("text-[9.5px] px-2 py-0.5 font-mono font-semibold tracking-wider rounded-md border", theme.badge)}>
                                  {supervisorDecision.selected_agent?.toUpperCase()}
                                </Badge>
                                {(supervisorDecision.trip_constraint || supervisorDecision.tripconstraint) && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono tracking-wider text-muted-foreground border-border bg-muted/40">
                                    {supervisorDecision.trip_constraint || supervisorDecision.tripconstraint}
                                  </Badge>
                                )}
                              </div>
                              {supervisorDecision.reasoning && (
                                <p className="text-[11.5px] text-foreground/90 leading-snug font-medium break-words">
                                  {supervisorDecision.reasoning}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <ThinkingMessage
                      onPause={onPauseThinking}
                      agentState={agentState}
                    />
                  </>
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Scroll-to-bottom button — sits just above the composer */}
          {showScrollBtn && (
            <div className="relative z-20 flex justify-center py-1 sm:py-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={scrollToBottom}
                className="h-8 w-8 rounded-full bg-background border-border shadow-sm hover:bg-accent cursor-pointer"
                aria-label="Scroll to bottom"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Composer at the bottom */}
          <div className="relative z-10 w-full px-2 sm:px-4">
            <Composer
              ref={composerRef}
              onSend={async (text, mode, fileRef, activeFeatures, isVoice = false) => {
                if (isThinking || isResponding || busy) {
                  onPauseThinking?.();
                  return;
                }
                if (!text.trim() && !fileRef) return;
                setBusy(true);
                await onSend?.(text, mode, fileRef, activeFeatures, isVoice);
                setBusy(false);
              }}
              busy={busy || isThinking || isResponding}
              selectedBot={selectedBot}
              onNavigateTo={onNavigateTo}
              onAddNewSkill={onAddNewSkill}
            />
          </div>

          {/* Footer Hint below Composer */}
          <p className="mx-auto pb-3 sm:pb-4 pt-1 text-center text-[10px] sm:text-[11px] text-zinc-500/80 dark:text-zinc-400/80 relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-2">
            <span>AI can make mistakes. Verify important information.</span>
            <span className="opacity-40">•</span>
            <span className="font-medium text-zinc-600 dark:text-zinc-300">
              Type <code className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[10px] border border-zinc-300/60 dark:border-zinc-700/60 font-bold">/</code> for setup & tools
            </span>
          </p>

        </>
      )}
    </div>
  );
});

export default ChatPane;
