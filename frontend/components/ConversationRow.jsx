"use client";

import { useState } from "react";
import { MoreHorizontal, Pin, Edit3, Trash2 } from "lucide-react";
import { cls } from "./utils";
import ActionMenu from "./ActionMenu";
import ModernConfirmDialog from "./ModernConfirmDialog";

export default function ConversationRow({
  data,
  active,
  onSelect,
  onTogglePin,
  onDelete,
  onRename,
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleRename = () => {
    const newName = prompt(`Rename chat "${data.title}" to:`, data.title);
    if (newName && newName.trim() && newName !== data.title) {
      onRename?.(data.id, newName.trim());
    }
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete?.(data.id);
  };

  const items = [
    {
      icon: Pin,
      label: data.pinned ? "Unpin" : "Pin",
      onClick: () => onTogglePin?.(),
    },
    {
      icon: Edit3,
      label: "Rename",
      onClick: handleRename,
    },
    { separator: true },
    {
      icon: Trash2,
      label: "Delete",
      danger: true,
      onClick: () => setDeleteConfirmOpen(true),
    },
  ];

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
            ? "bg-accent/60 border-border shadow-sm text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/30 hover:border-border/50 hover:shadow-xs dark:text-muted-foreground dark:hover:bg-accent/20 dark:hover:border-border/50",
        )}
      >
        {active && (
          <div className="absolute left-0 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
        )}

        <div className="min-w-0 flex-1 pl-1">
          <span className="block truncate text-[11px] font-medium leading-snug">
            {data.title}
          </span>
        </div>

        <ActionMenu
          items={items}
          side="right"
          align="start"
          sideOffset={12}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded-md p-0.5 text-muted-foreground transition-all hover:bg-accent/50 opacity-0 group-hover:opacity-100"
            aria-label="Chat options"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </ActionMenu>

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
