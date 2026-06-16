"use client";

import { useState } from "react";
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react";
import { cls } from "./utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import ModernConfirmDialog from "./ModernConfirmDialog";

export default function ConversationRow({
  data,
  active,
  onSelect,
  onTogglePin,
  onDelete,
  onRename,
}) {
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handlePin = (e) => {
    e.stopPropagation();
    onTogglePin?.();
    setOpen(false);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    const newName = prompt(`Rename chat "${data.title}" to:`, data.title);
    if (newName && newName.trim() && newName !== data.title) {
      onRename?.(data.id, newName.trim());
    }
    setOpen(false);
  };

  const handleDeleteTrigger = (e) => {
    e.stopPropagation();
    setOpen(false);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete?.(data.id);
  };

  return (
    <div className="group relative px-1">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cls(
          "relative flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-all duration-200 border border-transparent",
          active
            ? "bg-white/60 border-white/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-violet-400"
            : "text-zinc-600 hover:bg-white/40 hover:border-white/50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:border-zinc-800/80",
        )}
      >
        {active && (
          <div className="absolute left-0 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_4px_rgba(139,92,246,0.5)] dark:bg-violet-400" />
        )}

        <div className="min-w-0 flex-1 pl-1">
          <span className="block truncate text-[12px] font-medium leading-snug">
            {data.title}
          </span>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className={cls(
                "rounded-md p-0.5 text-zinc-500 transition-all hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5",
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
              aria-label="Chat options"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={12}
            className="w-40 p-1.5 rounded-2xl border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/95 z-[9999]"
          >
            <div className="space-y-0.5">
              <button
                onClick={handlePin}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
              >
                <Pin className="h-3.5 w-3.5" />
                {data.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={handleRename}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Rename
              </button>
              <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800/50" />
              <button
                onClick={handleDeleteTrigger}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <ModernConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Chat?"
          description={`Are you sure you want to delete "${data.title}"? This conversation will be permanently removed.`}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </div>
  );
}
