"use client";

import {
  Menu,
  ChevronDown,
  Zap,
  Globe,
  BrainCircuit,
  Bot,
  Check,
  Sliders,
  ShieldCheck,
  GitMerge,
  Sparkles,
  Cpu,
  Flame,
  Server,
} from "lucide-react";
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
    name: "Gemini 2.5 Flash",
    icon: <Zap className="h-3.5 w-3.5 text-primary" />,
    desc: "Google DeepMind • Default",
    badge: "FAST",
  },
  {
    name: "GPT-4o",
    icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
    desc: "OpenAI • Multimodal",
    badge: "POPULAR",
  },
  {
    name: "Claude Sonnet 4",
    icon: <BrainCircuit className="h-3.5 w-3.5 text-primary" />,
    desc: "Anthropic • Reasoning",
    badge: "NEW",
  },
  {
    name: "Llama 3.3 70B",
    icon: <Cpu className="h-3.5 w-3.5 text-primary" />,
    desc: "Groq • Ultra Speed",
    badge: "GROQ",
  },
  {
    name: "Mistral Large",
    icon: <Flame className="h-3.5 w-3.5 text-primary" />,
    desc: "Mistral AI • Enterprise",
    badge: "PRO",
  },
  {
    name: "Command R+",
    icon: <Globe className="h-3.5 w-3.5 text-primary" />,
    desc: "Cohere • Cited RAG",
    badge: null,
  },
  {
    name: "Ollama Local",
    icon: <Server className="h-3.5 w-3.5 text-primary" />,
    desc: "Local Endpoint • Offline",
    badge: "LOCAL",
  },
];

export default function Header({
  sidebarCollapsed = false,
  setSidebarOpen = () => { },
  selectedBot = "Gemini 2.5 Flash",
  setSelectedBot = () => { },
  onToggleIntegrations = () => { },
  onOpenAuditLogs = () => { },
  onOpenWorkflows = () => { },
  user = null,
}) {
  const currentBot = CHATBOTS.find((b) => b.name === selectedBot || b.name.toLowerCase().startsWith((selectedBot || "").toLowerCase())) || CHATBOTS[0];

  const userName =
    user?.name ||
    user?.full_name ||
    (user?.first_name || user?.last_name
      ? [user.first_name, user.last_name].filter(Boolean).join(" ")
      : "") ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "") ||
    (typeof window !== "undefined" && localStorage.getItem("user_name")) ||
    "";

  const userInitials =
    user?.initials ||
    (userName && userName !== "User"
      ? userName
          .trim()
          .split(/[\s._-]+/)
          .filter(Boolean)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "");

  return (
    <div className="sticky top-0 z-30 px-2 sm:px-3.5 pt-2 sm:pt-3 pb-1 w-full bg-transparent">
      {/* Container Box for Header inside ChatPane */}
      <div className="w-full rounded-xl border border-border bg-card shadow-xs px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between transition-colors">
        {/* Left side: Mobile trigger + Model dropdown + Active Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Model dropdown container button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl px-2 sm:px-3 text-xs font-bold text-foreground border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all select-none max-w-[140px] sm:max-w-none"
              >
                <span className="shrink-0">{currentBot.icon}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentBot.name}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px] max-h-[350px] overflow-y-auto rounded-lg p-1 border-border bg-popover text-popover-foreground shadow-md scrollbar-thin z-50">
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Select AI Model
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="space-y-0.5">
                {CHATBOTS.map((bot) => (
                  <DropdownMenuItem
                    key={bot.name}
                    onClick={() => setSelectedBot(bot.name)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 cursor-pointer focus:bg-accent outline-none transition-colors"
                  >
                    <span className="shrink-0">{bot.icon}</span>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[12px] font-semibold text-foreground leading-none">{bot.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-snug mt-0.5">{bot.desc}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {bot.badge && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border border-border text-muted-foreground bg-muted leading-none">
                          {bot.badge}
                        </span>
                      )}
                      {(selectedBot === bot.name || currentBot.name === bot.name) && (
                        <Check className="h-3.5 w-3.5 text-foreground" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active status indicator pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-secondary-foreground text-[11px] font-medium leading-none shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Agent Active</span>
          </div>
        </div>

        {/* Right side settings, audit logs & automations triggers */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Automations Container */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWorkflows}
            className="h-8 gap-1.5 px-2 sm:px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-2xs transition-all cursor-pointer select-none"
            title="Workflow Automations (Cron & Events)"
          >
            <GitMerge className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="hidden sm:inline">Automations</span>
          </Button>

          {/* Audit Logs Container */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAuditLogs}
            className="h-8 gap-1.5 px-2 sm:px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-2xs transition-all cursor-pointer select-none"
            title="Explainable AI Audit Logs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="hidden sm:inline">Audit Logs</span>
          </Button>

          {/* User Account Avatar & Name */}
          {userName && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground select-none shadow-xs overflow-hidden shrink-0">
                {user?.avatar_url || user?.picture ? (
                  <img
                    src={user.avatar_url || user.picture}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitials || "U"
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold text-foreground truncate max-w-[130px]" title={userName}>
                {userName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
