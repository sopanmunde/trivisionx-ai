"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Search,
  Trash2,
  Database,
  Loader2,
  UploadCloud,
  File as FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";
import RagPipelineVisualizer from "./RagPipelineVisualizer";

export default function DocumentLibrary({ open, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploadingStage, setUploadingStage] = useState(null); // 'parsing', 'chunking', etc.
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadChunks, setUploadChunks] = useState(0);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Are you sure you want to delete ${doc.filename}?`)) return;

    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/documents/${doc.id}?filename=${encodeURIComponent(doc.filename)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success("Document deleted");
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting document");
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext)) {
      toast.error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    setUploadingStage("parsing");
    setUploadProgress(10);
    setUploadChunks(0);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/documents/upload/stream`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.stage) {
                  setUploadingStage(data.stage);
                  setUploadProgress(data.progress || 0);
                  if (data.chunks) setUploadChunks(data.chunks);
                }
                if (data.error) throw new Error(data.error);
                
                if (data.stage === "done") {
                  setTimeout(() => {
                    setUploadingStage(null);
                    fetchDocuments();
                    toast.success(`Indexed ${data.chunks} chunks successfully.`);
                  }, 2000);
                }
              } catch (e) {
                // Ignore incomplete JSON
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
      setUploadingStage(null);
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm dark:bg-zinc-950/60"
          />

          <motion.div
            initial={{ x: "100%", boxShadow: "-20px 0 25px -5px rgba(0,0,0,0.1)" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex h-full w-[450px] max-w-[90vw] flex-col bg-white shadow-2xl dark:bg-[#1a1a1a] border-l border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/80">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Document Library
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Manage indexed files for Deep Research mode.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {uploadingStage && (
                <div className="mb-8">
                  <RagPipelineVisualizer
                    currentStage={uploadingStage}
                    progress={uploadProgress}
                    chunks={uploadChunks}
                  />
                </div>
              )}

              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-blue-500"
                  />
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!uploadingStage}
                  className="h-10 shrink-0 gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload
                </Button>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleUpload}
                />
              </div>

              {/* Document List */}
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                    <FileIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    No documents uploaded
                  </h3>
                  <p className="mt-1 text-center text-[13px] text-zinc-500 dark:text-zinc-400 max-w-[250px]">
                    Upload PDFs or Word docs to use them in Deep Research mode.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocs.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#212121] dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100" title={doc.filename}>
                            {doc.filename}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                              <Database className="h-3 w-3" />
                              {doc.chunk_count} chunks
                            </span>
                            <span>·</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                        className="shrink-0 h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                  {filteredDocs.length === 0 && (
                    <p className="text-center text-sm text-zinc-500 py-4">No documents match your search.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
