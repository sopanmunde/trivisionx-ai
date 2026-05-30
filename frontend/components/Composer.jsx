"use client";

import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Send, Loader2, Plus, Mic, StopCircle, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import ComposerActionsPopover from "./ComposerActionsPopover";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const Composer = forwardRef(function Composer({ onSend, busy }, ref) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    if (!inputRef.current) return;
    const ta = inputRef.current;
    const lineHeight = 24;
    ta.style.height = "auto";
    const lines = Math.max(1, Math.ceil(ta.scrollHeight / lineHeight));
    if (lines <= 12) {
      ta.style.height = `${Math.max(24, ta.scrollHeight)}px`;
      ta.style.overflowY = "hidden";
    } else {
      ta.style.height = `${12 * lineHeight}px`;
      ta.style.overflowY = "auto";
    }
  }, [value]);

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        setValue((prev) => {
          const next = prev ? `${prev}\n\n${templateContent}` : templateContent;
          setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(next.length, next.length);
          }, 0);
          return next;
        });
      },
      setValue: (text) => {
        setValue(text);
        setTimeout(() => inputRef.current?.focus(), 0);
      },
      focus: () => inputRef.current?.focus(),
    }),
    [],
  );

  async function handleSend() {
    if (!value.trim() || sending || busy) return;
    const text = value;
    setValue("");
    setSending(true);
    try {
      await onSend?.(text);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const hasContent = value.trim().length > 0;

  return (
    <div className="px-3 pb-2 pt-2">
      {/* Input card */}
      <div
        className={cn(
          "mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-background transition-all duration-200",
          isFocused
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(var(--primary),0.1)]"
            : "border-border shadow-sm",
        )}
      >
        {/* Top focus highlight bar */}
        {isFocused && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        )}

        {/* Textarea */}
        <div className="px-4 pt-3.5 pb-1">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message Trishul AI…"
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground scrollbar-thin"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          {/* + Actions */}
          <Tooltip>
            <ComposerActionsPopover>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </ComposerActionsPopover>
            <TooltipContent side="top">Attach file</TooltipContent>
          </Tooltip>

          {/* Mic + Send */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Voice input</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSend}
                  disabled={!hasContent && !busy}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    hasContent || busy
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                  )}
                >
                  {sending || busy ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {busy ? "Stop" : "Send message"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Composer;
