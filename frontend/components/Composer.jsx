"use client";

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from "react";
import {
  Send, Loader2, Plus, Mic, StopCircle, ChevronDown,
  FlaskConical, Zap, Check, BrainCircuit, Hexagon, Asterisk,
  FileText, FileType, FileSpreadsheet, FileCode, FileJson, ImageIcon,
  Archive, File as FileIcon, X, Presentation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ComposerActionsPopover from "./ComposerActionsPopover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

// ─── Accepted file types ───────────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  ".pdf", ".docx", ".doc", ".txt", ".rtf", ".odt",
  ".xlsx", ".xls", ".csv",
  ".pptx", ".ppt",
  ".html", ".htm", ".md", ".mdx", ".rst",
  ".json", ".jsonl", ".xml", ".yaml", ".yml",
  ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".cs",
  ".go", ".rs", ".rb", ".php", ".sh", ".sql",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".svg",
  ".zip",
];
const MAX_FILE_SIZE_MB = 5;

// ─── File icon helper ──────────────────────────────────────────────────────────
function getFileInfo(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return { icon: FileType, color: "text-red-400", bg: "bg-red-500", label: "PDF" };
  if (["docx", "doc", "rtf", "odt"].includes(ext)) return { icon: FileText, color: "text-blue-400", bg: "bg-blue-500", label: ext.toUpperCase() };
  if (["xlsx", "xls", "csv"].includes(ext)) return { icon: FileSpreadsheet, color: "text-green-400", bg: "bg-green-500", label: ext.toUpperCase() };
  if (["pptx", "ppt"].includes(ext)) return { icon: Presentation, color: "text-orange-400", bg: "bg-orange-500", label: ext.toUpperCase() };
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff", "svg"].includes(ext)) return { icon: FileIcon, color: "text-purple-400", bg: "bg-purple-500", label: "Image" };
  if (["json", "jsonl", "xml", "yaml", "yml"].includes(ext)) return { icon: FileJson, color: "text-yellow-400", bg: "bg-yellow-500", label: ext.toUpperCase() };
  if (["html", "htm", "md", "mdx", "rst"].includes(ext)) return { icon: FileCode, color: "text-cyan-400", bg: "bg-cyan-500", label: ext.toUpperCase() };
  if (["py", "js", "ts", "jsx", "tsx", "java", "cpp", "c", "cs", "go", "rs", "rb", "php", "sh", "sql"].includes(ext)) return { icon: FileCode, color: "text-indigo-400", bg: "bg-indigo-500", label: ext.toUpperCase() };
  if (ext === "zip") return { icon: Archive, color: "text-zinc-400", bg: "bg-zinc-600", label: "ZIP" };
  return { icon: FileIcon, color: "text-zinc-400", bg: "bg-zinc-600", label: ext.toUpperCase() || "File" };
}

// ─── Attached file pill (ChatGPT-style) ───────────────────────────────────────
function AttachedFilePill({ file, uploading, onRemove }) {
  const info = getFileInfo(file.name);
  const Icon = info.icon;
  const shortName = file.name.length > 28 ? file.name.slice(0, 26) + "…" : file.name;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 4 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 shadow-sm max-w-[280px] relative"
    >
      {/* File icon bg */}
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", info.bg)}>
        <Icon className="h-4 w-4 text-white" />
      </div>

      <div className="overflow-hidden flex-1">
        <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100 truncate leading-snug">{shortName}</p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
          {uploading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> Indexing…
            </span>
          ) : info.label}
        </p>
      </div>

      {/* Remove button */}
      {!uploading && (
        <button
          onClick={onRemove}
          className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-300/80 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
          title="Remove attachment"
        >
          <X className="h-2.5 w-2.5 text-zinc-700 dark:text-zinc-300" />
        </button>
      )}
    </motion.div>
  );
}

// ─── Mode definitions ──────────────────────────────────────────────────────────
const MODES = [
  {
    id: "simple",
    label: "Quick",
    icon: Zap,
    description: "Direct LLM answer — fast response without document search",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "research",
    label: "Deep",
    icon: FlaskConical,
    description: "Full RAG pipeline — searches your documents & cites sources",
    gradient: "from-violet-500 to-blue-600",
  },
];

function ShadcnModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center rounded-lg bg-zinc-100/80 p-0.5 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-800/80">
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
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
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

// ─── Model Selector ───────────────────────────────────────────────────────────
const CHATBOTS = [
  { name: "Gemini", icon: <Hexagon className="h-3.5 w-3.5" />, desc: "Google DeepMind" },
  { name: "Claude Sonnet 4", icon: <BrainCircuit className="h-3.5 w-3.5" />, desc: "Anthropic" },
  { name: "Assistant", icon: <Asterisk className="h-3.5 w-3.5" />, desc: "TriVisionX" },
];

function ModelSelector() {
  const [selectedBot, setSelectedBot] = useState("Gemini");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const current = CHATBOTS.find((b) => b.name === selectedBot);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-auto sm:w-[140px] max-w-[140px] items-center justify-between whitespace-nowrap rounded-md border border-transparent bg-transparent px-2.5 py-2 text-[11.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-50"
      >
        <span className="flex items-center gap-2 truncate">
          <span className="flex h-3.5 w-3.5 items-center justify-center">{current?.icon}</span>
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
            className="absolute bottom-[calc(100%+4px)] right-0 z-[9999] min-w-[12rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:text-zinc-50"
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Select a model</div>
            {CHATBOTS.map((bot) => (
              <button
                key={bot.name}
                type="button"
                onClick={() => { setSelectedBot(bot.name); setOpen(false); }}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-50"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {selectedBot === bot.name && <Check className="h-4 w-4" />}
                </span>
                <span className="flex items-center gap-2 truncate text-xs">
                  <span className="flex h-3.5 w-3.5 items-center justify-center">{bot.icon}</span>
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
  // ── Attachment state ──
  const [attachedFile, setAttachedFile] = useState(null); // { name, type, ext }
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  useImperativeHandle(ref, () => ({
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
  }), [mode]);

  // ── Upload file to RAG backend ─────────────────────────────────────────────
  const uploadFileToRag = useCallback(async (file) => {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast.error(`Unsupported file type "${ext}".`);
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setAttachedFile({ name: file.name, ext: ext.slice(1) });
    setUploading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = API_BASE_URL;
      const res = await fetch(`${apiUrl}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      toast.success(`"${file.name}" indexed (${data.chunks} chunks)`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
      setAttachedFile(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFileToRag(file);
    e.target.value = "";
  };

  async function handleSend() {
    if ((!value.trim() && !attachedFile) || sending || busy || uploading) return;
    const text = value;
    const fileRef = attachedFile;
    setValue("");
    setAttachedFile(null);
    setSending(true);
    try {
      await onSend?.(text, mode, fileRef);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const hasContent = value.trim().length > 0 || !!attachedFile;
  const currentMode = MODES.find((m_) => m_.id === mode) || MODES[0];

  return (
    <div className="px-3 pb-2 pt-2">
      <div
        className={cn(
          "mx-auto max-w-3xl rounded-2xl border bg-background transition-all duration-200",
          isFocused
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(var(--primary),0.1)] dark:border-zinc-700/80"
            : "border-border shadow-sm dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:backdrop-blur-sm",
        )}
      >
        {/* Attached file pill — above the textarea */}
        <AnimatePresence>
          {attachedFile && (
            <div className="px-4 pt-3 pb-0">
              <AttachedFilePill
                file={attachedFile}
                uploading={uploading}
                onRemove={() => setAttachedFile(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="px-4 pt-3.5 pb-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              attachedFile
                ? `Ask anything about "${attachedFile.name}"…`
                : mode === "research"
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
              <ComposerActionsPopover onFileSelect={uploadFileToRag}>
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
                  disabled={(!hasContent && !busy) || uploading}
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

      {/* Hidden file input */}
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
});

export default Composer;
