"use client";
import * as React from "react";
import {
  SearchIcon,
  Plus,
  FolderIcon,
  Settings,
  PenSquare,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { TrishulLogo } from "./TrishulLogo";
import ConversationRow from "./ConversationRow";
import FolderRow from "./FolderRow";
import TemplateRow from "./TemplateRow";
import FolderPopover from "./CreateFolderModal";
import TemplatePopover from "./CreateTemplateModal";
import SearchPopover from "./SearchModal";
import SettingsPopover from "./SettingsPopover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";

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

export function AppSidebar({
  conversations = [],
  pinned = [],
  recent = [],
  folders = [],
  folderCounts = {},
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
  onDeleteConversation = () => { },
  onRenameConversation = () => { },
  user = null,
  onUserUpdate = () => { },
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  sidebarCollapsed,
  setSidebarCollapsed,
  ...props
}) {
  const [editingTemplate, setEditingTemplate] = React.useState(null);
  const [expandedFolder, setExpandedFolder] = React.useState(null);

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

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-1.5 px-2 py-2">
          <TrishulLogo size="sm" showWordmark wordmark="AI Research Assistant" animate={false} />
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={createNewChat}
              title="New Chat"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              <PenSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-2 space-y-2">
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
              <div className="relative cursor-pointer">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats…"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-100/50 py-1.5 pl-8 pr-2.5 text-[12px] text-zinc-800 placeholder:text-zinc-400 outline-none ring-0 transition-all focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_2px_rgba(161,161,170,0.12)] dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600 dark:focus:bg-zinc-900 pointer-events-none"
                  readOnly
                />
              </div>
            </SearchPopover>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {pinned && pinned.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Pinned</SidebarGroupLabel>
            <SidebarGroupContent>
              {pinned.map((c) => (
                <ConversationRow
                  key={c.id}
                  data={c}
                  active={c.id === selectedId}
                  onSelect={() => onSelect(c.id)}
                  onTogglePin={() => togglePin(c.id)}
                  onDelete={onDeleteConversation}
                  onRename={onRenameConversation}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groupOrder.map((label) => {
          const items = grouped[label];
          if (!items || items.length === 0) return null;
          return (
            <SidebarGroup key={label}>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                {items.map((c) => (
                  <ConversationRow
                    key={c.id}
                    data={c}
                    active={c.id === selectedId}
                    onSelect={() => onSelect(c.id)}
                    onTogglePin={() => togglePin(c.id)}
                    onDelete={onDeleteConversation}
                    onRename={onRenameConversation}
                  />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <FolderPopover onCreateFolder={handleCreateFolder}>
              <SidebarMenuButton size="sm" className="mb-1 text-zinc-500">
                <Plus className="h-3 w-3 mr-2" /> New folder
              </SidebarMenuButton>
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Templates</SidebarGroupLabel>
          <SidebarGroupContent>
            <TemplatePopover
              onCreateTemplate={handleCreateTemplate}
              editingTemplate={editingTemplate}
            >
              <SidebarMenuButton size="sm" className="mb-1 text-zinc-500">
                <Plus className="h-3 w-3 mr-2" /> New template
              </SidebarMenuButton>
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
          </SidebarGroupContent>
        </SidebarGroup>

        {(!recent || recent.length === 0) &&
          (!pinned || pinned.length === 0) && (
            <div className="mx-4 mt-4 select-none rounded-[20px] border border-dashed border-zinc-200 px-4 py-8 text-center text-[12px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
              <div className="mb-2 flex justify-center opacity-30">
                <TrishulLogo size="lg" glow animate={false} />
              </div>
              No conversations yet.
              <br />
              Start a new chat to begin.
            </div>
          )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SettingsPopover onUserUpdate={onUserUpdate}>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="relative shrink-0 mr-1">
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 text-[10px] font-bold text-white shadow-sm">
                    {userInitials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#f9f9f9] bg-emerald-500 dark:border-zinc-950" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">Free plan</span>
                </div>
                <ChevronRight className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </SettingsPopover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
