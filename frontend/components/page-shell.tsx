import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

function getIconComponent(name: string) {
  const pascalCaseName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return (LucideIcons as any)[pascalCaseName] || (LucideIcons as any)[name];
}

export function PageShell({
  badge,
  title,
  subtitle,
  children,
}: {
  badge?: string | React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background pt-28 pb-20 overflow-hidden select-none">
      {/* 3D Ambient Backdrop Spotlight */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-14">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted/50 text-foreground text-xs font-medium tracking-wide shadow-xs mb-2">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  className = "",
  delay,
}: {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section className={`relative py-12 mt-12 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6 text-foreground tracking-tight">{title}</h2>}
      {children}
    </section>
  );
}

export function CardGrid({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  children,
  className = "",
  delay,
}: {
  icon?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const IconComponent = icon ? getIconComponent(icon) : null;
  
  return (
    <Card className={`group relative h-full rounded-2xl border border-border/80 bg-card/85 dark:bg-card/65 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1.5 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_4px_16px_rgba(0,0,0,.04),0_16px_36px_rgba(0,0,0,.04)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff0d_inset,0_0_0_1px_rgba(255,255,255,.05),0_16px_36px_rgba(0,0,0,.5)] hover:shadow-2xl hover:border-primary/50 ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <CardHeader className="relative">
        {IconComponent && (
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-4 border border-border/70 shadow-xs group-hover:border-primary/40 group-hover:text-primary transition-all duration-300">
            <IconComponent className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          </div>
        )}
        <CardTitle className="group-hover:text-primary transition-colors font-bold tracking-tight">{title}</CardTitle>
        {description && <CardDescription className="leading-relaxed text-sm">{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent className="relative">{children}</CardContent>}
    </Card>
  );
}

export function MacPanel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border/80 bg-card/90 dark:bg-card/75 backdrop-blur-2xl [box-shadow:0_0_0_1px_rgba(0,0,0,.04),0_12px_36px_rgba(0,0,0,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff10_inset,0_0_0_1px_rgba(255,255,255,.06),0_16px_40px_rgba(0,0,0,.8)] ${className}`}>
      <div className="h-10 bg-muted/50 border-b border-border/70 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <div className="p-0 bg-background">
        {children}
      </div>
    </div>
  );
}

export function MacBadge({ children, className = "", color = "secondary" }: { children: React.ReactNode, className?: string, color?: string }) {
  return (
    <Badge variant={color as any} className={`font-mono text-xs ${className}`}>
      {children}
    </Badge>
  );
}
