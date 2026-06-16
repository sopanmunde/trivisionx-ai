"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  FolderIcon,
  FileText,
  Settings,
  PenSquare,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { TriVisionXLogo } from "./TriVisionXLogo";
import ConversationRow from "./ConversationRow";
import FolderRow from "./FolderRow";
import TemplateRow from "./TemplateRow";
import FolderPopover from "./CreateFolderModal";
import TemplatePopover from "./CreateTemplateModal";
import SearchPopover from "./SearchModal";
import SettingsPopover from "./SettingsPopover";
import { Database } from "lucide-react";
import { cls } from "./utils";
import { useState, useEffect, forwardRef } from "react";

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveLS(key, value) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

// ── Date grouping ────────────────────────────────────────────────────────────
function groupByDate(conversations) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOf7DaysAgo = new Date(startOfToday);
  startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 7);
  const startOf30DaysAgo = new Date(startOfToday);
  startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 30);

  const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], "Previous 30 Days": [], Older: [] };
  for (const c of conversations) {
    const d = new Date(c.updatedAt || c.updated_at || 0);
    if (d >= startOfToday) groups["Today"].push(c);
    else if (d >= startOfYesterday) groups["Yesterday"].push(c);
    else if (d >= startOf7DaysAgo) groups["Previous 7 Days"].push(c);
    else if (d >= startOf30DaysAgo) groups["Previous 30 Days"].push(c);
    else groups["Older"].push(c);
  }
  return groups;
}

// ── Collapsed icon rail ──────────────────────────────────────────────────────
function CollapsedSidebar({ setSidebarCollapsed, createNewChat, conversations, selectedId, onSelect, onUserUpdate }) {
  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: 52 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="z-50 flex h-full shrink-0 flex-col border-r border-white/40 bg-white/60 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90"
    >
      <div className="flex items-center justify-center border-b border-white/[0.06] px-1.5 py-3">
        <button
          onClick={() => setSidebarCollapsed(false)}
          title="Open sidebar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2 pt-3 px-1.5">
        <button onClick={createNewChat} title="New Chat" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-200 active:scale-95">
          <PenSquare className="h-4 w-4" />
        </button>
        <SearchPopover conversations={conversations} onSelect={onSelect} createNewChat={createNewChat}>
          <button title="Search" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-200 active:scale-95">
            <SearchIcon className="h-4 w-4" />
          </button>
        </SearchPopover>

        <button title="Templates" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-200 active:scale-95">
          <FileText className="h-4 w-4" />
        </button>
        <button title="Folders" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-200 active:scale-95">
          <FolderIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-2 pb-3 px-1.5">
        <SettingsPopover onUserUpdate={onUserUpdate}>
          <button title="Settings" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-200 active:scale-95">
            <Settings className="h-4 w-4" />
          </button>
        </SettingsPopover>
      </div>
    </motion.aside>
  );
}

// ── Inline accordion (Templates / Folders) ───────────────────────────────────
function AccordionSection({ id, icon, title, badge, isOpen, onToggle, addAction, children }) {
  return (
    <section aria-label={title} className="mt-1">
      <div className="flex items-center gap-1">
        <button
          id={`acc-${id}`}
          aria-expanded={isOpen}
          aria-controls={`acc-panel-${id}`}
          onClick={onToggle}
          className="group relative flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all duration-150 select-none hover:bg-zinc-100 dark:hover:bg-zinc-900/60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50"
        >
          {/* Icon */}
          <span className="shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {icon}
          </span>

          {/* Title */}
          <span className="flex-1 text-[12px] font-semibold text-zinc-600 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors">
            {title}
          </span>

          {/* Count badge */}
          {badge > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-900/40 px-1 text-[9px] font-bold tabular-nums text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-600 dark:group-hover:bg-zinc-800/60 dark:group-hover:text-zinc-400 transition-colors">
              {badge}
            </span>
          )}

          {/* Chevron */}
          <ChevronDown
            className={cls(
              "h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-all duration-200",
              isOpen ? "rotate-0" : "-rotate-90",
            )}
          />
        </button>

        {/* Inline add button */}
        {addAction && (
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            {addAction}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`acc-panel-${id}`}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-0.5 pl-1 space-y-px">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Date group section ───────────────────────────────────────────────────────
function DateSection({ label, isOpen, onToggle, children }) {
  return (
    <section aria-label={label} className="mt-1">
      <button
        aria-expanded={isOpen}
        onClick={onToggle}
        className="group flex w-full items-center justify-between px-2 py-1 select-none focus-visible:outline-none"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
          {label}
        </span>
        <ChevronDown
          className={cls(
            "h-2.5 w-2.5 text-zinc-700 group-hover:text-zinc-500 transition-all duration-200",
            isOpen ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-px pt-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Small "+" add button ─────────────────────────────────────────────────────
const AddBtn = forwardRef(({ title, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      aria-label={title}
      title={title}
      className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition-all hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50"
    >
      <Plus className="h-3 w-3" />
    </button>
  );
});
AddBtn.displayName = "AddBtn";

// ── Main Sidebar export ───────────────────────────────────────────────────────
export default function Sidebar({
  open,
  onClose,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  deleteFolder,
  renameFolder,
  createNewChat,
  templates = [],
  setTemplates = () => { },
  onUseTemplate = () => { },
  sidebarCollapsed = false,
  setSidebarCollapsed = () => { },
  onDeleteConversation = () => { },
  onRenameConversation = () => { },
  user = null,
  onUserUpdate = () => { },
}) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(() => loadLS("sb_folders_open", true));
  const [templatesOpen, setTemplatesOpen] = useState(() => loadLS("sb_templates_open", true));
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const toggleFolders = () => setFoldersOpen(v => { saveLS("sb_folders_open", !v); return !v; });
  const toggleTemplates = () => setTemplatesOpen(v => { saveLS("sb_templates_open", !v); return !v; });
  const toggleGroup = lbl => setCollapsedGroups(p => ({ ...p, [lbl]: !p[lbl] }));

  const getConvsByFolder = name => conversations.filter(c => c.folder === name);
  const handleCreateFolder = name => createFolder(name);
  const handleDeleteFolder = name => deleteFolder?.(name);
  const handleRenameFolder = (old, next) => renameFolder?.(old, next);

  const handleCreateTemplate = data => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...data, id: editingTemplate.id } : t));
      setEditingTemplate(null);
    } else {
      setTemplates([...templates, { ...data, id: Date.now().toString() }]);
    }
  };
  const handleEditTemplate = t => setEditingTemplate(t);
  const handleRenameTemplate = (id, name) => setTemplates(templates.map(t => t.id === id ? { ...t, name } : t));
  const handleDeleteTemplate = id => setTemplates(templates.filter(t => t.id !== id));
  const handleUseTemplate = t => onUseTemplate(t);

  const userInitials = user
    ? ((user.first_name?.[0] || "") + (user.last_name?.[0] || "")).toUpperCase() || user.username?.[0]?.toUpperCase() || "U"
    : "U";
  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "Loading…";

  const folderCount = (Array.isArray(folders) ? folders : []).length;
  const templateCount = (Array.isArray(templates) ? templates : []).length;
  const nonPinned = (recent || []).filter(c => !c.pinned);
  const grouped = groupByDate(nonPinned);
  const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"];

  if (sidebarCollapsed) {
    return (
      <CollapsedSidebar
        setSidebarCollapsed={setSidebarCollapsed}
        createNewChat={createNewChat}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        onUserUpdate={onUserUpdate}
      />
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mounted && (
          <aside
            key="sidebar"
            className={cls(
              "z-50 flex h-full w-[260px] shrink-0 flex-col",
               "border-r border-white/50 bg-white/70 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "dark:border-zinc-900/80 dark:bg-zinc-950/90 dark:backdrop-blur-xl",
              "fixed inset-y-0 left-0 md:static",
              open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
              "shadow-[1px_0_20px_rgba(0,0,0,0.06)] md:shadow-[1px_0_20px_rgba(0,0,0,0.04)]",
            )}
          >
            {/* ── HEADER: Logo + actions ──────────────────────────────────── */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TriVisionXLogo size="sm" showWordmark wordmark="TriVisionX" animate={false} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={createNewChat}
                  title="New Chat (⌘N)"
                  aria-label="New Chat"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200 active:scale-95"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200 active:scale-95"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close sidebar"
                  className="md:hidden inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-white/[0.08] hover:text-zinc-200 active:scale-95"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* ── NEW CHAT BUTTON ─────────────────────────────────────────── */}
            <div className="px-2.5 pb-2 shrink-0">
              <button
                onClick={createNewChat}
                aria-label="Start new chat"
                className="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-zinc-200/50 bg-white/50 px-3 py-2 text-left transition-all duration-200 hover:border-zinc-300 hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:border-zinc-700/80 dark:hover:bg-zinc-900/80"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/80 to-blue-500/80 text-white shadow-sm shrink-0">
                  <Plus className="h-3 w-3" />
                </div>
                <span className="text-[13px] font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white transition-colors flex-1">
                  New Chat
                </span>
                <kbd className="rounded-md border border-zinc-200 bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-zinc-600 shrink-0">
                  ⌘N
                </kbd>
              </button>
            </div>


            {/* ── SEARCH ─────────────────────────────────────────────────── */}
            <div className="px-2.5 pb-2 shrink-0">
              <SearchPopover conversations={conversations} onSelect={onSelect} createNewChat={createNewChat}>
                <div className="relative group">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors z-10" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search chats…"
                    aria-label="Search conversations"
                    className="w-full cursor-pointer rounded-xl border border-zinc-200/50 bg-white/50 py-1.5 pl-8 pr-3 text-[12.5px] text-zinc-600 placeholder:text-zinc-400 outline-none transition-all hover:border-zinc-300 hover:bg-white focus:border-violet-300 focus:bg-white focus:text-zinc-800 dark:border-zinc-800/80 dark:bg-zinc-900/20 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:hover:border-zinc-700/80 dark:hover:bg-zinc-900/40 dark:focus:border-zinc-700 dark:focus:bg-zinc-900/50 dark:focus:text-zinc-300 dark:focus:placeholder:text-zinc-500"
                    readOnly
                  />
                </div>
              </SearchPopover>
            </div>

            {/* ── SCROLLABLE BODY ─────────────────────────────────────────── */}
            <nav
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 pb-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent"
              aria-label="Sidebar navigation"
            >

              {/* ═══ TEMPLATES ACCORDION ══════════════════════════════════ */}
              <AccordionSection
                id="templates"
                icon={<FileText className="h-3.5 w-3.5" />}
                title="Templates"
                badge={templateCount}
                isOpen={templatesOpen}
                onToggle={toggleTemplates}
                addAction={
                  <TemplatePopover onCreateTemplate={handleCreateTemplate} editingTemplate={editingTemplate}>
                    <AddBtn title="New template" />
                  </TemplatePopover>
                }
              >
                {(Array.isArray(templates) ? templates : []).map(t => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    onUseTemplate={handleUseTemplate}
                    onEditTemplate={handleEditTemplate}
                    onRenameTemplate={handleRenameTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                  />
                ))}
                {templateCount === 0 && (
                  <p className="py-2 pl-3 text-[11px] italic text-zinc-600">No templates yet</p>
                )}
              </AccordionSection>

              {/* ═══ FOLDERS ACCORDION ════════════════════════════════════ */}
              <AccordionSection
                id="folders"
                icon={<FolderIcon className="h-3.5 w-3.5" />}
                title="Folders"
                badge={folderCount}
                isOpen={foldersOpen}
                onToggle={toggleFolders}
                addAction={
                  <FolderPopover onCreateFolder={handleCreateFolder}>
                    <AddBtn title="New folder" />
                  </FolderPopover>
                }
              >
                {(Array.isArray(folders) ? folders : []).map(f => (
                  <FolderRow
                    key={f.id}
                    name={f.name}
                    count={folderCounts[f.name] || 0}
                    conversations={getConvsByFolder(f.name)}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    togglePin={togglePin}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteConversation={onDeleteConversation}
                    onRenameConversation={onRenameConversation}
                    isExpanded={expandedFolder === f.id}
                    onToggle={() => setExpandedFolder(prev => prev === f.id ? null : f.id)}
                  />
                ))}
                {folderCount === 0 && (
                  <p className="py-2 pl-3 text-[11px] italic text-zinc-600">No folders yet</p>
                )}
              </AccordionSection>

              {/* ─── Thin divider ──────────────────────────────────────────── */}
              <div role="separator" className="mx-1 my-2 h-px bg-white/[0.05]" />

              {/* ═══ RECENT LABEL ═════════════════════════════════════════ */}
              <div className="px-2 pb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Recent</span>
              </div>

              {/* ═══ PINNED ═══════════════════════════════════════════════ */}
              {pinned && pinned.length > 0 && (
                <DateSection
                  label="Pinned"
                  isOpen={!collapsed.pinned}
                  onToggle={() => setCollapsed(s => ({ ...s, pinned: !s.pinned }))}
                >
                  {pinned.map(c => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => { onSelect(c.id); onClose?.(); }}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onRename={onRenameConversation}
                    />
                  ))}
                </DateSection>
              )}

              {/* ═══ CONVERSATION HISTORY ═════════════════════════════════ */}
              <div className="pt-0.5 space-y-px px-1">
                {nonPinned.map(c => (
                  <ConversationRow
                    key={c.id}
                    data={c}
                    active={c.id === selectedId}
                    onSelect={() => { onSelect(c.id); onClose?.(); }}
                    onTogglePin={() => togglePin(c.id)}
                    onDelete={onDeleteConversation}
                    onRename={onRenameConversation}
                  />
                ))}
              </div>

              {/* Empty state */}
              {(!recent || recent.length === 0) && (!pinned || pinned.length === 0) && (
                <div className="mt-6 select-none rounded-2xl border border-dashed border-white/[0.06] px-4 py-8 text-center text-[12px] text-zinc-600">
                  <div className="mb-3 flex justify-center opacity-20">
                    <TriVisionXLogo size="lg" glow animate={false} />
                  </div>
                  No conversations yet.
                  <br />
                  Start a new chat to begin.
                </div>
              )}
            </nav>

            {/* ── GLASSMORPHISM PROFILE CARD ──────────────────────────────── */}
            <div className="shrink-0 p-2.5 border-t border-white/[0.05]">
              <SettingsPopover onUserUpdate={onUserUpdate}>
                <button
                  id="sidebar-profile-card"
                  aria-label="Open settings"
                  className={cls(
                    "group relative flex w-full items-center gap-3 overflow-hidden text-left",
                    "rounded-[12px] px-2.5 py-1.5",
                    "border border-zinc-200/50 bg-white/50 [backdrop-filter:blur(20px)]",
                    "shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
                    // Dark
                    "dark:border-zinc-800/80 dark:bg-zinc-900/40",
                    "dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.04)]",
                    // Hover
                    "transition-all duration-300",
                    "hover:-translate-y-px hover:border-zinc-300/80 hover:bg-white",
                    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
                    "dark:hover:border-zinc-700/80 dark:hover:bg-zinc-900/80",
                    "dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "active:scale-[0.98] active:translate-y-0",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50",
                  )}
                >
                  {/* Shimmer */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 opacity-0 group-hover:opacity-50 blur-[4px] transition-opacity duration-300" />
                    <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 text-[10px] font-bold text-white shadow-md select-none">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-[#171717] bg-emerald-500 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                  </div>

                  {/* Name + badge */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-[12px] font-semibold text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white transition-colors">
                        {userName}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                        Free
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </SettingsPopover>
            </div>
          </aside>
        )}
      </AnimatePresence>
    </>
  );
}
