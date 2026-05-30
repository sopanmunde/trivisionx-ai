"use client";
/**
 * hooks/use-upload.ts
 * Handles file upload with progress tracking.
 */
import { useState, useCallback } from "react";
import { documents } from "@/lib/api";

export interface UploadState {
  isUploading: boolean;
  progress: number;
  filename: string | null;
  chunks: number | null;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    filename: null,
    chunks: null,
    error: null,
  });

  const upload = useCallback(async (file: File): Promise<boolean> => {
    setState({ isUploading: true, progress: 0, filename: file.name, chunks: null, error: null });

    try {
      const result = await documents.upload(file, (pct) => {
        setState((s) => ({ ...s, progress: pct }));
      });

      setState({
        isUploading: false,
        progress: 100,
        filename: result.filename,
        chunks: result.chunks,
        error: null,
      });
      return true;
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isUploading: false,
        error: err.message || "Upload failed",
      }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, filename: null, chunks: null, error: null });
  }, []);

  return { ...state, upload, reset };
}
