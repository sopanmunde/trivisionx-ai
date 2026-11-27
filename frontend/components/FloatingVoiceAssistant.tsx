"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Send,
  X,
  Radio,
  CornerDownLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface FloatingVoiceAssistantProps {
  onTranscribeText?: (text: string) => void;
  onSendPrompt?: (text: string) => void;
}

export function FloatingVoiceAssistant({
  onTranscribeText,
  onSendPrompt
}: FloatingVoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 25, 40, 20, 30, 50, 25]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Check for webkitSpeechRecognition or SpeechRecognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    };
  }, []);

  // Simulate audio visualizer pulsing when recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 40 + 10),
          Math.floor(Math.random() * 60 + 15),
          Math.floor(Math.random() * 80 + 20),
          Math.floor(Math.random() * 95 + 25),
          Math.floor(Math.random() * 70 + 20),
          Math.floor(Math.random() * 50 + 15),
          Math.floor(Math.random() * 30 + 10)
        ]);
      }, 100);
    } else {
      setAudioLevel([15, 20, 25, 20, 15, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startListening = async () => {
    setTranscript("");
    setIsRecording(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        toast.info("Voice assistant listening...", { duration: 1500 });
        return;
      } catch (e) {
        console.warn("Recognition already started or error:", e);
      }
    }

    // Fallback: MediaRecorder sending to backend /audio/transcribe
    const token = localStorage.getItem("token");
    const isDemo = localStorage.getItem("is_demo") === "true";
    if (!token || token === "demo_guest_token" || isDemo) {
      setIsRecording(false);
      toast.error("Sign in or use a browser supporting Web Speech Recognition.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size === 0) return;

        setIsProcessing(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const response = await fetch(`${API_BASE_URL}/audio/transcribe`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Transcription failed (HTTP ${response.status})`);
          }
          const data = await response.json();
          if (data.text) {
            setTranscript(data.text);
          } else {
            toast.info("No speech detected in audio recording.");
          }
        } catch (err: any) {
          toast.error(err.message || "Audio transcription service is unavailable.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setIsRecording(false);
      toast.error("Microphone access was denied or is unavailable.");
    }
  };

  const stopListening = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleApplyToChat = () => {
    if (!transcript.trim()) return;
    if (onTranscribeText) {
      onTranscribeText(transcript.trim());
    }
    toast.success("Voice transcript copied to composer!");
    setTranscript("");
    setIsOpen(false);
  };

  const handleSendImmediately = () => {
    if (!transcript.trim()) return;
    if (onSendPrompt) {
      onSendPrompt(transcript.trim());
    } else if (onTranscribeText) {
      onTranscribeText(transcript.trim());
    }
    setTranscript("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating launcher button in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setIsOpen(true);
                startListening();
              }}
              className="relative group h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              title="Voice Push-To-Talk Assistant"
            >
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 pointer-events-none" />
              <Mic className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating HUD Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-4.5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isRecording ? "bg-rose-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-xs font-semibold text-foreground">TriVisionX Voice-to-Action</span>
              </div>
              <button
                onClick={() => {
                  stopListening();
                  setIsOpen(false);
                }}
                className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Audio Waveform display */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1.5 h-12 justify-center mb-2">
                {audioLevel.map((lvl, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-100 ${
                      isRecording ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${lvl}%` }}
                  />
                ))}
              </div>

              <button
                onClick={toggleRecording}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isRecording
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                }`}
              >
                {isRecording ? <Mic className="h-6 w-6 animate-pulse" /> : <MicOff className="h-6 w-6" />}
              </button>

              <span className="text-[11px] text-muted-foreground mt-2">
                {isRecording ? "Listening... Click mic to pause" : "Click mic to speak"}
              </span>
            </div>

            {/* Live Transcript Box */}
            <div className="bg-muted/40 border border-border/60 rounded-xl p-3 min-h-[70px] max-h-32 overflow-y-auto mb-3">
              {isProcessing ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Transcribing audio via Gemini transcription API...
                </div>
              ) : transcript ? (
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  &ldquo;{transcript}&rdquo;
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground/70">
                  Speak into your microphone. Your speech will be transcribed in real-time.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyToChat}
                disabled={!transcript.trim()}
                className="flex-1 text-xs h-8 border-border"
              >
                Insert in Chat
              </Button>
              <Button
                size="sm"
                onClick={handleSendImmediately}
                disabled={!transcript.trim()}
                className="flex-1 text-xs h-8 bg-primary text-primary-foreground gap-1.5"
              >
                <Send className="h-3 w-3" /> Send to Agent
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
