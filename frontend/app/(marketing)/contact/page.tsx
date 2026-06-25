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
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
        {/* Contact Form */}
        <Card className="p-6 md:p-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 shadow-2xl rounded-2xl">
          <CardHeader className="p-0 mb-5">
            <CardTitle className="text-lg font-bold text-foreground">Send a Message</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ContactForm />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-4">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-4 flex gap-4 bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-800/20 transition-all duration-200 group cursor-pointer rounded-xl"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white transition-colors self-start shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm tracking-tight">{item.title}</h3>
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
