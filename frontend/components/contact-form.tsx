"use client";

import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ContactFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || "Failed to send message");
      }
      toast.success("Message sent successfully!", {
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-2 block">First Name</FormLabel>
                <FormControl><Input placeholder="Jane" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-2 block">Last Name</FormLabel>
                <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          rules={{ 
            required: "Email is required", 
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } 
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-2 block">Email</FormLabel>
              <FormControl><Input type="email" placeholder="jane@company.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          rules={{ required: "Subject is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-2 block">Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="dark bg-popover border-zinc-800">
                  <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  <SelectItem value="Enterprise Sales">Enterprise Sales</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          rules={{ required: "Message is required", minLength: { value: 10, message: "Message must be at least 10 characters" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-2 block">Message</FormLabel>
              <FormControl><Textarea rows={5} className="resize-none" placeholder="Tell us what's on your mind..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full font-medium shadow-sm transition-all"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
