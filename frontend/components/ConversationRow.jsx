"use client";

import { useState } from "react";
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react";
import { cls } from "./utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function ConversationRow({
  data,
  active,
  onSelect,
  onTogglePin,
  onDelete,
  onRename,
}) {
  const [open, setOpen] = useState(false);

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

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
      onDelete?.(data.id);
    }
    setOpen(false);
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
          "relative flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left transition-all duration-100",
          active
            ? "bg-zinc-200/80 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-800/50",
        )}
      >
        {active && (
          <div className="absolute left-0 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-zinc-900 dark:bg-zinc-300" />
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
            className="w-40 p-1.5 rounded-2xl border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/95"
          >
            <div className="space-y-0.5">
              <button
                onClick={handlePin}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
              >
                <Pin className="h-3.5 w-3.5" />
                {data.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={handleRename}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Rename
              </button>
              <div className="my-1 h-px bg-zinc-100 dark:bg-white/[0.05]" />
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
