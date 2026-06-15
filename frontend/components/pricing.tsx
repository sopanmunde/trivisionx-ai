"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Bot, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Developer",
    description: "Ideal for building and testing agent logic locally",
    price: { monthly: 0, yearly: 0 },
    features: [
      "10,000 execution runs/month",
      "Single active agent pipeline",
      "Shared Pinecone retriever",
      "Standard OpenAI & Anthropic routing",
      "Community forum support",
    ],
    cta: "Start Building Free",
    highlighted: false,
    icon: Bot,
  },
  {
    name: "Production",
    description: "For production deployments requiring scalable orchestration",
    price: { monthly: 49, yearly: 39 },
    features: [
      "1,000,000 execution runs/month",
      "16 concurrent agent pipelines",
      "Dynamic model routing (Claude, Gemini, DeepSeek)",
      "Self-correcting code execution logs",
      "Dedicated vector store connections",
      "Priority developer Slack support",
      "API & webhook web triggers",
    ],
    cta: "Deploy Production Scale",
    highlighted: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    description: "For organizations requiring isolated execution runtimes",
    price: { monthly: 299, yearly: 239 },
    features: [
      "Unlimited execution runs",
      "Unlimited concurrency & sub-graphs",
      "Isolated sovereign runtime hosting",
      "Anti-CSRF SSO & SAML enforcement",
      "99.9% runtime uptime SLA",
      "Custom LLM finetuning & adapters",
      "Dedicated agent solution engineers",
    ],
    cta: "Request Demo",
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
    <section id="pricing" className="py-24 px-4 bg-zinc-950/40 relative border-t border-zinc-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Predictable pricing built for agent execution
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base">
            Choose a plan that fits your computational throughput. Scale concurrency and agent steps dynamically as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900 border border-zinc-800/80">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                billingCycle === "monthly" ? "text-white" : "text-zinc-400"
              }`}
            >
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-zinc-800 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                billingCycle === "yearly" ? "text-white" : "text-zinc-400"
              }`}
            >
              {billingCycle === "yearly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-zinc-800 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Yearly</span>
              <span className="relative z-10 ml-2 px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
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
                className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${
                  plan.highlighted
                    ? "bg-zinc-900/60 border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.05)]"
                    : "bg-zinc-900/20 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {plan.highlighted && <BorderBeam />}

                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-purple-400" />
                        {plan.name}
                      </h3>
                      <p className="text-zinc-400 text-xs leading-relaxed">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-zinc-500 text-xs font-mono">/month</span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.price.yearly > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                        Billed annually (${plan.price.yearly * 12}/yr)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed"
                      >
                        <Check
                          className="w-4 h-4 text-purple-400 shrink-0 mt-0.5"
                          strokeWidth={2}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full rounded-xl h-11 text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                    plan.highlighted
                      ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-950 shadow-lg"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/80"
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
