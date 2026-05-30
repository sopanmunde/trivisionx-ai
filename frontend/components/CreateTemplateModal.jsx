"use client";
import { useState, useEffect } from "react";
import { Lightbulb, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function TemplatePopover({
  children,
  onCreateTemplate,
  editingTemplate = null,
}) {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name || "");
      setTemplateContent(editingTemplate.content || "");
      setOpen(true);
    }
  }, [editingTemplate]);

  const isEditing = !!editingTemplate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (templateName.trim() && templateContent.trim()) {
      const templateData = {
        name: templateName.trim(),
        content: templateContent.trim(),
        snippet:
          templateContent.trim().slice(0, 100) +
          (templateContent.trim().length > 100 ? "..." : ""),
        createdAt: editingTemplate?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditing) {
        onCreateTemplate({ ...templateData, id: editingTemplate.id });
      } else {
        onCreateTemplate(templateData);
      }

      handleClose();
    }
  };

  const handleClose = () => {
    setTemplateName("");
    setTemplateContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 bg-background border-border shadow-xl rounded-2xl">
        <DialogHeader className="px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              {isEditing ? "Edit Template" : "New Template"}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Create or edit a template
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="templateName"
              className="block text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2"
            >
              Name
            </label>
            <input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="E.g. Email Response"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[14px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="templateContent"
              className="block text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2"
            >
              Content
            </label>
            <textarea
              id="templateContent"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Enter template text..."
              rows={6}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[14px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary shadow-sm resize-none scrollbar-thin"
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4 border border-border/50">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-[13px] text-muted-foreground leading-relaxed">
              Templates are automatically inserted into the chat box when
              selected from your list.
            </div>
          </div>

          <DialogFooter className="mt-6 flex sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl h-10 text-[13px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!templateName.trim() || !templateContent.trim()}
              className="flex-1 rounded-xl h-10 text-[13px] font-semibold shadow-sm"
            >
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
