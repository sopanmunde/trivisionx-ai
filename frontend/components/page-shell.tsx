import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";

// Convert strings like "cpu" or "shield-check" to "Cpu" or "ShieldCheck"
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
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          {badge && <Badge variant="secondary" className="mb-2">{badge}</Badge>}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-lg text-muted-foreground">
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
    <section className={`py-12 border-t border-border mt-12 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>}
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
    <Card className={`h-full hover:bg-accent/40 transition-colors ${className}`}>
      <CardHeader>
        {IconComponent && (
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 border border-border">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription className="leading-relaxed">{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function MacPanel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <Card className={`overflow-hidden border border-border ${className}`}>
      <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <div className="p-0 bg-background">
        {children}
      </div>
    </Card>
  );
}

export function MacBadge({ children, className = "", color = "secondary" }: { children: React.ReactNode, className?: string, color?: string }) {
  return (
    <Badge variant={color as any} className={`font-mono text-xs ${className}`}>
      {children}
    </Badge>
  );
}
