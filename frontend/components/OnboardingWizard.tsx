"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Key,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function OnboardingWizard({ isOpen, onClose, onSelectPrompt }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("research");
  const [selectedSampleDoc, setSelectedSampleDoc] = useState("langgraph-rag");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const providers = [
    {
      id: "gemini",
      name: "Google Gemini 1.5 Pro",
      desc: "Fast multimodal context, deep reasoning",
      badge: "Default Free Quota",
      icon: Sparkles,
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/40"
    },
    {
      id: "openai",
      name: "OpenAI GPT-4o",
      desc: "High precision coding & instruction following",
      badge: "BYOK / Pro",
      icon: Cpu,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40"
    },
    {
      id: "anthropic",
      name: "Claude 3.5 Sonnet",
      desc: "Superior technical writing & nuanced synthesis",
      badge: "Pro",
      icon: Bot,
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/40"
    },
    {
      id: "groq",
      name: "Groq Llama 3 70B",
      desc: "Ultra-low latency streaming (500+ tok/s)",
      badge: "Ultra Fast",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/40"
    }
  ];

  const specializations = [
    {
      id: "research",
      title: "Deep Academic Research",
      desc: "Autonomous cross-checking across ArXiv, semantic web, and PDF library with verified citations.",
      icon: Compass
    },
    {
      id: "competitive",
      title: "Competitive Intelligence",
      desc: "Live SWOT matrix, market signals, pricing audits, and competitor feature scorecards.",
      icon: Globe
    },
    {
      id: "coding",
      title: "Full-Stack Code Architect",
      desc: "Multi-agent repository refactoring, bug isolation, and automated unit test generation.",
      icon: Cpu
    },
    {
      id: "summary",
      title: "Executive Synthesis",
      desc: "Turn 100-page regulatory filings or transcripts into actionable 1-page decision memos.",
      icon: FileText
    }
  ];

  const sampleDocs = [
    {
      id: "langgraph-rag",
      title: "Multi-Agent LangGraph & Hybrid RAG Architecture.pdf",
      pages: "18 pages",
      topic: "AI Systems Engineering"
    },
    {
      id: "q3-ai-market",
      title: "Global Enterprise AI & LLM Market Dynamics Q3.pdf",
      pages: "34 pages",
      topic: "Market Strategy"
    },
    {
      id: "security-audit",
      title: "SOC-2 Type II Zero-Trust Vector Ingestion Protocol.pdf",
      pages: "12 pages",
      topic: "Security & Compliance"
    }
  ];

  const handleFinish = (promptToLaunch?: string) => {
    try {
      localStorage.setItem("trivisionx_onboarding_completed", "true");
      if (apiKeyInput.trim()) {
        localStorage.setItem(`custom_key_${selectedProvider}`, apiKeyInput.trim());
      }
    } catch {}
    onClose();
    if (promptToLaunch && onSelectPrompt) {
      onSelectPrompt(promptToLaunch);
    }
  };

  const handleSimulateSeed = () => {
    setIsSeeding(true);
    setTimeout(() => {
      setIsSeeding(false);
      setSeedSuccess(true);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Rocket className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Welcome to TriVisionX</h2>
                <p className="text-xs text-muted-foreground">Quick Setup Wizard & Fleet Initialization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Step {step} of {totalSteps}</span>
              <button
                onClick={() => handleFinish()}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Skip onboarding"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress Line */}
          <div className="w-full bg-muted h-1">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">Select Your Primary AI Engine</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    TriVisionX orchestrates multi-agent tasks using specialized model routers. Select your preferred backbone:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {providers.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedProvider === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                            : "border-border/80 hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{p.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {p.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Optional Custom API Key (Leave empty to use built-in community quota):
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder={`Enter ${selectedProvider.toUpperCase()} API key...`}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="text-xs h-9 bg-background"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Keys are kept locally in your browser storage or isolated container session.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">Choose Primary Agent Specialization</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select the default multi-agent graph configured for your daily workflows:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {specializations.map((spec) => {
                    const Icon = spec.icon;
                    const isSelected = selectedSpecialization === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialization(spec.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border/80 hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
                            {spec.title}
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{spec.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">Pre-Seed Your Knowledge Base</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    TriVisionX performs multimodal RAG with Pinecone embeddings. Pick a pre-indexed sample or upload your own:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {sampleDocs.map((doc) => {
                    const isSelected = selectedSampleDoc === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedSampleDoc(doc.id)}
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border/80 hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{doc.title}</p>
                            <p className="text-[11px] text-muted-foreground">{doc.topic} • {doc.pages}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">Sample</Badge>
                      </div>
                    );
                  })}
                </div>

                <div className="border border-dashed border-border rounded-xl p-4 text-center bg-muted/20">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs font-medium text-foreground">Want to bring your own PDF/Audio/Data?</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Drag and drop any file directly into the chat composer anytime.</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {seedSuccess ? "Knowledge base sample indexed successfully!" : "Pre-index sample into Pinecone vector cache:"}
                  </span>
                  <Button
                    size="sm"
                    variant={seedSuccess ? "default" : "outline"}
                    onClick={handleSimulateSeed}
                    disabled={isSeeding || seedSuccess}
                    className="text-xs h-8"
                  >
                    {isSeeding ? "Indexing Chunks..." : seedSuccess ? "✓ Indexed (42 chunks)" : "Index Sample"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center py-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">You are All Set!</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Your multi-agent environment is primed with {selectedProvider.toUpperCase()} backbone and {selectedSpecialization} pipeline.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-foreground">Launch your first autonomous prompt:</p>
                  
                  <div
                    onClick={() => handleFinish("Perform a deep competitive analysis between OpenAI, Anthropic, and Google Gemini with market SWOT matrix.")}
                    className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        "Perform a deep competitive analysis between OpenAI, Anthropic, and Google Gemini..."
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Triggers competitive_graph with 5 agents</span>
                  </div>

                  <div
                    onClick={() => handleFinish("Synthesize the architectural trade-offs of LangGraph multi-agent routing vs single LLM prompts.")}
                    className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        "Synthesize the architectural trade-offs of LangGraph multi-agent routing..."
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Triggers research_graph with citation audits</span>
                  </div>

                  <div
                    onClick={() => handleFinish("Generate a full production API benchmark report with latency, cost, and throughput metrics.")}
                    className="p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        "Generate a full production API benchmark report with latency & cost..."
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Triggers data_analysis_graph</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFinish()}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip Setup
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                size="sm"
                onClick={() => setStep(step + 1)}
                className="gap-1.5 text-xs font-medium"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleFinish()}
                className="gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Go to Workspace <Rocket className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
