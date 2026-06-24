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
    title: "Senior Backend Engineer", team: "Platform", location: "Remote", type: "Full-time", hot: true,
    description: "Build the core infrastructure for our multi-agent orchestration engine using Python, FastAPI, and Pinecone.",
    requirements: ["5+ years backend engineering", "Strong Python & async programming", "Experience with vector databases"]
  },
  { 
    title: "AI/ML Research Scientist", team: "Research", location: "Remote", type: "Full-time", hot: true,
    description: "Improve our Semantic MMR retrieval and hallucination-detection algorithms.",
    requirements: ["PhD or MS in CS/AI", "Published research in NLP or LLMs", "PyTorch expertise"]
  },
  { 
    title: "Senior Frontend Engineer", team: "Product", location: "Remote", type: "Full-time", hot: false,
    description: "Craft a beautiful, highly interactive studio for users to build and debug agent pipelines.",
    requirements: ["Strong React & Next.js", "Experience with complex state management", "Eye for design and UI/UX"]
  },
  { 
    title: "DevRel Engineer", team: "Growth", location: "Remote", type: "Full-time", hot: false,
    description: "Engage with developers, build templates, write tutorials, and speak at conferences.",
    requirements: ["Experience as a developer", "Excellent technical writing", "Public speaking experience"]
  },
  { 
    title: "Enterprise Account Executive", team: "Sales", location: "San Francisco, CA", type: "Full-time", hot: false,
    description: "Close high-value contracts with enterprise clients and build long-term relationships.",
    requirements: ["3+ years enterprise B2B SaaS sales", "Track record of quota attainment", "Excellent communication"]
  },
];

export function CareersList() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    toast.success("Application Submitted!", {
      description: "Thanks for applying. Our team will review your application soon.",
    });
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
                <Input required placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Last Name</label>
                <Input required placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Email</label>
              <Input type="email" required placeholder="jane@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">LinkedIn / Portfolio URL</label>
              <Input type="url" placeholder="https://linkedin.com/in/jane" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Cover Letter / Note</label>
              <Textarea rows={4} placeholder="Why are you a great fit?" />
            </div>
            <Button type="submit" className="w-full mt-4">
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
