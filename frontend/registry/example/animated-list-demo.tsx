"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

const rawNotifications: Item[] = [
  {
    name: "Payment received",
    description: "TrivisionX Enterprise",
    time: "2m ago",
    icon: "💳",
    color: "#10b981",
  },
  {
    name: "Agent dispatched",
    description: "Auto-eval workflow triggered",
    time: "5m ago",
    icon: "⚡",
    color: "#3b82f6",
  },
  {
    name: "Model sync completed",
    description: "Gemini 2.5 Pro fine-tune indexed",
    time: "12m ago",
    icon: "🧠",
    color: "#8b5cf6",
  },
  {
    name: "Security audit passed",
    description: "Zero vulnerability flags",
    time: "20m ago",
    icon: "🛡️",
    color: "#06b6d4",
  },
  {
    name: "New team invite",
    description: "sarah@ai-labs.org joined workspace",
    time: "32m ago",
    icon: "👥",
    color: "#f59e0b",
  },
];

const notifications = Array.from({ length: 6 }, () => rawNotifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl p-3",
        "transition-all duration-200 ease-in-out hover:scale-[102%]",
        // light styles
        "border border-border bg-card/90 shadow-sm backdrop-blur-sm",
        // dark styles
        "dark:bg-card/70 dark:border-border/60"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
          style={{
            backgroundColor: `${color}20`,
            border: `1px solid ${color}40`,
          }}
        >
          <span className="text-base">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden text-left">
          <figcaption className="flex flex-row items-center text-sm font-semibold text-foreground whitespace-pre">
            <span className="truncate">{name}</span>
            <span className="mx-1 text-muted-foreground/60">·</span>
            <span className="text-[11px] font-normal text-muted-foreground shrink-0">{time}</span>
          </figcaption>
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export default function AnimatedListDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[300px] w-full flex-col overflow-hidden p-2",
        className
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

