"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Building2,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MacBadge } from "@/components/page-shell";

interface Feature {
  text: string;
  tooltip: string;
}

interface PricingTableProps {
  pricingFeatures: {
    Starter: Feature[];
    Pro: Feature[];
    Enterprise: Feature[];
  };
}

export function PricingTable({ pricingFeatures }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      <Tabs
        defaultValue="monthly"
        value={billingCycle}
        onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
        className="w-full flex flex-col items-center mb-14"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="monthly" className="px-8">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" className="px-8">
            Yearly{" "}
            <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
              Save 20%
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40 group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted border border-border">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Starter</CardTitle>
              </div>
              <CardDescription className="text-xs">For individuals exploring agentic AI research.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">Free</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mb-6 bg-muted px-2.5 py-1.5 rounded-md border border-border self-start">
                10,000 execution cycles/month
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Starter.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{f.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/signup?plan=starter" className="flex items-center justify-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col justify-between rounded-2xl border border-primary/80 bg-card/95 dark:bg-card/80 backdrop-blur-2xl transition-all duration-500 ease-out hover:-translate-y-2 [box-shadow:0_0_0_2px_rgba(59,130,246,0.35),0_12px_36px_rgba(0,0,0,.12)] dark:[box-shadow:0_0_0_2px_rgba(59,130,246,0.4),0_24px_60px_rgba(0,0,0,.8)] hover:shadow-2xl group">
            <div className="absolute top-4 right-4">
              <MacBadge color="default">✦ Popular</MacBadge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Pro</CardTitle>
              </div>
              <CardDescription className="text-xs">
                For power users and teams running advanced LangGraph pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {billingCycle === "yearly" ? "$39" : "$49"}
                </span>
                <span className="text-muted-foreground text-sm mb-1 font-medium">/mo</span>
              </div>
              <p className="text-[11px] text-primary font-mono mb-6 bg-primary/5 px-2.5 py-1.5 rounded-md border border-primary/20 self-start">
                Preview pricing • Free BYOK workspace available
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Pro.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{f.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/signup?plan=pro" className="flex items-center justify-center gap-2">
                  Start Free with BYOK <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40 group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted border border-border">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Enterprise</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Tailored for organizations with compliance and SLA needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <div className="mb-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">Custom</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono mb-6 bg-muted px-2.5 py-1.5 rounded-md border border-border self-start">
                Unlimited execution cycles
              </p>
              <TooltipProvider>
                <ul className="space-y-3 flex-1 mb-6">
                  {pricingFeatures.Enterprise.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{f.text}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{f.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </TooltipProvider>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full rounded-lg" variant="outline">
                <Link href="/contact" className="flex items-center justify-center gap-2">
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Tabs>
    </>
  );
}
