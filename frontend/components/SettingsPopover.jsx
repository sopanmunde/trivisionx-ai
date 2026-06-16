"use client";
import { useState, useEffect } from "react";
import {
  Globe,
  HelpCircle,
  Crown,
  BookOpen,
  LogOut,
  ChevronRight,
  Settings,
  Sparkles,
  Zap,
  Palette,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserProfileModal } from "./UserProfileModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

/* ── tiny shimmer border helper ─────────────────────────────────────────── */
function ShimmerBorder({ className = "" }) {
  return (
    <span
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
      style={{
        background:
          "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-border 3s linear infinite",
      }}
    />
  );
}

/* ── menu item ───────────────────────────────────────────────────────────── */
function MenuItem({
  icon: Icon,
  label,
  iconBg = "bg-zinc-100 dark:bg-zinc-800",
  iconColor = "text-zinc-500 dark:text-zinc-400",
  badge,
  badgeColor = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  suffix,
  onClick,
  danger = false,
  as: Component = motion.button,
  className = "",
}) {
  const motionProps = Component === motion.button ? { whileHover: { x: 2 }, transition: { duration: 0.15 } } : {};

  return (
    <Component
      onClick={onClick}
      {...motionProps}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] text-left transition-all duration-150 ${Component === motion.button ? "active:scale-[0.98]" : ""}
        ${danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60"
        } ${className}`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${danger ? "bg-red-50 dark:bg-red-500/10" : iconBg}`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${danger ? "text-red-500" : iconColor}`}
        />
      </div>
      <span className="font-medium flex-1">{label}</span>
      {badge && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      )}
      {suffix}
    </Component>
  );
}

/* ── main component ──────────────────────────────────────────────────────── */
export default function SettingsPopover({ children, onUserUpdate = () => { } }) {
  const [open, setOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://trivisionx-ai-v3ot.onrender.com/api"}/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setUser(data))
      .catch(() => { });
  }, [open]);

  const initials = user
    ? (
      (user.first_name?.[0] || "") + (user.last_name?.[0] || "")
    ).toUpperCase() ||
    user.username?.[0]?.toUpperCase() ||
    "U"
    : "U";
  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    "User"
    : "User";
  const email = user?.email || "";

  return (
    <>
      <style>{`
        @keyframes shimmer-border {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>

        <PopoverContent
          className="w-64 p-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950"
          align="start"
          side="top"
          sideOffset={10}
          collisionPadding={16}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {/* ── Profile header ── */}
                <div className="px-3.5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-800 text-[14px] font-bold text-white shadow-sm border border-zinc-200 dark:border-zinc-700">
                        {initials}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                        {displayName}
                      </div>
                      {email && (
                        <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-500 font-medium leading-none">
                          {email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 shadow-sm">
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Free plan
                    </span>
                    <button className="ml-auto text-[10px] font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      Upgrade
                    </button>
                  </div>
                </div>

                {/* ── Menu sections ── */}
                <div className="p-1.5 space-y-0.5">
                  <MenuItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => {
                      setOpen(false);
                      setIsProfileOpen(true);
                    }}
                  />
                  <MenuItem
                    as="div"
                    icon={Palette}
                    label="Appearance"
                    className="cursor-default"
                    suffix={
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] capitalize text-zinc-400">
                          {mounted ? resolvedTheme : "system"}
                        </span>
                        {mounted && (
                          <div className="flex items-center justify-center p-1 rounded-md bg-zinc-200/50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                            <AnimatedThemeToggler
                              theme={resolvedTheme}
                              onThemeChange={(newTheme) => setTheme(newTheme)}
                              className="w-4 h-4 text-zinc-600 dark:text-zinc-300 [&>svg]:w-3.5 [&>svg]:h-3.5"
                            />
                          </div>
                        )}
                      </div>
                    }
                  />
                  <MenuItem
                    icon={Globe}
                    label="Language"
                    suffix={<ChevronRight className="h-3 w-3 text-zinc-400" />}
                  />
                  <MenuItem
                    icon={HelpCircle}
                    label="Get help"
                    suffix={<ChevronRight className="h-3 w-3 text-zinc-400" />}
                  />
                </div>

                <div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-800/80" />

                <div className="p-1.5 space-y-0.5">
                  {/* Upgrade — Magic UI shimmer card */}
                  <div className="relative overflow-hidden rounded-xl">
                    <button className="group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] text-left transition-all duration-150 hover:bg-amber-50 dark:hover:bg-amber-500/10 active:scale-[0.98]">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Upgrade plan
                      </span>
                      <span className="ml-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        PRO
                      </span>
                    </button>
                  </div>

                  <MenuItem
                    icon={BookOpen}
                    label="Learn more"
                    suffix={<ChevronRight className="h-3 w-3 text-zinc-400" />}
                  />
                </div>

                <div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-800/80" />

                <div className="p-1.5">
                  <MenuItem
                    icon={LogOut}
                    label="Log out"
                    danger
                    onClick={() => {
                      localStorage.removeItem("token");
                      document.cookie = "auth_token=; path=/; max-age=0";
                      window.location.href = "/login";
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onUpdate={onUserUpdate}
        />
      </Popover>
    </>
  );
}
