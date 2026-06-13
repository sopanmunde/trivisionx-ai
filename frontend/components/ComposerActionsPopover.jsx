"use client";
import { useState, useRef } from "react";
import {
  Paperclip,
  Bot,
  Search,
  Palette,
  BookOpen,
  MoreHorizontal,
  Globe,
  ChevronLeft,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import RagPipelineVisualizer from "./RagPipelineVisualizer";

/* ── icon wrapper ───────────────────────────────────────────────────────── */
function ActionIcon({ icon: Icon, customIcon }) {
  if (customIcon) return customIcon;
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100/50 border border-zinc-200/50 dark:bg-zinc-800/30 dark:border-zinc-700/50 backdrop-blur-sm transition-colors group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-700/50 shadow-sm">
      <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
    </div>
  );
}

/* ── single action row ───────────────────────────────────────────────────── */
function ActionRow({ action, index, onAction }) {
  const Icon = action.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.15 }}
      onClick={() => onAction(action.action)}
      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] text-left text-zinc-700 dark:text-zinc-300 transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/10 active:scale-[0.98] hover:shadow-sm"
    >
      <ActionIcon icon={Icon} customIcon={action.customIcon} />
      <span className="font-medium flex-1 leading-none group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{action.label}</span>
      {action.badge && (
        <span className="rounded-md bg-zinc-900/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-700 dark:bg-white/10 dark:text-zinc-300 backdrop-blur-md border border-zinc-200 dark:border-zinc-700">
          {action.badge}
        </span>
      )}
    </motion.button>
  );
}

/* ── section label ───────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="px-3 pt-3 pb-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {children}
      </p>
    </div>
  );
}

/* ── divider ─────────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="mx-2.5 my-1.5 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent opacity-50" />;
}

export default function ComposerActionsPopover({ children }) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [uploadingStage, setUploadingStage] = useState(null); // 'parsing', 'chunking', etc.
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadChunks, setUploadChunks] = useState(0);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext)) {
      toast.error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
      return;
    }

    setOpen(false); // Close popover
    setIsUploading(true);
    setUploadingStage("parsing");
    setUploadProgress(10);
    setUploadChunks(0);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://trivisionx-ai-v3ot.onrender.com/api";
      const res = await fetch(`${apiUrl}/documents/upload/stream`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.stage) {
                  setUploadingStage(data.stage);
                  setUploadProgress(data.progress || 0);
                  if (data.chunks) setUploadChunks(data.chunks);
                }
                if (data.error) throw new Error(data.error);

                if (data.stage === "done") {
                  setTimeout(() => {
                    setUploadingStage(null);
                    setIsUploading(false);
                    toast.success(`Indexed ${data.chunks} chunks successfully.`);
                  }, 2000);
                }
              } catch (e) {
                // Ignore incomplete JSON
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
      setUploadingStage(null);
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mainActions = [
    {
      icon: Paperclip,
      label: isUploading ? "Uploading…" : "Add files",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      action: () => fileInputRef.current?.click(),
    },
    {
      icon: Bot,
      label: "Agent mode",
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      badge: "NEW",
      badgeStyle:
        "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
      action: () => console.log("Agent mode"),
    },
    {
      icon: Search,
      label: "Deep research",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      action: () => console.log("Deep research"),
    },
    {
      icon: Palette,
      label: "Create image",
      color: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      action: () => console.log("Create image"),
    },
    {
      icon: BookOpen,
      label: "Study and learn",
      color: "text-pink-500 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      action: () => console.log("Study and learn"),
    },
  ];

  const moreActions = [
    {
      icon: Globe,
      label: "Web search",
      color: "text-sky-500 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-500/10",
    },
    {
      icon: Palette,
      label: "Canvas",
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      customIcon: (
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/80 via-green-400/80 to-yellow-400/80 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0 border border-white/20 dark:border-white/10">
          <div className="h-2.5 w-2.5 bg-white/90 rounded shadow-sm" />
        </div>
      ),
      label: "Google Drive",
    },
    {
      customIcon: (
        <div className="h-7 w-7 rounded-lg bg-blue-500/80 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0 border border-white/20 dark:border-white/10">
          <div className="h-2.5 w-2.5 bg-white/90 rounded shadow-sm" />
        </div>
      ),
      label: "OneDrive",
    },
    {
      customIcon: (
        <div className="h-7 w-7 rounded-lg bg-teal-500/80 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0 border border-white/20 dark:border-white/10">
          <div className="h-2.5 w-2.5 bg-white/90 rounded shadow-sm" />
        </div>
      ),
      label: "SharePoint",
    },
  ];

  const handleAction = (action) => {
    action?.();
    setOpen(false);
    setShowMore(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) setShowMore(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        className="p-0 w-auto overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
        align="start"
        side="top"
        sideOffset={12}
      >
        <AnimatePresence mode="wait">
          {!showMore ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="min-w-[220px] p-1.5"
            >
              <SectionLabel>Actions</SectionLabel>

              <div className="space-y-px">
                {mainActions.map((action, i) => (
                  <ActionRow
                    key={i}
                    action={action}
                    index={i}
                    onAction={handleAction}
                  />
                ))}
              </div>

              <Divider />

              {/* More button */}
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setShowMore(true)}
                className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] text-left text-zinc-700 dark:text-zinc-300 transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/10 active:scale-[0.97] hover:shadow-sm"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100/50 dark:bg-zinc-800/30 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm group-hover:bg-zinc-200/50 dark:group-hover:bg-zinc-700/50 transition-colors">
                  <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </div>
                <span className="font-medium flex-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">More</span>
                <ChevronRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="more"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="min-w-[220px] p-1.5"
            >
              {/* Back */}
              <button
                onClick={() => setShowMore(false)}
                className="mb-1 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-zinc-500 hover:bg-white/40 dark:hover:bg-white/10 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 active:scale-[0.97]"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>

              <SectionLabel>Integrations</SectionLabel>

              <div className="space-y-px">
                {moreActions.map((action, i) => (
                  <ActionRow
                    key={i}
                    action={action}
                    index={i}
                    onAction={handleAction}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
      />

      {/* Upload Progress Modal */}
      <AnimatePresence>
        {isUploading && uploadingStage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg shadow-2xl rounded-2xl"
            >
              <RagPipelineVisualizer
                currentStage={uploadingStage}
                progress={uploadProgress}
                chunks={uploadChunks}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Popover>
  );
}
