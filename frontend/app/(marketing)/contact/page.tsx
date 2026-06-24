import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";
import { Mail, Users, Building2, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — TriVisionX",
  description: "Get in touch with the TriVisionX team.",
};

const contactInfo = [
  { icon: Mail, title: "General Email", lines: ["hello@trivisionx.ai", "support@trivisionx.ai"] },
  { icon: Users, title: "Enterprise Sales", lines: ["sales@trivisionx.ai", "Response within 24 hours"] },
  { icon: Building2, title: "Headquarters", lines: ["TriVisionX, Inc.", "San Francisco, CA 94105"] },
  { icon: Clock, title: "Support Hours", lines: ["Monday – Friday", "9 AM – 6 PM PST"] },
];

export default function ContactPage() {
  return (
    <PageShell
      badge="Contact"
      title="Get in Touch"
      subtitle="Have a question, partnership inquiry, or need enterprise support? We'd love to hear from you."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
        {/* Contact Form */}
        <Card className="p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold text-foreground">Send a Message</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ContactForm />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-5 flex gap-4 hover:border-muted-foreground/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="inline-flex p-3 rounded-lg bg-secondary border border-border text-primary group-hover:bg-muted transition-colors self-start shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1.5 text-sm tracking-tight">{item.title}</h3>
                  {item.lines.map((l) => (
                    <p key={l} className="text-xs text-muted-foreground font-mono leading-relaxed">
                      {l}
                    </p>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
