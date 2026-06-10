"use client";

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Send, Loader2, Plus, Mic, StopCircle, Paperclip, ChevronDown, FlaskConical, Zap, BookOpen, Asterisk, Check, Bot, BrainCircuit, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ComposerActionsPopover from "./ComposerActionsPopover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// ─── Mode definitions ──────────────────────────────────────────────────────────
const MODES = [
  {
    id: "simple",
    label: "Quick",
    shortLabel: "Quick",
    icon: Zap,
    description: "Direct LLM answer — fast response without document search",
    gradient: "from-amber-400 to-orange-500",
    badge: "LLM",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ringColor: "ring-amber-400/30",
    dotColor: "bg-amber-400",
  },
  {
    id: "research",
    label: "Deep",
    shortLabel: "Deep",
    icon: FlaskConical,
    description: "Full RAG pipeline — searches your documents & cites sources",
    gradient: "from-violet-500 to-blue-600",
    badge: "RAG",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    ringColor: "ring-violet-400/30",
    dotColor: "bg-violet-500",
  },
];

// ─── Mode Selector Dropdown ───────────────────────────────────────────────────
// ─── Shadcn UI style Mode Toggle ──────────────────────────────────────────────
function ShadcnModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center rounded-lg bg-zinc-100/80 p-0.5 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 max-w-full overflow-x-auto scrollbar-hide">
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(m.id); }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 whitespace-nowrap",
              isActive
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
            title={m.description}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Model Selector ──────────────────────────────────────────────────────────
const CHATBOTS = [
  { name: "GPT-5", icon: <Bot className="h-3.5 w-3.5" />, desc: "OpenAI's latest" },
  { name: "Claude Sonnet 4", icon: <BrainCircuit className="h-3.5 w-3.5" />, desc: "Anthropic" },
  { name: "Gemini", icon: <Hexagon className="h-3.5 w-3.5" />, desc: "Google DeepMind" },
  {
    name: "Assistant",
    icon: <Asterisk className="h-3.5 w-3.5" />,
    desc: "AI Research Assistant",
  },
];

function ModelSelector() {
  const [selectedBot, setSelectedBot] = useState("GPT-5");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const current = CHATBOTS.find((b) => b.name === selectedBot);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-[140px] items-center justify-between whitespace-nowrap rounded-md border border-transparent bg-transparent px-2.5 py-2 text-[11.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-300"
      >
        <span className="flex items-center gap-2 truncate">
          {typeof current?.icon === "string" ? (
            <span className="text-[13px] leading-none">{current.icon}</span>
          ) : (
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {current?.icon}
            </span>
          )}
          <span className="truncate">{selectedBot}</span>
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[calc(100%+4px)] right-0 z-[9999] min-w-[12rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Select a model
            </div>
            {CHATBOTS.map((bot) => (
              <button
                key={bot.name}
                type="button"
                onClick={() => {
                  setSelectedBot(bot.name);
                  setOpen(false);
                }}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {selectedBot === bot.name && (
                    <Check className="h-4 w-4" />
                  )}
                </span>
                <span className="flex items-center gap-2 truncate text-xs">
                  {typeof bot.icon === "string" ? (
                    <span className="text-[13px] leading-none">{bot.icon}</span>
                  ) : (
                    <span className="flex h-3.5 w-3.5 items-center justify-center">
                      {bot.icon}
                    </span>
                  )}
                  {bot.name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Composer ────────────────────────────────────────────────────────────
const Composer = forwardRef(function Composer({ onSend, busy, defaultMode = "research" }, ref) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState(defaultMode);
  const inputRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    if (!inputRef.current) return;
    const ta = inputRef.current;
    const lineHeight = 24;
    ta.style.height = "auto";
    const lines = Math.max(1, Math.ceil(ta.scrollHeight / lineHeight));
    if (lines <= 12) {
      ta.style.height = `${Math.max(24, ta.scrollHeight)}px`;
      ta.style.overflowY = "hidden";
    } else {
      ta.style.height = `${12 * lineHeight}px`;
      ta.style.overflowY = "auto";
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        setValue((prev) => {
          const next = prev ? `${prev}\n\n${templateContent}` : templateContent;
          setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(next.length, next.length);
          }, 0);
          return next;
        });
      },
      setValue: (text) => {
        setValue(text);
        setTimeout(() => inputRef.current?.focus(), 0);
      },
      focus: () => inputRef.current?.focus(),
      getMode: () => mode,
    }),
    [mode],
  );

  async function handleSend() {
    if (!value.trim() || sending || busy) return;
    const text = value;
    setValue("");
    setSending(true);
    try {
      // Pass both text and the current mode to the parent
      await onSend?.(text, mode);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const hasContent = value.trim().length > 0;
  const currentMode = MODES.find((m_) => m_.id === mode) || MODES[0];

  return (
    <div className="px-3 pb-2 pt-2">
      {/* Input card — NOTE: no overflow-hidden so the mode dropdown can escape upward */}
      <div
        className={cn(
          "mx-auto max-w-3xl rounded-2xl border bg-background transition-all duration-200",
          isFocused
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(var(--primary),0.1)]"
            : "border-border shadow-sm",
        )}
      >
        {/* Top focus highlight bar */}
        {isFocused && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        )}

        {/* Textarea */}
        <div className="px-4 pt-3.5 pb-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              mode === "research"
                ? "Ask a research question… (searches your documents)"
                : "Ask anything… (quick LLM answer)"
            }
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground scrollbar-thin"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-2 pb-2 pt-1 gap-2">
          {/* Left: Attach + Mode selector */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <ComposerActionsPopover>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
              </ComposerActionsPopover>
              <TooltipContent side="top">Attach file</TooltipContent>
            </Tooltip>

            {/* ── Mode Toggle ── */}
            <ShadcnModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* Right: Model + Mic + Send */}
          <div className="flex items-center gap-1.5">
            <ModelSelector />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex items-center justify-center">
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
                      <span className="absolute -inset-1 rounded-full animate-pulse bg-red-500/20" />
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsListening(!isListening)}
                    className={cn(
                      "relative h-8 w-8 rounded-full transition-all duration-300",
                      isListening
                        ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isListening ? "Listening... Click to stop" : "Voice input"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={!hasContent && !busy}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    hasContent || busy
                      ? `bg-gradient-to-br ${currentMode.gradient} text-white shadow-md hover:opacity-90 hover:scale-105`
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                  )}
                >
                  {sending || busy ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {busy ? "Stop" : `Send · ${currentMode.label} mode`}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Composer;
