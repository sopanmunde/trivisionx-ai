"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Sidebar from "./Sidebar";
import ChatPane from "./ChatPane";
import Header from "./Header";
import { INITIAL_TEMPLATES, INITIAL_FOLDERS } from "./mockData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { DashboardDocsTable } from "./DashboardDocsTable";
import { EmailDashboard } from "./EmailDashboard";
import { BrainDashboard } from "./BrainDashboard";
import { CalendarDashboard } from "./CalendarDashboard";
import { TaskDashboard } from "./TaskDashboard";
import { NotesDashboard } from "./NotesDashboard";
import { IntegrationsDashboard } from "./IntegrationsDashboard";
import { SettingsDashboard } from "./SettingsDashboard";
import { CompetitiveIntelligenceDashboard } from "./CompetitiveIntelligenceDashboard";
import { MemoryTimeline } from "./MemoryTimeline";
import { OnboardingWizard } from "./OnboardingWizard";
import { FloatingVoiceAssistant } from "./FloatingVoiceAssistant";
import IntegrationsPanel from "./IntegrationsPanel";
import AuditLogsModal from "./AuditLogsModal";
import WorkflowsModal from "./WorkflowsModal";

export default function AIAssistantUI({ isDemo = false }) {
  const router = useRouter();
  const [isDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const hasRealToken = token && token !== "demo_guest_token";
      const hasAuthCookie = document.cookie
        .split("; ")
        .some((c) => c.startsWith("auth_token=") && c.split("=")[1] && c.split("=")[1] !== "demo_guest_token");

      if (hasRealToken || hasAuthCookie) {
        localStorage.removeItem("is_demo");
        document.cookie = "is_demo=; path=/; max-age=0";
        return false;
      }
      return (
        isDemo ||
        window.location.pathname.startsWith("/demo") ||
        window.location.search.includes("demo=true")
      );
    }
    return isDemo;
  });

  useEffect(() => {
    try {
      if (isDemoMode) {
        localStorage.setItem("is_demo", "true");
        document.cookie = "is_demo=true; path=/; max-age=86400";
        if (!localStorage.getItem("token")) {
          localStorage.setItem("token", "demo_guest_token");
        }
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    } catch { }
  }, [isDemoMode, router]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("sidebar-collapsed");
        return raw
          ? JSON.parse(raw)
          : { pinned: true, recent: false, folders: true, templates: true };
      }
      return { pinned: true, recent: false, folders: true, templates: true };
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true };
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch { }
  }, [collapsed]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sidebar-collapsed-state");
        return saved ? JSON.parse(saved) : false;
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "sidebar-collapsed-state",
        JSON.stringify(sidebarCollapsed),
      );
    } catch { }
  }, [sidebarCollapsed]);

  const [conversations, setConversations] = useState([]);
  const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("trivisionx_onboarding_completed");
      if (!done && !isDemoMode) {
        setIsOnboardingOpen(true);
      }
    }
  }, [isDemoMode]);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") || params.get("view");
        if (tab === "plugins" || tab === "integrations" || tab === "skills") {
          setSelectedId("integrations");
          return;
        }
        if (tab === "setting" || tab === "settings") {
          setSelectedId("setting");
          return;
        }
      }
      const saved = localStorage.getItem("dashboard-selected-id");
      if (saved) {
        setSelectedId(saved);
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      if (selectedId) {
        localStorage.setItem("dashboard-selected-id", selectedId);
      } else {
        localStorage.removeItem("dashboard-selected-id");
      }
    } catch { }
  }, [selectedId, isMounted]);


  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [folders, setFolders] = useState(INITIAL_FOLDERS);

  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const chatAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chatAbortRef.current) {
        chatAbortRef.current.abort();
      }
    };
  }, []);

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingConvId, setThinkingConvId] = useState(null);
  const [isResponding, setIsResponding] = useState(false);
  const [agentState, setAgentState] = useState(null);
  const [providerSwitchEvent, setProviderSwitchEvent] = useState(null);
  const [supervisorDecision, setSupervisorDecision] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedBot, setSelectedBot] = useState("Gemini 2.5 Flash");
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false);

  const DEMO_CONVERSATIONS = useMemo(() => [
    {
      id: "demo-c1",
      title: "LangGraph Multi-Agent Research Spec",
      folder: "Work Projects",
      pinned: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      messageCount: 2,
      preview: "Analysis of cyclic LangGraph agent routing vs linear chains...",
      messages: [
        {
          id: "demo-m1",
          role: "user",
          content: "How does TriVisionX utilize LangGraph multi-agent swarms for cited research?",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "demo-m2",
          role: "assistant",
          content: "### 🤖 TriVisionX LangGraph Orchestration\n\nTriVisionX routes complex queries into specialized **agent subgraphs**:\n\n1. **Planner Agent**: Evaluates user intent and dynamically determines whether retrieval, code evaluation, or competitive analysis is required.\n2. **Retriever Node**: Executes Maximal Marginal Relevance (MMR) vector queries across **Pinecone** indices.\n3. **Citation Auditor**: Back-references every generated claim to exact source chunks before synthesizing the final output.\n\n```python\nfrom langgraph.graph import StateGraph, END\n\nworkflow = StateGraph(AgentResearchState)\nworkflow.add_node(\"planner\", planner_node)\nworkflow.add_node(\"retriever\", pinecone_retriever_node)\nworkflow.add_node(\"auditor\", citation_audit_node)\n```\n\n*All outputs are streamed over Server-Sent Events (SSE) with live telemetry.*",
          createdAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
          sources: [
            { title: "TriVisionX Multi-Agent Spec v2.4", url: "/docs", score: 0.98 },
            { title: "Pinecone Vector RAG Architecture", url: "/blog", score: 0.94 }
          ],
        },
      ],
    },
    {
      id: "demo-c2",
      title: "Competitive Analysis: Multi-Model Routing",
      folder: "Work Projects",
      pinned: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      messageCount: 2,
      preview: "Routing between Gemini 2.5 Flash, GPT-4o, and Claude 3.5 Sonnet...",
      messages: [
        {
          id: "demo-m3",
          role: "user",
          content: "Compare latency and token cost when routing between Gemini 2.5 Flash and Claude 3.5 Sonnet.",
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: "demo-m4",
          role: "assistant",
          content: "| Model | Latency (p50) | Ingest Cost / 1M | Reasoning Tier |\n|---|---|---|---|\n| **Gemini 2.5 Flash** | ~350ms | $0.075 | High (Default Fast) |\n| **Claude 3.5 Sonnet** | ~920ms | $3.00 | Ultra-Deep Analysis |\n| **Local Ollama Llama 3** | Zero-Cloud | $0.00 | Sovereign On-Prem |\n\nTriVisionX automatically routes routine retrieval tasks to Gemini 2.5 Flash and escalates multi-step mathematical proofs or code debugging to Claude or local models.",
          createdAt: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
        },
      ],
    },
  ], []);

  const fetchUser = async () => {
    if (isDemoMode) {
      setUser({
        name: "Demo Guest",
        email: "demo@trivisionx.ai",
        role: "Guest Preview",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const apiUrl = API_BASE_URL;
      const res = await fetch(`${apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const name =
          data.name ||
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          data.username ||
          (data.email ? data.email.split("@")[0] : "");
        if (name && typeof window !== "undefined") {
          localStorage.setItem("user_name", name);
        }
      }
    } catch (err) {
      if (isDemoMode) {
        setUser({
          name: "Demo Guest",
          email: "demo@trivisionx.ai",
          role: "Guest Preview",
        });
      } else {
        console.error("Failed to fetch user", err);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewChat();
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, conversations]);

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      if (isDemoMode) {
        setConversations(DEMO_CONVERSATIONS);
        setIsConversationsLoaded(true);
        return;
      }
      if (!token) return;
      try {
        const apiUrl = API_BASE_URL;
        const res = await fetch(`${apiUrl}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(
            data.map((c) => ({
              ...c,
              updatedAt:
                c.updated_at || c.updatedAt || new Date().toISOString(),
              messages: [],
              messageCount: c.messageCount || 0,
              preview: c.preview || "",
            })),
          );
          setIsConversationsLoaded(true);
        } else if (isDemoMode) {
          setConversations(DEMO_CONVERSATIONS);
          setIsConversationsLoaded(true);
        }
      } catch (err) {
        if (isDemoMode) {
          setConversations(DEMO_CONVERSATIONS);
          setIsConversationsLoaded(true);
        } else {
          console.error(err);
        }
      }
    };
    fetchConversations();
  }, [isDemoMode, DEMO_CONVERSATIONS]);

  useEffect(() => {
    if (isConversationsLoaded) {
      const specialIds = ["new", "email", "docs", "brain", "calendar", "tasks", "notes", "integrations", "plugins", "setting", "settings", "competitive", "memory"];
      if (!selectedId) {
        setSelectedId("new");
      } else if (!specialIds.includes(selectedId)) {
        const exists = conversations.some((c) => c.id === selectedId);
        if (!exists) {
          setSelectedId("new");
        }
      }
    }
  }, [isConversationsLoaded, selectedId, conversations]);

  useEffect(() => {
    if (!selectedId || selectedId === "new") return;
    const conv = conversations.find((c) => c.id === selectedId);
    if (conv && conv.messages.length === 0 && conv.messageCount > 0) {
      const fetchMessages = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const apiUrl = API_BASE_URL;
          const res = await fetch(
            `${apiUrl}/conversations/${selectedId}/messages`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const msgs = await res.json();
            setConversations((prev) =>
              prev.map((c) =>
                c.id === selectedId
                  ? {
                    ...c,
                    messages: msgs,
                    messageCount: msgs.length,
                    preview:
                      msgs.length > 0
                        ? msgs[msgs.length - 1].content.slice(0, 120)
                        : c.preview,
                  }
                  : c,
              ),
            );
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [selectedId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        (c.preview || "").toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const pinned = filtered
    .filter((c) => c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const recent = filtered
    .filter((c) => !c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10);

  const folderCounts = React.useMemo(() => {
    const map = Object.fromEntries(folders.map((f) => [f.name, 0]));
    for (const c of conversations)
      if (map[c.folder] != null) map[c.folder] += 1;
    return map;
  }, [conversations, folders]);

  function togglePin(id) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }

  function createNewChat() {
    setSelectedId("new");
    setSidebarOpen(false);
  }

  async function deleteConversation(id) {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const apiUrl = API_BASE_URL;
      const res = await fetch(`${apiUrl}/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  }

  async function renameConversation(id, newTitle) {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const apiUrl = API_BASE_URL;
      const res = await fetch(`${apiUrl}/conversations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
              : c,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to rename conversation", err);
    }
  }

  function createFolder(name) {
    if (!name) return;
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase()))
      return alert("Folder already exists.");
    setFolders((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), name },
    ]);
  }

  function deleteFolder(name) {
    setFolders((prev) => prev.filter((f) => f.name !== name));
    setConversations((prev) =>
      prev.map((c) => (c.folder === name ? { ...c, folder: null } : c)),
    );
  }

  function renameFolder(oldName, newName) {
    if (!newName || !newName.trim()) return;
    if (folders.some((f) => f.name.toLowerCase() === newName.toLowerCase()))
      return alert("Folder already exists.");
    setFolders((prev) =>
      prev.map((f) => (f.name === oldName ? { ...f, name: newName } : f)),
    );
    setConversations((prev) =>
      prev.map((c) => (c.folder === oldName ? { ...c, folder: newName } : c)),
    );
  }

  async function sendMessage(convId, content, mode = "research", fileRef = null, selectedBot = "Fast", activeFeatures = null, isVoice = false) {
    const token = localStorage.getItem("token");
    if (!content.trim() && !fileRef || !token) return;

    let targetConvId = convId;
    const now = new Date().toISOString();
    const userMsg = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content,
      createdAt: now,
      ...(fileRef ? { attachedFile: fileRef } : {}),
    };

    if (isDemoMode) {
      if (convId === "new") {
        targetConvId = "demo-" + Math.random().toString(36).slice(2, 9);
        const initialConv = {
          id: targetConvId,
          title: content.trim().split(/\s+/).slice(0, 5).join(" ") || "New Research",
          folder: "Work Projects",
          pinned: false,
          updatedAt: now,
          messages: [userMsg],
          messageCount: 1,
          preview: content.slice(0, 80),
        };
        setConversations((prev) => [initialConv, ...prev]);
        setSelectedId(targetConvId);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                ...c,
                messages: [...(c.messages || []), userMsg],
                messageCount: (c.messages || []).length + 1,
                preview: content.slice(0, 80),
                updatedAt: now,
              }
              : c,
          ),
        );
      }

      setIsResponding(true);
      setIsThinking(true);
      setThinkingConvId(targetConvId);
      setAgentState("Supervisor Routing: Planner Subgraph -> Vector Retrieval Node");

      setTimeout(() => {
        setIsThinking(false);
        const asstMsgId = "demo-asst-" + Date.now();
        const demoResponseText = `### 🎯 Multi-Agent Research Synthesis (Live Demo)\n\nI processed your query: **"${content}"** through the TriVisionX LangGraph orchestration engine.\n\n#### 🔍 Multi-Agent Execution Steps\n1. **Planner Node**: Intent classified as \`${mode}\` — routing to Pinecone semantic vector store.\n2. **Retrieval Subgraph**: Retrieved relevant vector chunks with MMR cosine score > 0.84.\n3. **Citation Auditor**: Back-referenced claims to source documents.\n\n\`\`\`json\n{\n  "status": "success",\n  "engine": "LangGraph v0.2",\n  "active_model": "${selectedBot}",\n  "query_mode": "${mode}",\n  "demo_mode": true\n}\n\`\`\`\n\n> 💡 **Demo Mode**: You're experiencing the interactive live demo. [Create a free account](/signup) to upload your own files and connect custom LLM keys!`;

        const assistantMsg = {
          id: asstMsgId,
          role: "assistant",
          content: demoResponseText,
          createdAt: new Date().toISOString(),
          sources: [
            { title: "TriVisionX Ingestion Spec", url: "/docs", score: 0.98 },
            { title: "LangGraph Architecture Guide", url: "/blog", score: 0.93 },
          ],
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                ...c,
                messages: [...(c.messages || []), assistantMsg],
                messageCount: (c.messages || []).length + 1,
                preview: demoResponseText.slice(0, 80),
              }
              : c,
          ),
        );
        setIsResponding(false);
        setAgentState(null);
      }, 1000);
      return;
    }

    if (convId === "new") {
      try {
        const apiUrl = API_BASE_URL;
        const res = await fetch(`${apiUrl}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title:
              content.trim().split(/\s+/).slice(0, 6).join(" ").slice(0, 50) ||
              "New Chat",
            folder: "Work Projects",
            pinned: false,
          }),
        });
        if (res.ok) {
          const item = await res.json();
          targetConvId = item.id;
          const initialConv = {
            ...item,
            updatedAt: now,
            messages: [userMsg],
            messageCount: 1,
            preview: content.slice(0, 80),
          };
          setConversations((prev) => [initialConv, ...prev]);
          setSelectedId(targetConvId);
        } else {
          return;
        }
      } catch (err) {
        console.error("Failed to create conversation", err);
        return;
      }
    } else {
      const targetConv = conversations.find((c) => c.id === convId);
      if (targetConv && targetConv.title === "New Chat") {
        let newTitle = content.trim().split(/\s+/).slice(0, 5).join(" ");
        if (newTitle.length < content.trim().length) newTitle += "...";
        renameConversation(convId, newTitle);
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const msgs = [...(c.messages || []), userMsg];
          return {
            ...c,
            messages: msgs,
            updatedAt: now,
            messageCount: msgs.length,
            preview: content.slice(0, 80),
          };
        }),
      );
    }

    const asstMsgId = Math.random().toString(36).slice(2);
    // Pre-create empty assistant placeholder so early supervisor/node/citation events attach reliably
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== targetConvId) return c;
        if ((c.messages || []).some((m) => m.id === asstMsgId)) return c;
        return {
          ...c,
          messages: [
            ...(c.messages || []),
            {
              id: asstMsgId,
              role: "assistant",
              content: "",
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }),
    );

    if (selectedBot !== "Fast") {
      setIsThinking(true);
      setThinkingConvId(targetConvId);
    }
    setIsResponding(true);
    setAgentState(null);
    setProviderSwitchEvent(null);
    setSupervisorDecision(null);

    if (chatAbortRef.current) {
      chatAbortRef.current.abort();
    }
    const abortController = new AbortController();
    chatAbortRef.current = abortController;

    const BOT_MODEL_MAP = {
      "Gemini 2.5 Flash": { model_provider: "google", model_name: "gemini-2.5-flash" },
      "GPT-4o": { model_provider: "openai", model_name: "gpt-4o" },
      "Claude Sonnet 4": { model_provider: "anthropic", model_name: "claude-sonnet-4-20250514" },
      "Llama 3.3 70B": { model_provider: "groq", model_name: "llama-3.3-70b-versatile" },
      "Mistral Large": { model_provider: "mistral", model_name: "mistral-large-latest" },
      "Command R+": { model_provider: "cohere", model_name: "command-r-plus" },
      "Ollama Local": { model_provider: "ollama", model_name: "llama3.2" },
    };
    const modelSelection = BOT_MODEL_MAP[selectedBot] || { model_provider: null, model_name: null };

    try {
      const apiUrl = API_BASE_URL;
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
        body: JSON.stringify({
          msg: content,
          conversation_id: targetConvId,
          mode,
          model_provider: modelSelection.model_provider,
          model_name: modelSelection.model_name,
          filename: fileRef ? fileRef.name : null,
          active_features: activeFeatures,
          is_voice: isVoice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let textContent = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const dataStr = line.slice(6);
            let data;
            try {
              data = JSON.parse(dataStr);
            } catch {
              continue;
            }

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.type === "token" && data.data) {
              setIsThinking(false);
              setThinkingConvId(null);

              textContent += data.data;
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) =>
                    m.id === asstMsgId ? { ...m, content: textContent } : m,
                  );
                  return { ...c, messages: msgs, preview: textContent.slice(0, 80) };
                }),
              );
            }

            if (data.node) {
              setAgentState(data.node);
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) => {
                    if (m.id !== asstMsgId) return m;
                    const currentSteps = m.agent_steps || [];
                    const existingStepIdx = currentSteps.findIndex((s) => s.node === data.node);
                    const updatedSteps = [...currentSteps];
                    if (existingStepIdx === -1) {
                      updatedSteps.push({
                        node: data.node,
                        status: data.status,
                        output: data.output || null,
                        timestamp: new Date().toISOString(),
                      });
                    } else {
                      updatedSteps[existingStepIdx] = {
                        ...updatedSteps[existingStepIdx],
                        status: data.status,
                        output: data.output || updatedSteps[existingStepIdx].output || null,
                      };
                    }
                    return { ...m, agent_steps: updatedSteps };
                  });
                  return { ...c, messages: msgs };
                })
              );
            }

            if (data.type === "citations" && Array.isArray(data.data)) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) =>
                    m.id === asstMsgId ? { ...m, sources: data.data } : m,
                  );
                  return { ...c, messages: msgs };
                }),
              );
            }

            if (data.type === "quality_score" && data.data) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) =>
                    m.id === asstMsgId ? { ...m, quality_score: data.data } : m,
                  );
                  return { ...c, messages: msgs };
                }),
              );
            }

            if (data.type === "provider_switch") {
              setProviderSwitchEvent({ from: data.from, to: data.to, reason: data.reason });
            }

            if (data.type === "supervisor_decision" && data.data) {
              setSupervisorDecision(data.data);
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) =>
                    m.id === asstMsgId ? { ...m, supervisor_decision: data.data } : m,
                  );
                  return { ...c, messages: msgs };
                }),
              );
            }

            if (data.done) {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  const msgs = (c.messages || []).map((m) =>
                    m.id === asstMsgId ? { ...m, sources: data.sources ?? m.sources, source_heatmap: data.source_heatmap || [] } : m,
                  );
                  return { ...c, messages: msgs };
                }),
              );
              setAgentState(null);
              setIsThinking(false);
              setThinkingConvId(null);
              setSupervisorDecision(null);
              setIsResponding(false);
              setProviderSwitchEvent(null);
            }
          }
        }
      }
      setIsResponding(false);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      console.error("Error fetching response:", error);
      setIsResponding(false);
      setIsThinking(false);
      setThinkingConvId(null);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConvId) return c;
          const msgs = (c.messages || []).map((m) =>
            m.id === asstMsgId
              ? {
                ...m,
                content: m.content || (error?.message || "Sorry, I couldn't process your request. Please try again."),
              }
              : m,
          );
          return { ...c, messages: msgs };
        }),
      );
    } finally {
      if (chatAbortRef.current === abortController) {
        chatAbortRef.current = null;
      }
    }
  }
  function editMessage(convId, messageId, newContent) {
    const now = new Date().toISOString();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m,
        );
        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        };
      }),
    );
  }

  function resendMessage(convId, messageId, selectedBot = "Fast") {
    const conv = conversations.find((c) => c.id === convId);
    const msg = conv?.messages?.find((m) => m.id === messageId);
    if (!msg) return;
    sendMessage(convId, msg.content, "research", msg.attachedFile || null, selectedBot);
  }

  function pauseThinking() {
    if (chatAbortRef.current) {
      chatAbortRef.current.abort();
      chatAbortRef.current = null;
    }
    setIsThinking(false);
    setThinkingConvId(null);
    setIsResponding(false);
    setAgentState(null);
  }

  function handleUseTemplate(template) {
    if (composerRef.current) {
      composerRef.current.insertTemplate(template.content);
    }
  }

  const composerRef = useRef(null);

  const selected = useMemo(() => {
    if (selectedId === "new") {
      return {
        id: "new",
        title: "New Chat",
        messages: [],
        preview: "Say hello to start...",
      };
    }
    return conversations.find((c) => c.id === selectedId) || null;
  }, [selectedId, conversations]);

  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;

    // Trigger swipe if horizontal displacement dominates (vertical delta < 80px)
    if (Math.abs(deltaY) < 80) {
      if (deltaX > 60) {
        // Swiped Left to Right -> Open Sidebar
        setSidebarOpen(true);
      } else if (deltaX < -60) {
        // Swiped Right to Left -> Close Sidebar
        setSidebarOpen(false);
      }
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Live Demo Banner — only shown on /demo route and only when NOT logged in */}
      {isDemoMode && (!user?.email || user?.email === "demo@trivisionx.ai") && (typeof window !== "undefined" && window.location.pathname.startsWith("/demo")) && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between text-xs text-foreground shrink-0 z-50">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-bold text-primary">Live Interactive Demo</span>
            <span className="text-muted-foreground hidden sm:inline">
              — Exploring TriVisionX guest workspace without login or signup.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md font-semibold hover:bg-primary/90 transition-all shadow-xs"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex flex-1 min-h-0 w-full overflow-hidden"
      >

        <div className="relative z-10 flex h-full w-full overflow-hidden p-0 md:p-4 md:gap-4">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            conversations={conversations}
            pinned={pinned}
            recent={recent}
            folders={folders}
            folderCounts={folderCounts}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setSidebarOpen(false);
            }}
            togglePin={togglePin}
            query={query}
            setQuery={setQuery}
            searchRef={searchRef}
            createFolder={createFolder}
            deleteFolder={deleteFolder}
            renameFolder={renameFolder}
            createNewChat={createNewChat}
            templates={templates}
            setTemplates={setTemplates}
            onUseTemplate={handleUseTemplate}
            onDeleteConversation={deleteConversation}
            onRenameConversation={renameConversation}
            user={user}
            onUserUpdate={fetchUser}
          />

          <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background md:border md:border-border md:rounded-xl md:bg-card md:shadow-sm transition-colors duration-200">
            {!["docs", "calendar", "email", "brain", "tasks", "notes", "integrations", "plugins", "setting", "settings", "competitive", "memory"].includes(selectedId) && (
              <Header
                createNewChat={createNewChat}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarOpen={setSidebarOpen}
                user={user}
                onUserUpdate={fetchUser}
                selectedBot={selectedBot}
                setSelectedBot={setSelectedBot}
                onToggleIntegrations={() => setSelectedId(selectedId === "integrations" || selectedId === "plugins" ? null : "integrations")}
                onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
                onOpenWorkflows={() => setIsWorkflowsOpen(true)}
              />
            )}
            {["docs", "calendar", "email", "brain", "tasks", "notes", "integrations", "plugins", "setting", "settings", "competitive", "memory"].includes(selectedId) && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden absolute top-4 left-4 z-40 p-2 bg-background/80 hover:bg-muted border border-border/80 rounded-xl text-muted-foreground hover:text-foreground shadow-md transition-colors cursor-pointer"
              >
                <Menu className="size-4.5" />
              </button>
            )}
            {selectedId === "docs" ? (
              <div className="relative flex-1 overflow-y-auto bg-background pb-16">
                <div className="relative px-6 py-8 lg:px-8 max-w-7xl mx-auto">
                  <div className="flex flex-col space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Data Overview
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      Gallery
                    </h1>
                    <p className="max-w-2xl text-base text-muted-foreground">
                      Browse and manage your uploaded documents, images, and conversations. Use the
                      tables below to search, sort, and organize your files.
                    </p>
                  </div>
                  <DashboardDocsTable />
                </div>
              </div>
            ) : selectedId === "calendar" ? (
              <CalendarDashboard />
            ) : selectedId === "email" ? (
              <EmailDashboard />
            ) : selectedId === "brain" ? (
              <BrainDashboard />
            ) : selectedId === "tasks" ? (
              <TaskDashboard />
            ) : selectedId === "notes" ? (
              <NotesDashboard />
            ) : selectedId === "integrations" || selectedId === "plugins" ? (
              <IntegrationsDashboard onNavigateToChat={() => setSelectedId(null)} />
            ) : selectedId === "setting" || selectedId === "settings" ? (
              <SettingsDashboard onNavigateToChat={() => setSelectedId(null)} />
            ) : selectedId === "competitive" ? (
              <CompetitiveIntelligenceDashboard />
            ) : selectedId === "memory" ? (
              <MemoryTimeline />
            ) : (
              <ChatPane
                ref={composerRef}
                conversation={selected}
                user={user}
                onSend={(content, mode, fileRef, activeFeatures, isVoice = false) => {
                  if (selected) sendMessage(selected.id, content, mode, fileRef, selectedBot, activeFeatures, isVoice);
                }}
                onEditMessage={(messageId, newContent) =>
                  selected && editMessage(selected.id, messageId, newContent)
                }
                onResendMessage={(messageId) => {
                  if (selected) resendMessage(selected.id, messageId, selectedBot);
                }}
                isThinking={isThinking && thinkingConvId === selected?.id}
                isResponding={isResponding}
                onPauseThinking={pauseThinking}
                agentState={agentState}
                providerSwitchEvent={providerSwitchEvent}
                onDismissProviderSwitch={() => setProviderSwitchEvent(null)}
                supervisorDecision={supervisorDecision}
                selectedBot={selectedBot}
                onNavigateTo={(id) => setSelectedId(id)}
                onAddNewSkill={() => setSelectedId("integrations")}
              />
            )}
            <IntegrationsPanel
              isOpen={isIntegrationsOpen}
              onClose={() => setIsIntegrationsOpen(false)}
            />
            <AuditLogsModal
              isOpen={isAuditLogsOpen}
              onClose={() => setIsAuditLogsOpen(false)}
            />
            <WorkflowsModal
              isOpen={isWorkflowsOpen}
              onClose={() => setIsWorkflowsOpen(false)}
            />
            <OnboardingWizard
              isOpen={isOnboardingOpen}
              onClose={() => setIsOnboardingOpen(false)}
              onSelectPrompt={(promptText) => {
                setSelectedId("new");
                setTimeout(() => {
                  composerRef.current?.setValue?.(promptText);
                  composerRef.current?.focus?.();
                }, 150);
              }}
            />
            <FloatingVoiceAssistant
              onTranscribeText={(text) => {
                composerRef.current?.setValue?.(text);
                composerRef.current?.focus?.();
              }}
              onSendPrompt={(text) => {
                if (selected) {
                  sendMessage(selected.id, text, "agentic", null, selectedBot, {}, true);
                }
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
