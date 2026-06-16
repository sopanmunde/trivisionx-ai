"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-500" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-zinc-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200/80 group-[.toaster]:shadow-2xl dark:group-[.toaster]:bg-zinc-950/90 dark:group-[.toaster]:text-zinc-100 dark:group-[.toaster]:border-zinc-800/80 dark:group-[.toaster]:backdrop-blur-md dark:group-[.toaster]:shadow-zinc-950/50 rounded-2xl p-4 flex items-center gap-3",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400 text-xs",
          actionButton:
            "group-[.toast]:bg-zinc-900 group-[.toast]:text-white dark:group-[.toast]:bg-white dark:group-[.toast]:text-zinc-950 text-xs font-semibold rounded-xl px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-900 dark:group-[.toast]:text-zinc-400 text-xs font-medium rounded-xl px-3 py-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
