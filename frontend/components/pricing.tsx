"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Bot, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Developer",
    description: "Open BYOK workspace for solo researchers and builders",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Full LangGraph multi-agent & quick modes",
      "Isolated per-user Pinecone vector namespace",
      "BYOK support (OpenAI, Gemini, Anthropic, DeepSeek, Groq, Ollama)",
      "Integrated Notes, Tasks, Calendar & Email hub",
      "Markdown research report export",
    ],
    cta: "Start Building Free",
    href: "/signup",
    highlighted: false,
    icon: Bot,
  },
  {
    name: "Team Preview",
    description: "Extended workspace automation & multi-format publishing",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Scheduled Cron & event-driven agent workflows",
      "Branded PDF, DOCX & XLSX deliverable exports",
      "Slack, Teams, Notion, Confluence & Jira publishing",
      "Custom system-prompt skills & MCP server registry",
      "Gemini audio transcription & voice playback",
      "Explainable AI audit trail inspector",
    ],
    cta: "Create Free Account",
    href: "/signup?plan=team",
    highlighted: true,
    icon: Zap,
  },
  {
    name: "Self-Hosted",
    description: "For organizations deploying on private cloud or Docker",
    price: { monthly: 0, yearly: 0 },
    customPriceLabel: "OSS / Custom",
    features: [
      "Full Docker Compose stack (Next.js, FastAPI, MongoDB, Redis)",
      "Fernet-encrypted BYOK & webhook secrets vault",
      "Google & GitHub OAuth 2.0 authentication",
      "SSRF-protected web scraping & webhook dispatchers",
      "Complete control over LLM endpoints & data residency",
    ],
    cta: "Contact Us",
    href: "/contact",
    highlighted: false,
    icon: ShieldAlert,
  },
];

function BorderBeam() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div
        className="absolute w-24 h-24 bg-white/20 blur-xl border-beam"
        style={{
          offsetPath: "rect(0 100% 100% 0 round 16px)",
        }}
      />
    </div>
  );
}

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <section id="pricing" className="relative py-28 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden select-none">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/50 text-foreground text-xs font-medium tracking-wide shadow-xs mb-4">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>TRANSPARENT VALUE MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Predictable compute pricing.
            <br />
            <span className="text-muted-foreground font-semibold">Scale dynamically as you grow.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground mt-3 mb-8 leading-relaxed">
            Choose a plan that fits your computational throughput. Scale concurrency and agent steps dynamically without hidden compute fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-muted/80 border border-border/80 backdrop-blur-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                billingCycle === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-background rounded-full shadow-2xs border border-border"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                billingCycle === "yearly" ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {billingCycle === "yearly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-background rounded-full shadow-2xs border border-border"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Yearly</span>
              <span className="relative z-10 ml-2 px-2 py-0.5 text-[10px] font-mono bg-primary/10 text-primary border border-primary/20 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col justify-between ${
                  plan.highlighted
                    ? "bg-card/95 dark:bg-card/80 border-primary/80 backdrop-blur-2xl [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_12px_36px_rgba(0,0,0,.12),0_24px_50px_rgba(0,0,0,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset,0_0_0_2px_rgba(59,130,246,0.4),0_24px_60px_rgba(0,0,0,.8)] hover:shadow-2xl"
                    : "bg-card/85 dark:bg-card/65 border-border/80 backdrop-blur-xl hover:border-primary/40 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_16px_rgba(0,0,0,.04),0_16px_36px_rgba(0,0,0,.04)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_16px_36px_rgba(0,0,0,.5)] hover:shadow-2xl"
                }`}
              >
                {plan.highlighted && <BorderBeam />}

                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">
                        {"customPriceLabel" in plan && plan.customPriceLabel
                          ? plan.customPriceLabel
                          : `$${plan.price[billingCycle]}`}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-muted-foreground text-xs font-mono">/month</span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.price.yearly > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        Preview tier • ${plan.price.yearly * 12}/yr billed annually when enabled
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-xs text-foreground/90 leading-relaxed"
                      >
                        <Check
                          className="w-4 h-4 text-primary shrink-0 mt-0.5"
                          strokeWidth={2}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild
                  className={`w-full rounded-xl h-11 text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                  }`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
