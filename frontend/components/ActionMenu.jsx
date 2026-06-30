"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

export default function ActionMenu({
  items,
  children,
  align = "start",
  side = "bottom",
  sideOffset = 4,
  className = "",
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <button
            className="rounded-md p-0.5 text-muted-foreground transition-all hover:bg-accent/50"
            aria-label="Open menu"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={`min-w-[140px] rounded-xl p-1 ${className}`}
      >
        {items.map((item, i) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={i} className="my-0.5" />;
          }

          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.(e);
              }}
              variant={item.danger ? "destructive" : "default"}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium cursor-pointer"
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
