"use client";
/**
 * hooks/use-chat.ts
 * High-level chat state hook that wraps use-streaming.
 */
import { useCallback } from "react";
import { useStreaming } from "./use-streaming";

export function useChat() {
  const { startStream, cancel, isStreaming, agentNode, citations, error } = useStreaming();

  const sendMessage = useCallback(
    async (
      msg: string,
      conversationId: string | null,
      onToken: (t: string) => void,
      onDone: (citations: any[]) => void
    ) => {
      const token = localStorage.getItem("token") || "";
      await startStream(msg, conversationId, token, onToken, onDone);
    },
    [startStream]
  );

  return {
    sendMessage,
    cancelStream: cancel,
    isStreaming,
    agentNode,
    citations,
    error,
  };
}
