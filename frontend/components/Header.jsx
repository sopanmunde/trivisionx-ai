"use client";
import {
  MoreHorizontal,
  Menu,
  ChevronDown,
  Zap,
  Globe,
  BrainCircuit,
  Bot,
  Check,
} from "lucide-react";
import { useState } from "react";
import DocumentLibrary from "./DocumentLibrary";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const CHATBOTS = [
  {
    name: "Fast",
    icon: <Zap className="h-3.5 w-3.5" />,
    desc: "Instant response",
    badge: null,
  },
  {
    name: "Gemini",
    icon: <Globe className="h-3.5 w-3.5" />,
    desc: "Google DeepMind",
    badge: null,
  },
  {
    name: "Claude Sonnet 4",
    icon: <BrainCircuit className="h-3.5 w-3.5" />,
    desc: "Anthropic",
    badge: "NEW",
  },
  {
    name: "Assistant",
    icon: <Bot className="h-3.5 w-3.5" />,
    desc: "TriVisionX",
    badge: null,
  },
];

export default function Header({
  sidebarCollapsed,
  setSidebarOpen,
  selectedBot,
  setSelectedBot,
}) {
  const [isDocLibraryOpen, setIsDocLibraryOpen] = useState(false);
  const currentBot = CHATBOTS.find((b) => b.name === selectedBot) || CHATBOTS[0];

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between bg-white/80 px-4 py-2 backdrop-blur-xl dark:bg-[#1E1F20] border-b border-zinc-200/50 dark:border-zinc-900/60">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Model dropdown using shadcn button UI */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg px-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-1.5 cursor-pointer bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 select-none"
            >
              <span className="text-zinc-400 dark:text-zinc-500 shrink-0">{currentBot.icon}</span>
              <span>{selectedBot || "Select model"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px] rounded-xl p-1.5 border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
            <DropdownMenuLabel className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Select a model
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-0.5">
              {CHATBOTS.map((bot) => (
                <DropdownMenuItem
                  key={bot.name}
                  onClick={() => setSelectedBot(bot.name)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800/80 outline-none"
                >
                  <span className="text-zinc-400 dark:text-zinc-500 shrink-0">{bot.icon}</span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-100 leading-none">{bot.name}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-snug mt-0.5">{bot.desc}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {bot.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 leading-none">
                        {bot.badge}
                      </span>
                    )}
                    {selectedBot === bot.name && (
                      <Check className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center Group: Dropdown selector */}
      <div className="flex items-center">
        <button className="flex items-center gap-1 text-[12px] font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50 px-2.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer leading-none">
          <span>TriVisionX Chat</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsDocLibraryOpen(true)}
          title="Document Library"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 active:scale-95 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </button>
      </div>

      <DocumentLibrary open={isDocLibraryOpen} onClose={() => setIsDocLibraryOpen(false)} />
    </div>
  );
}
