"use client";

import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
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
  Pill,
  BookOpen,
  FileText,
  FileType,
  FileSpreadsheet,
  FileCode,
  FileJson,
  File as FileIcon,
  Archive,
  Presentation,
} from "lucide-react";
import { TriVisionXLogo } from "./TriVisionXLogo";
import { motion, AnimatePresence } from "framer-motion";
import Message from "./Message";
import Composer from "./Composer";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Textarea } from "./ui/textarea";

// â”€â”€â”€ File icon helper (mirrors Composer.jsx) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ File card shown on sent user messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MessageFileCard({ attachedFile }) {
  const info = getFileInfo(attachedFile.name);
  const Icon = info.icon;
  const shortName = attachedFile.name.length > 32 ? attachedFile.name.slice(0, 30) + "â€¦" : attachedFile.name;
  return (
    <div className="flex justify-end mb-1.5">
      <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 px-3 py-2 shadow-sm max-w-[260px]">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", info.bg)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 truncate leading-snug">{shortName}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">{info.label}</p>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Typing Indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ThinkingMessage({ onPause, agentState }) {
  const getAgentText = (state) => {
    if (state === "planner") return "Planning research strategy...";
    if (state === "retriever") return "Searching documents...";
    if (state === "summarizer") return "Analyzing findings...";
    if (state === "citation") return "Extracting citations...";
    if (state === "reporter") return "Generating report...";
    return "Thinking...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 px-2 w-full justify-start"
    >
      {/* AI avatar */}
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-sm">
        <svg
          className="w-[50%] h-[50%] text-zinc-700 dark:text-zinc-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M5 7 C5 3 19 3 19 7" />
          <line x1="5" y1="7" x2="5" y2="13" />
          <line x1="19" y1="7" x2="19" y2="13" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      </div>
      <div className="flex items-center gap-3 py-1">
        {/* Staggered dots */}
        <div className="flex items-center gap-[5px]">
          {[0, 160, 320].map((delay) => (
            <motion.div
              key={delay}
              className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
              animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: delay / 1000,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
          {getAgentText(agentState)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onPause}
          className="ml-2 h-7 rounded-full px-3 text-[11px] font-medium transition-all"
        >
          <Square className="h-2.5 w-2.5 mr-1" /> Stop
        </Button>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Suggestion Chips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SUGGESTIONS = [
  { label: "Explain a diagnosis", icon: Stethoscope },
  { label: "Summarize research", icon: BookOpen },
  { label: "Write a report", icon: FileText },
];

function EmptyState({ onSuggestion }) {
  // EmptyState is now inlined in the main render tree below for better layout integration
  return null;
}

// â”€â”€â”€ Main ChatPane â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    selectedBot,
  },
  ref,
) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const composerRef = useRef(null);
  const bottomRef = useRef(null);

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
    }),
    [],
  );

  // Auto-scroll to bottom when messages change
  const messages = Array.isArray(conversation?.messages)
    ? conversation.messages
    : [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

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
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-[#1C1C1E]">
      {messages.length === 0 ? (
        /* â”€â”€ Odysseus Centered Empty State â”€â”€ */
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-8 bg-zinc-50/20 dark:bg-[#1C1C1E]">
          <div className="flex flex-1 flex-col items-center justify-center w-full">
            <div className="w-full max-w-3xl flex flex-col items-center justify-center">
              {/* Logo & Headline */}
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mb-3 flex flex-col items-center gap-3"
                >
                  <TriVisionXLogo size="lg" glow animate={false} />
                  <h1 className="text-2xl font-bold tracking-wider text-fuchsia-600 dark:text-fuchsia-400 mb-1 leading-none">
                    TriVisionX
                  </h1>
                </motion.div>

                <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 mt-2">
                  Type <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-fuchsia-500 font-mono text-[11px] border border-zinc-200/50 dark:border-zinc-700/50">/setup</code> to get started.
                </p>

                <p className="text-[11.5px] text-zinc-500 dark:text-zinc-500 mt-1">
                  Type /setup, then choose Local models or API.
                </p>

                <div className="mt-4.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    Nobody
                  </span>
                </div>
              </div>

              <div className="w-full">
                <Composer
                  ref={composerRef}
                  onSend={async (text, mode, fileRef) => {
                    if (isThinking || isResponding || busy) {
                      onPauseThinking?.();
                      return;
                    }
                    if (!text.trim() && !fileRef) return;
                    setBusy(true);
                    await onSend?.(text, mode, fileRef);
                    setBusy(false);
                  }}
                  busy={busy || isThinking || isResponding}
                  selectedBot={selectedBot}
                />
              </div>

              {/* Suggestion pills â€” directly below Composer */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-1">
                {SUGGESTIONS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + i * 0.06, duration: 0.35 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleSuggestion(s.label)}
                      className="group rounded-full bg-background/50 backdrop-blur-sm shadow-sm transition-all hover:bg-background border-border dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:hover:bg-zinc-900/80 h-9"
                    >
                      {s.icon && (
                        <s.icon className="mr-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      )}
                      <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {s.label}
                      </span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Hint stays down of the chat panel */}
          <p className="mx-auto mt-7 text-center text-[11px] text-zinc-400/70 dark:text-zinc-600">
            trivisionx-ai can make mistakes. Verify important information.
          </p>
        </div>
      ) : (
        /* â”€â”€ Active Conversation Layout â”€â”€ */
        <>
          {/* Provider Switch Notification Banner */}
          <AnimatePresence>
            {providerSwitchEvent && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-4 py-2 text-[12px] text-amber-800 dark:text-amber-200"
              >
                <span>
                  Switched from <strong>{providerSwitchEvent.from}</strong> to{" "}
                  <strong>{providerSwitchEvent.to}</strong>
                  {providerSwitchEvent.reason === "quota_exhausted"
                    ? " (quota exhausted)"
                    : ""}
                </span>
                <button
                  onClick={onDismissProviderSwitch}
                  className="ml-2 rounded-full p-0.5 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin">
            <div className="mx-auto max-w-3xl px-4 py-8">
              <div className="space-y-6">
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
                        /* ——— Edit Mode (shadcn/ui style) ——— */
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 shadow-xs"
                        >
                          <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="w-full resize-none border-none bg-white dark:bg-zinc-950 p-3 text-[14.5px] rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-offset-0 focus-visible:border-transparent min-h-[85px] leading-relaxed"
                            autoFocus
                            placeholder="Edit message..."
                          />
                          <div className="mt-2.5 flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-8 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 cursor-pointer select-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="outline"
                              onClick={saveAndResend}
                              className="h-8 rounded-lg text-xs font-semibold px-3 cursor-pointer select-none"
                            >
                              Save & Resend
                            </Button>
                            <Button
                              onClick={saveEdit}
                              className="h-8 rounded-lg text-xs font-semibold px-3 cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 select-none"
                            >
                              Save
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        /* â”€â”€ Normal Message â”€â”€ */
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
                          />

                          {/* Hover action bar */}
                          <div
                            className={cn(
                              "mt-1.5 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                              m.role === "user"
                                ? "justify-end pr-1"
                                : "justify-start pl-12",
                            )}
                          >
                            {/* Copy */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(m.content, m.id)}
                                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                >
                                  {copiedId === m.id ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
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
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => startEdit(m)}
                                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Edit message</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onResendMessage?.(m.id)}
                                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Resend message</TooltipContent>
                                </Tooltip>
                              </>
                            )}

                            {m.role === "assistant" && (
                              <div className="flex items-center gap-0.5 ml-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Good response</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
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
                  <ThinkingMessage
                    onPause={onPauseThinking}
                    agentState={agentState}
                  />
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Composer at the bottom */}
          <Composer
            ref={composerRef}
            onSend={async (text, mode, fileRef) => {
              if (isThinking || isResponding || busy) {
                onPauseThinking?.();
                return;
              }
              if (!text.trim() && !fileRef) return;
              setBusy(true);
              await onSend?.(text, mode, fileRef);
              setBusy(false);
            }}
            busy={busy || isThinking || isResponding}
            selectedBot={selectedBot}
          />

          {/* Footer Hint below Composer */}
          <p className="mx-auto pb-4 text-center text-[11px] text-zinc-400/70 dark:text-zinc-600">
            trivisionx-aican make mistakes. Verify important information.
          </p>
        </>
      )}
    </div>
  );
});

export default ChatPane;
