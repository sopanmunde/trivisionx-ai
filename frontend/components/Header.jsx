"use client";
import {
  Asterisk,
  MoreHorizontal,
  Menu,
} from "lucide-react";
import { useRef, useState } from "react";
import GhostIconButton from "./GhostIconButton";
import DocumentLibrary from "./DocumentLibrary";

export default function Header({
  createNewChat,
  sidebarCollapsed,
  setSidebarOpen,
}) {
  const dropdownRef = useRef(null);
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:bg-zinc-950/50 border-b border-zinc-200/50 dark:border-zinc-900/60">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
        aria-label="Open sidebar"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>



      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <button 
          onClick={() => setIsDocLibraryOpen(true)}
          title="Document Library"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 active:scale-95 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </button>
      </div>

      <DocumentLibrary open={isDocLibraryOpen} onClose={() => setIsDocLibraryOpen(false)} />
    </div>
  );
}
