import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cls } from "./utils";

export default function SidebarSection({
  title,
  children,
  collapsed,
  onToggle,
}) {
  return (
    <section className="flex flex-col">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between px-1.5 pt-3.5 pb-1 text-[10px] font-semibold text-zinc-500/80 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
        aria-expanded={!collapsed}
      >
        <span className="uppercase tracking-[0.08em]">{title}</span>
        <ChevronDown
          className={cls(
            "h-2.5 w-2.5 transition-transform duration-200",
            collapsed ? "-rotate-90" : "rotate-0",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-px overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
