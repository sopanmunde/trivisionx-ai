"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "./ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";

export default function ModernConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive", // 'destructive', 'warning', 'info'
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-[380px] rounded-[24px] border border-zinc-200/80 bg-white/95 backdrop-blur-xl p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950/95 gap-5 flex flex-col items-center overflow-hidden">
        {/* Top glowing fuchsia-violet-blue gradient strip */}
        <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 rounded-t-[24px] pointer-events-none" />

        <AlertDialogHeader className="flex flex-col items-center gap-3.5 text-center sm:text-center">
          {/* Circular Glowing Icon Shell */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 border relative ${
            variant === "destructive" 
              ? "bg-red-50 border-red-200/60 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400" 
              : variant === "warning"
              ? "bg-amber-50 border-amber-200/60 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
              : "bg-blue-50 border-blue-200/60 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
          }`}>
            <div className={`absolute inset-0 rounded-full blur-[8px] opacity-20 pointer-events-none ${
              variant === "destructive" ? "bg-red-500" : variant === "warning" ? "bg-amber-500" : "bg-blue-500"
            }`} />
            {variant === "destructive" ? (
              <Trash2 className="h-5 w-5 relative z-10 animate-pulse" />
            ) : variant === "warning" ? (
              <AlertTriangle className="h-5 w-5 relative z-10" />
            ) : (
              <HelpCircle className="h-5 w-5 relative z-10" />
            )}
          </div>
          <div className="space-y-1.5">
            <AlertDialogTitle className="text-[16px] font-bold text-zinc-900 dark:text-white tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-3 w-full sm:justify-stretch">
          <AlertDialogPrimitive.Cancel asChild>
            <button
              onClick={onClose}
              className="flex items-center justify-center flex-1 rounded-xl h-10 text-[13px] font-bold border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] outline-none"
            >
              {cancelText}
            </button>
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm?.();
              }}
              className={`flex items-center justify-center flex-1 rounded-xl h-10 text-[13px] font-bold text-white shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] outline-none ${
                variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-500/20 dark:border dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/30"
                  : variant === "warning"
                  ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500/20 dark:border dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/30"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/20 dark:border dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/30"
              }`}
            >
              {confirmText}
            </button>
          </AlertDialogPrimitive.Action>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
