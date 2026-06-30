"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, Copy, Edit3, Trash2 } from "lucide-react";
import ActionMenu from "./ActionMenu";
import ModernConfirmDialog from "./ModernConfirmDialog";

export default function TemplateRow({
  template,
  onUseTemplate,
  onEditTemplate,
  onRenameTemplate,
  onDeleteTemplate,
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleRename = () => {
    const newName = prompt(
      `Rename template "${template.name}" to:`,
      template.name,
    );
    if (newName && newName.trim() && newName !== template.name) {
      onRenameTemplate?.(template.id, newName.trim());
    }
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDeleteTemplate?.(template.id);
  };

  const items = [
    {
      icon: Copy,
      label: "Use Template",
      onClick: () => onUseTemplate?.(template),
    },
    {
      icon: Edit3,
      label: "Edit",
      onClick: () => onEditTemplate?.(template),
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
    <div className="group">
      <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-all duration-200 border border-transparent hover:bg-accent/30 hover:border-border/50 hover:shadow-xs">
        <button
          onClick={() => onUseTemplate?.(template)}
          className="group/btn flex items-center gap-2 flex-1 text-left min-w-0"
          title={`Use template: ${template.snippet}`}
        >
          <FileText className="h-4 w-4 text-muted-foreground shrink-0 group-hover/btn:text-foreground transition-colors" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-card-foreground group-hover/btn:text-foreground transition-colors">{template.name}</div>
            <div className="truncate text-xs text-muted-foreground group-hover/btn:text-foreground/80 transition-colors">
              {template.snippet}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <span className="hidden group-hover:inline text-xs text-muted-foreground px-1">
            Use
          </span>

          <ActionMenu
            items={items}
            side="right"
            align="start"
            sideOffset={12}
          >
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent transition-opacity"
              aria-label="Template options"
            >
              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
            </button>
          </ActionMenu>
        </div>
      </div>

      <ModernConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Template?"
        description={`Are you sure you want to delete the template "${template.name}"? This template will be permanently removed.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
