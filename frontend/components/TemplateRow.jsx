"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, MoreHorizontal, Copy, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import ModernConfirmDialog from "./ModernConfirmDialog";

export default function TemplateRow({
  template,
  onUseTemplate,
  onEditTemplate,
  onRenameTemplate,
  onDeleteTemplate,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleUse = () => {
    onUseTemplate?.(template);
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEditTemplate?.(template);
    setShowMenu(false);
  };

  const handleRename = () => {
    const newName = prompt(
      `Rename template "${template.name}" to:`,
      template.name,
    );
    if (newName && newName.trim() && newName !== template.name) {
      onRenameTemplate?.(template.id, newName.trim());
    }
    setShowMenu(false);
  };

  const handleDeleteTrigger = () => {
    setShowMenu(false);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDeleteTemplate?.(template.id);
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-all duration-200 border border-transparent hover:bg-white/40 hover:border-white/50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:hover:bg-zinc-900/60 dark:hover:border-zinc-800/80">
        <button
          onClick={handleUse}
          className="group/btn flex items-center gap-2 flex-1 text-left min-w-0"
          title={`Use template: ${template.snippet}`}
        >
          <FileText className="h-4 w-4 text-zinc-500 shrink-0 group-hover/btn:text-fuchsia-500 dark:text-zinc-500 dark:group-hover/btn:text-fuchsia-400 transition-colors" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-zinc-700 group-hover/btn:text-zinc-900 dark:text-zinc-300 dark:group-hover/btn:text-zinc-100 transition-colors">{template.name}</div>
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400 group-hover/btn:text-zinc-600 dark:group-hover/btn:text-zinc-300 transition-colors">
              {template.snippet}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <span className="hidden group-hover:inline text-xs text-zinc-500 dark:text-zinc-400 px-1">
            Use
          </span>

          <Popover open={showMenu} onOpenChange={setShowMenu}>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:hover:bg-[#2f2f2f] transition-opacity"
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
                  onClick={handleUse}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Use Template
                </button>
                <button
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleRename}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Rename
                </button>
                <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800/50" />
                <button
                  onClick={handleDeleteTrigger}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </PopoverContent>
          </Popover>
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
