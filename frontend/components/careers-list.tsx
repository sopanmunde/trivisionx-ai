"use client";

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, ArrowRight, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

type Role = {
  title: string;
  team: string;
  location: string;
  type: string;
  hot: boolean;
  description: string;
  requirements: string[];
};

const roles: Role[] = [
  {
    title: "Backend & LangGraph Contributor", team: "Platform", location: "Remote", type: "Contributor / Inquiry", hot: true,
    description: "Collaborate on FastAPI routes, LangGraph agent orchestration, and Pinecone RAG retrieval.",
    requirements: ["Python & FastAPI async patterns", "Experience with LangChain or LangGraph", "MongoDB & REST API design"]
  },
  {
    title: "AI Retrieval & Evaluation Researcher", team: "Research", location: "Remote", type: "Contributor / Inquiry", hot: true,
    description: "Help benchmark Hybrid MMR retrieval, citation grounding, and multi-agent routing accuracy.",
    requirements: ["Vector search / RAG pipelines", "Prompt & structured output reliability", "Python evaluation scripts"]
  },
  {
    title: "Frontend Next.js Engineer", team: "Product", location: "Remote", type: "Contributor / Inquiry", hot: false,
    description: "Build accessible interactive workspaces across Next.js 15, TypeScript, Tailwind CSS, and SSE streaming.",
    requirements: ["React, Next.js App Router & TypeScript", "State & streaming UI experience", "Attention to accessibility & testing"]
  },
];

export function CareersList() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          subject: `Career Inquiry: ${selectedRole?.title || "General"}`,
          message: `Role: ${selectedRole?.title || "General"}\nPortfolio/LinkedIn: ${portfolio || "N/A"}\n\nNote:\n${coverLetter.trim() || "No cover note provided."}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to submit application");
      setIsOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPortfolio("");
      setCoverLetter("");
      toast.success("Application Submitted!", {
        description: "Your inquiry was saved to TriVisionX. We'll review it shortly.",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Current Openings</span>
        <Badge variant="secondary" className="text-[11px] font-mono">
          {roles.length} positions
        </Badge>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card rounded-lg border border-border shadow-sm">
        {roles.map((role, i) => (
          <AccordionItem key={role.title} value={`role-${i}`} className="px-6 border-b border-border last:border-0">
            <AccordionTrigger className="py-5 hover:no-underline group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {role.title}
                  </h3>
                  {role.hot && (
                    <Badge variant="default" className="text-[10px] font-mono px-2 py-0 h-4">
                      Hiring
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{role.team}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{role.location}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{role.type}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{role.description}</p>
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-foreground mb-2">Requirements</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {role.requirements.map(req => (
                    <li key={req} className="text-xs text-muted-foreground">{req}</li>
                  ))}
                </ul>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="font-mono text-xs"
                onClick={() => {
                  setSelectedRole(role);
                  setIsOpen(true);
                }}
              >
                Apply for this role <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for {selectedRole?.title}</DialogTitle>
            <DialogDescription>
              Submit your information below and we'll get back to you shortly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">First Name</label>
                <Input required placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Last Name</label>
                <Input required placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Email</label>
              <Input type="email" required placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">LinkedIn / Portfolio URL</label>
              <Input type="url" placeholder="https://linkedin.com/in/jane" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Cover Letter / Note</label>
              <Textarea rows={4} placeholder="Why are you a great fit?" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
              <Send className="w-4 h-4 mr-2" /> {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
