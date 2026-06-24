"use client";

import Link from "next/link";
import { PageShell, Section } from "@/components/page-shell";
import { CareersList } from "@/components/careers-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Globe,
  TrendingUp,
  Brain,
  ArrowRight,
  MapPin,
  Clock,
  Briefcase,
  Mail,
  ChevronRight,
} from "lucide-react";

const perks = [
  {
    icon: Globe,
    title: "Remote-first",
    description: "Work from anywhere, async by default. We operate across 6 time zones with no mandatory hours.",
  },
  {
    icon: TrendingUp,
    title: "Early Equity",
    description: "Competitive packages with meaningful ownership. We believe everyone who builds the company should own a piece of it.",
  },
  {
    icon: Brain,
    title: "Hard Problems",
    description: "We work on genuinely unsolved challenges in AI — multi-agent orchestration, semantic retrieval, and citation verification.",
  },
];

const roles = [
  { title: "Senior Backend Engineer", team: "Platform", location: "Remote", type: "Full-time", hot: true },
  { title: "AI/ML Research Scientist", team: "Research", location: "Remote", type: "Full-time", hot: true },
  { title: "Senior Frontend Engineer", team: "Product", location: "Remote", type: "Full-time", hot: false },
  { title: "DevRel Engineer", team: "Growth", location: "Remote", type: "Full-time", hot: false },
  { title: "Enterprise Account Executive", team: "Sales", location: "San Francisco, CA", type: "Full-time", hot: false },
];

const stats = [
  { value: "12", label: "Team members" },
  { value: "6", label: "Countries" },
  { value: "100%", label: "Remote" },
  { value: "$4M", label: "Raised" },
];

export default function CareersPage() {
  return (
    <PageShell
      badge="Careers"
      title="Build the Future with Us"
      subtitle="We're a fully remote team passionate about making AI research reliable, transparent, and powerful. If you love solving hard problems, you'll fit right in."
    >
      {/* Stats bar */}
      <div className="flex justify-center mb-16 relative z-10">
        <Card className="inline-flex flex-wrap items-center justify-center gap-0 p-2">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <div className="px-6 py-2 text-center">
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{stat.label}</div>
              </div>
              {i < stats.length - 1 && <div className="h-8 w-px bg-border" />}
            </div>
          ))}
        </Card>
      </div>

      {/* Why TriVisionX */}
      <Section title="Why TriVisionX">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <Card key={perk.title} className="p-6 hover:bg-accent/40 transition-colors duration-200 cursor-pointer">
                <div className="inline-flex p-2.5 rounded-lg bg-secondary border border-border text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="font-semibold text-foreground text-base mb-2">{perk.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">{perk.description}</CardDescription>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Open Roles */}
      <Section title="Open Roles">
        <CareersList />
      </Section>

      {/* Open Application CTA */}
      <Card className="p-10 text-center mt-12 relative z-10">
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary border border-border mb-5">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Don't See Your Role?</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-7 leading-relaxed">
            We're always looking for exceptional people. Send your CV and a note about what you'd like to work on — we
            read every application.
          </p>
          <Button
            asChild
            className="rounded-lg px-8 h-11 font-semibold text-sm shadow-sm"
          >
            <Link href="mailto:careers@trivisionx.ai">
              <Mail className="w-4 h-4 mr-2" />
              careers@trivisionx.ai
              <ChevronRight className="w-4 h-4 ml-1.5 opacity-60" />
            </Link>
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
