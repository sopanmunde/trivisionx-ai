"use client";
import {
  Asterisk,
  MoreHorizontal,
  Menu,
  ChevronDown,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import GhostIconButton from "./GhostIconButton";

export default function Header({
  createNewChat,
  sidebarCollapsed,
  setSidebarOpen,
}) {
  const [selectedBot, setSelectedBot] = useState("GPT-5");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const chatbots = [
    { name: "GPT-5", icon: "🤖", desc: "OpenAI's latest" },
    { name: "Claude Sonnet 4", icon: "🎭", desc: "Anthropic" },
    { name: "Gemini", icon: "💎", desc: "Google DeepMind" },
    {
      name: "Assistant",
      icon: <Asterisk className="h-3.5 w-3.5" />,
      desc: "Trishul AI",
    },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const current = chatbots.find((b) => b.name === selectedBot);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/80 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-[#212121]/80">
      {/* Mobile menu button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      )}

      {/* Model selector dropdown */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-[13px] font-semibold text-zinc-800 shadow-sm transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none dark:border-zinc-700/80 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {typeof current?.icon === "string" ? (
            <span className="text-sm">{current.icon}</span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center">
              {current?.icon}
            </span>
          )}
          <span>{selectedBot}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-56 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-900/95 z-50">
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              Model
            </p>
            {chatbots.map((bot) => (
              <button
                key={bot.name}
                onClick={() => {
                  setSelectedBot(bot.name);
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-100 hover:bg-zinc-100/80 dark:hover:bg-white/[0.06] active:scale-[0.98]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-base shadow-sm dark:border-zinc-700/80 dark:bg-zinc-800">
                  {typeof bot.icon === "string" ? (
                    bot.icon
                  ) : (
                    <span className="flex items-center justify-center">
                      {bot.icon}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                    {bot.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {bot.desc}
                  </div>
                </div>
                {selectedBot === bot.name && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
