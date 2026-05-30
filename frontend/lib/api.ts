/**
 * lib/api.ts — Typed API client
 * All backend calls go through this module.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Generic fetch wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }

  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    confirm_password: string;
  }) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => apiFetch<{ email: string; username: string; first_name: string; last_name: string }>("/auth/me"),
};

// ── Conversations ────────────────────────────────────────────────────────────

export const conversations = {
  list: () => apiFetch<any[]>("/conversations"),
  create: (title: string) =>
    apiFetch("/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  update: (id: string, data: Partial<{ title: string; pinned: boolean }>) =>
    apiFetch(`/conversations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/conversations/${id}`, { method: "DELETE" }),
  messages: (id: string) => apiFetch<any[]>(`/conversations/${id}/messages`),
};

// ── Documents ────────────────────────────────────────────────────────────────

export const documents = {
  list: () => apiFetch<any[]>("/documents"),

  upload: (file: File, onProgress?: (pct: number) => void): Promise<{ chunks: number; filename: string }> => {
    return new Promise((resolve, reject) => {
      const token = getToken();
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", `${BASE_URL}/documents/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.detail || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(formData);
    });
  },
};

// ── Reports ──────────────────────────────────────────────────────────────────

export const reports = {
  generate: (query: string, conversationId?: string, topK: number = 10) =>
    apiFetch<{ report_id: string; report: string; citations: any[] }>("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ query, conversation_id: conversationId, top_k: topK }),
    }),

  history: () => apiFetch<any[]>("/reports/history"),

  exportMarkdown: (reportId: string) =>
    fetch(`${BASE_URL}/reports/${reportId}/export`, {
      headers: authHeaders() as Record<string, string>,
    }).then((r) => r.blob()),
};
