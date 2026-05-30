"use client";
/**
 * hooks/use-streaming.ts
 * Reads an SSE stream from the backend chat endpoint.
 * Parses node activity updates, citations, and text tokens.
 */
import { useCallback, useRef, useState } from "react";

export type AgentNode = "planner" | "retriever" | "summarizer" | "citation" | "reporter" | null;

export interface StreamingState {
  isStreaming: boolean;
  agentNode: AgentNode;
  text: string;
  citations: any[];
  error: string | null;
}

export function useStreaming() {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    agentNode: null,
    text: "",
    citations: [],
    error: null,
  });

  const abortRef = useRef<(() => void) | null>(null);

  const startStream = useCallback(
    async (
      msg: string,
      conversationId: string | null,
      token: string,
      onToken: (token: string) => void,
      onDone: (citations: any[]) => void
    ) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      let cancelled = false;

      setState({ isStreaming: true, agentNode: null, text: "", citations: [], error: null });

      const response = await fetch(`${apiUrl}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ msg, conversation_id: conversationId }),
      });

      if (!response.ok) {
        setState((s) => ({ ...s, isStreaming: false, error: `HTTP ${response.status}` }));
        return;
      }

      abortRef.current = () => { cancelled = true; };

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let collectedCitations: any[] = [];

      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(part.slice(6));

            if (data.node) {
              setState((s) => ({ ...s, agentNode: data.node as AgentNode }));
            }
            if (data.type === "citations") {
              collectedCitations = data.data;
              setState((s) => ({ ...s, citations: data.data }));
            }
            if (data.type === "token") {
              onToken(data.data);
            }
            if (data.done) {
              collectedCitations = data.sources || collectedCitations;
              setState((s) => ({ ...s, isStreaming: false, agentNode: null, citations: collectedCitations }));
              onDone(collectedCitations);
            }
            if (data.error) {
              setState((s) => ({ ...s, isStreaming: false, error: data.error, agentNode: null }));
            }
          } catch {}
        }
      }

      setState((s) => ({ ...s, isStreaming: false, agentNode: null }));
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.();
    setState((s) => ({ ...s, isStreaming: false, agentNode: null }));
  }, []);

  return { ...state, startStream, cancel };
}
