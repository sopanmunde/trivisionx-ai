"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  FolderIcon,
  Settings,
  PenSquare,
  ChevronRight,
} from "lucide-react";
import { TrishulLogo } from "./TrishulLogo";
import SidebarSection from "./SidebarSection";
import ConversationRow from "./ConversationRow";
import FolderRow from "./FolderRow";
import TemplateRow from "./TemplateRow";
import FolderPopover from "./CreateFolderModal";
import TemplatePopover from "./CreateTemplateModal";
import SearchPopover from "./SearchModal";
import SettingsPopover from "./SettingsPopover";
import { cls } from "./utils";
import { useState, useEffect } from "react";

// ── Date grouping helpers ────────────────────────────────────────────────────
function groupByDate(conversations) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOf7DaysAgo = new Date(startOfToday);
  startOf7DaysAgo.setDate(startOfToday.getDate() - 7);
  const startOf30DaysAgo = new Date(startOfToday);
  startOf30DaysAgo.setDate(startOfToday.getDate() - 30);

  const groups = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

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

// ── Icon button reused throughout ───────────────────────────────────────────
function SidebarIconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 active:scale-95"
    >
      {children}
    </button>
  );
}

// ── Collapsed rail ───────────────────────────────────────────────────────────
function CollapsedSidebar({
  setSidebarCollapsed,
  createNewChat,
  conversations,
  selectedId,
  onSelect,
  onUserUpdate,
}) {
  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: 48 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="z-50 flex h-full shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/60 dark:bg-zinc-950"
    >
      <div className="flex items-center justify-center border-b border-zinc-200 px-1.5 py-2.5 dark:border-zinc-800/80">
        <SidebarIconBtn
          onClick={() => setSidebarCollapsed(false)}
          title="Open sidebar"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" />
        </SidebarIconBtn>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 pt-2">
        <SidebarIconBtn onClick={createNewChat} title="New Chat">
          <PenSquare className="h-3.5 w-3.5" />
        </SidebarIconBtn>

        <SearchPopover
          conversations={conversations}
          onSelect={onSelect}
          createNewChat={createNewChat}
        >
          <SidebarIconBtn title="Search">
            <SearchIcon className="h-3.5 w-3.5" />
          </SidebarIconBtn>
        </SearchPopover>

        <FolderPopover
          onCreateFolder={() => {
            setSidebarCollapsed(false);
          }}
        >
          <SidebarIconBtn title="Folders">
            <FolderIcon className="h-3.5 w-3.5" />
          </SidebarIconBtn>
        </FolderPopover>
      </div>

      <div className="flex flex-col items-center gap-1 pb-3">
        <SettingsPopover onUserUpdate={onUserUpdate}>
          <SidebarIconBtn title="Settings">
            <Settings className="h-3.5 w-3.5" />
          </SidebarIconBtn>
        </SettingsPopover>
      </div>
    </motion.aside>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
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
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedFolder, setExpandedFolder] = useState(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const toggleGroup = (label) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getConversationsByFolder = (folderName) =>
    conversations.filter((c) => c.folder === folderName);

  const handleCreateFolder = (name) => createFolder(name);
  const handleDeleteFolder = (name) => deleteFolder?.(name);
  const handleRenameFolder = (old, next) => renameFolder?.(old, next);

  const handleCreateTemplate = (data) => {
    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? { ...data, id: editingTemplate.id } : t,
        ),
      );
      setEditingTemplate(null);
    } else {
      setTemplates([...templates, { ...data, id: Date.now().toString() }]);
    }
  };

  const handleEditTemplate = (t) => {
    setEditingTemplate(t);
  };
  const handleRenameTemplate = (id, name) =>
    setTemplates(templates.map((t) => (t.id === id ? { ...t, name } : t)));
  const handleDeleteTemplate = (id) =>
    setTemplates(templates.filter((t) => t.id !== id));
  const handleUseTemplate = (t) => onUseTemplate(t);

  const userInitials = user
    ? (
      (user.first_name?.[0] || "") + (user.last_name?.[0] || "")
    ).toUpperCase() ||
    user.username?.[0]?.toUpperCase() ||
    "U"
    : "U";
  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "Loading…";

  const nonPinned = (recent || []).filter((c) => !c.pinned);
  const grouped = groupByDate(nonPinned);
  const groupOrder = [
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Previous 30 Days",
    "Older",
  ];

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
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || mounted) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className={cls(
              "z-50 flex h-full w-[240px] shrink-0 flex-col border-r border-zinc-200 bg-[#f9f9f9] dark:border-zinc-800/60 dark:bg-zinc-950",
              "fixed inset-y-0 left-0 md:static md:translate-x-0 shadow-xl md:shadow-none",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 border-b border-zinc-200/60 px-2.5 py-2 dark:border-zinc-800/60">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <TrishulLogo
                  size="sm"
                  showWordmark
                  wordmark="Trishul AI"
                  animate={false}
                />
              </div>

              <div className="flex items-center gap-0">
                <SidebarIconBtn onClick={createNewChat} title="New Chat (⌘N)">
                  <PenSquare className="h-3.5 w-3.5" />
                </SidebarIconBtn>
                <SidebarIconBtn
                  onClick={() => setSidebarCollapsed(true)}
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-3.5 w-3.5 hidden md:block" />
                </SidebarIconBtn>
                <button
                  onClick={onClose}
                  className="md:hidden inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-2.5 pt-2.5 space-y-2">
              <button
                onClick={createNewChat}
                className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:border-zinc-700 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">
                    New Chat
                  </span>
                </div>
                <div className="rounded-md border border-zinc-100 bg-zinc-50 px-1 py-0.5 text-[10px] font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
                  ⌘N
                </div>
              </button>

              <div className="relative group">
                <SearchPopover
                  conversations={conversations}
                  onSelect={onSelect}
                  createNewChat={createNewChat}
                >
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search chats…"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-100/50 py-1.5 pl-8 pr-2.5 text-[12px] text-zinc-800 placeholder:text-zinc-400 outline-none ring-0 transition-all focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_2px_rgba(161,161,170,0.12)] dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600 dark:focus:bg-zinc-900 cursor-pointer"
                      readOnly
                    />
                  </div>
                </SearchPopover>
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {/* Pinned */}
              {pinned && pinned.length > 0 && (
                <SidebarSection
                  title="Pinned"
                  collapsed={collapsed.pinned}
                  onToggle={() =>
                    setCollapsed((s) => ({ ...s, pinned: !s.pinned }))
                  }
                >
                  {pinned.map((c) => (
                    <ConversationRow
                      key={c.id}
                      data={c}
                      active={c.id === selectedId}
                      onSelect={() => {
                        onSelect(c.id);
                        onClose?.();
                      }}
                      onTogglePin={() => togglePin(c.id)}
                      onDelete={onDeleteConversation}
                      onRename={onRenameConversation}
                    />
                  ))}
                </SidebarSection>
              )}

              {/* Grouped by date */}
              {groupOrder.map((label) => {
                const items = grouped[label];
                if (!items || items.length === 0) return null;
                return (
                  <SidebarSection
                    key={label}
                    title={label}
                    collapsed={collapsedGroups[label]}
                    onToggle={() => toggleGroup(label)}
                  >
                    {items.map((c) => (
                      <ConversationRow
                        key={c.id}
                        data={c}
                        active={c.id === selectedId}
                        onSelect={() => {
                          onSelect(c.id);
                          onClose?.();
                        }}
                        onTogglePin={() => togglePin(c.id)}
                        onDelete={onDeleteConversation}
                        onRename={onRenameConversation}
                      />
                    ))}
                  </SidebarSection>
                );
              })}

              {/* Empty state */}
              {(!recent || recent.length === 0) &&
                (!pinned || pinned.length === 0) && (
                  <div className="mt-8 select-none rounded-[20px] border border-dashed border-zinc-200 px-4 py-8 text-center text-[12px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
                    <div className="mb-2 flex justify-center opacity-30">
                      <TrishulLogo size="lg" glow animate={false} />
                    </div>
                    No conversations yet.
                    <br />
                    Start a new chat to begin.
                  </div>
                )}

              {/* Folders */}
              <SidebarSection
                title="Folders"
                collapsed={collapsed.folders}
                onToggle={() =>
                  setCollapsed((s) => ({ ...s, folders: !s.folders }))
                }
              >
                <FolderPopover onCreateFolder={handleCreateFolder}>
                  <button className="mb-0.5 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors">
                    <Plus className="h-3 w-3" /> New folder
                  </button>
                </FolderPopover>
                {folders.map((f) => (
                  <FolderRow
                    key={f.id}
                    name={f.name}
                    count={folderCounts[f.name] || 0}
                    conversations={getConversationsByFolder(f.name)}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    togglePin={togglePin}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteConversation={onDeleteConversation}
                    onRenameConversation={onRenameConversation}
                    isExpanded={expandedFolder === f.id}
                    onToggle={() =>
                      setExpandedFolder((prev) => (prev === f.id ? null : f.id))
                    }
                  />
                ))}
              </SidebarSection>

              {/* Templates */}
              <SidebarSection
                title="Templates"
                collapsed={collapsed.templates}
                onToggle={() =>
                  setCollapsed((s) => ({ ...s, templates: !s.templates }))
                }
              >
                <TemplatePopover
                  onCreateTemplate={handleCreateTemplate}
                  editingTemplate={editingTemplate}
                >
                  <button className="mb-0.5 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors">
                    <Plus className="h-3 w-3" /> New template
                  </button>
                </TemplatePopover>
                {(Array.isArray(templates) ? templates : []).map((t) => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    onUseTemplate={handleUseTemplate}
                    onEditTemplate={handleEditTemplate}
                    onRenameTemplate={handleRenameTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                  />
                ))}
              </SidebarSection>
            </nav>

            {/* Footer / Profile */}
            <div className="mt-auto p-2">
              <SettingsPopover onUserUpdate={onUserUpdate}>
                <button className="group relative flex w-full items-center gap-2 overflow-hidden rounded-xl border border-transparent px-2 py-1.5 text-left transition-all duration-200 hover:border-zinc-200 hover:bg-white dark:hover:border-zinc-800 dark:hover:bg-zinc-900 active:scale-[0.98]">
                  {/* Subtle hover shimmer */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/5" />

                  {/* Avatar with gradient glow ring */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 opacity-0 group-hover:opacity-50 blur-[3px] transition-opacity duration-300" />
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 text-[10px] font-bold text-white shadow-sm">
                      {userInitials}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#f9f9f9] bg-emerald-500 dark:border-zinc-950" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {userName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Free plan
                    </div>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                </button>
              </SettingsPopover>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
