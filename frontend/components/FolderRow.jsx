"use client";

import { useState } from "react";
import {
  FolderIcon,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit3,
  Trash2,
} from "lucide-react";
import ConversationRow from "./ConversationRow";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import ModernConfirmDialog from "./ModernConfirmDialog";

export default function FolderRow({
  name,
  count,
  conversations = [],
  selectedId,
  onSelect,
  togglePin,
  onDeleteFolder,
  onRenameFolder,
  onDeleteConversation,
  onRenameConversation,
  // Controlled accordion — parent controls open state
  isExpanded,
  onToggle,
}) {
  const [open, setOpen] = useState(false);

  // Support both controlled (isExpanded/onToggle) and local state
  const [localExpanded, setLocalExpanded] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setLocalExpanded((v) => !v);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    const newName = prompt(`Rename folder "${name}" to:`, name);
    if (newName && newName.trim() && newName !== name) {
      onRenameFolder?.(name, newName.trim());
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
    onDeleteFolder?.(name);
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-all duration-200 border border-transparent hover:bg-white/40 hover:border-white/50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:hover:bg-zinc-900/60 dark:hover:border-zinc-800/80">
        <button
          onClick={handleToggle}
          className="group/btn flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center transition-colors">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-zinc-500 group-hover/btn:text-violet-500 dark:text-zinc-500 dark:group-hover/btn:text-violet-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-zinc-500 group-hover/btn:text-violet-500 dark:text-zinc-500 dark:group-hover/btn:text-violet-400" />
            )}
          </div>
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover/btn:text-violet-500 dark:text-zinc-500 dark:group-hover/btn:text-violet-400 transition-colors" />
          <span className="truncate text-[12px] font-medium text-zinc-700 group-hover/btn:text-zinc-900 dark:text-zinc-300 dark:group-hover/btn:text-zinc-100 transition-colors">
            {name}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] font-medium text-zinc-400">{count}</span>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
              >
                <MoreHorizontal className="h-3 w-3 text-zinc-500" />
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
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-5 border-l border-zinc-200/60 dark:border-zinc-800/60 pl-1 space-y-0.5 py-1">
              {conversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  data={conversation}
                  active={conversation.id === selectedId}
                  onSelect={() => onSelect(conversation.id)}
                  onTogglePin={() => togglePin(conversation.id)}
                  onDelete={onDeleteConversation}
                  onRename={onRenameConversation}
                />
              ))}
              {conversations.length === 0 && (
                <div className="px-4 py-2 text-[11px] text-zinc-400 italic">
                  Empty folder
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModernConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Folder?"
        description={`Are you sure you want to delete the folder "${name}"? This will move all conversations to the root level.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
