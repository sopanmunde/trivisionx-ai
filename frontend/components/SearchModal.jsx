"use client";
import { useState, useMemo } from "react";
import { X, SearchIcon, Plus, Clock, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { motion, AnimatePresence } from "framer-motion";

function getTimeGroup(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= sevenDaysAgo) return "7 days ago";
  return "Older";
}

export default function SearchPopover({
  children,
  conversations,
  onSelect,
  createNewChat,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations.slice(0, 5);
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const groupedConversations = useMemo(() => {
    const groups = {};
    filteredConversations
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .forEach((conv) => {
        const group = getTimeGroup(conv.updatedAt);
        if (!groups[group]) groups[group] = [];
        groups[group].push(conv);
      });
    return groups;
  }, [filteredConversations]);

  const handleClose = () => {
    setQuery("");
    setOpen(false);
  };

  const handleNewChat = () => {
    createNewChat();
    handleClose();
  };

  const handleSelectConversation = (id) => {
    onSelect(id);
    handleClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="p-0 w-[360px] overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/95 z-[9999]"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.96, x: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <div className="p-3 border-b border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="relative group">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-violet-500 dark:group-focus-within:text-violet-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full rounded-xl border border-zinc-200/80 bg-white py-2.5 pl-10 pr-3 text-[13px] font-medium text-zinc-800 placeholder:text-zinc-400 outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                {/* New Chat Quick Action */}
                <button
                  onClick={handleNewChat}
                  className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900/60 active:scale-[0.98]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-zinc-200/80 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Start new chat
                  </span>
                </button>

                {Object.entries(groupedConversations).map(
                  ([groupName, convs]) => (
                    <div key={groupName} className="mt-3">
                      <div className="px-3 pb-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {groupName}
                      </div>
                      <div className="space-y-0.5">
                        {convs.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900/60 active:scale-[0.98]"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 text-zinc-400 transition-colors group-hover:bg-white group-hover:border-zinc-200 dark:group-hover:bg-zinc-800">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-none mb-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                {conv.title}
                              </div>
                              <div className="truncate text-[11.5px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                                {conv.preview || "No messages"}
                              </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}

                {filteredConversations.length === 0 && (
                  <div className="py-12 text-center">
                    <SearchIcon className="mx-auto h-8 w-8 text-zinc-200 dark:text-zinc-800 mb-2" />
                    <p className="text-[12.5px] font-medium text-zinc-400">
                      No results found
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
