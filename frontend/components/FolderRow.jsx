"use client";

import { useState } from "react";
import {
  FolderIcon,
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import ConversationRow from "./ConversationRow";
import { motion, AnimatePresence } from "framer-motion";
import ActionMenu from "./ActionMenu";
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
  isExpanded,
  onToggle,
}) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const expanded = isExpanded !== undefined ? isExpanded : localExpanded;
  const handleToggle = () => {
    if (onToggle) onToggle();
    else setLocalExpanded((v) => !v);
  };

  const handleRename = () => {
    const newName = prompt(`Rename folder "${name}" to:`, name);
    if (newName && newName.trim() && newName !== name) {
      onRenameFolder?.(name, newName.trim());
    }
  };

  const confirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDeleteFolder?.(name);
  };

  const items = [
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
      <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-all duration-200 border border-transparent hover:bg-accent/30 hover:border-border/50 hover:shadow-xs">
        <button
          onClick={handleToggle}
          className="group/btn flex items-center gap-2 flex-1 text-left min-w-0"
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center transition-colors">
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            )}
          </div>
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
          <span className="truncate text-[11px] font-medium text-card-foreground group-hover/btn:text-foreground transition-colors">
            {name}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] font-medium text-muted-foreground/60">{count}</span>

          <ActionMenu
            items={items}
            side="right"
            align="start"
            sideOffset={12}
          >
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-accent transition-all active:scale-95"
              aria-label="Folder options"
            >
              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
            </button>
          </ActionMenu>
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
            <div className="ml-5 border-l border-border/60 pl-1 space-y-0.5 py-1">
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
                <div className="px-4 py-2 text-[11px] text-muted-foreground/60 italic">
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
