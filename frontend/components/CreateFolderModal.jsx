"use client";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function FolderPopover({ children, onCreateFolder }) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden gap-0 bg-background border-border shadow-xl rounded-2xl">
        <DialogHeader className="px-5 py-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-[15px] font-semibold text-foreground">
            Create folder
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new folder to organize your workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="relative">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="E.g. Marketing Projects"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-[14px] text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              autoFocus
            />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted/40 p-4 border border-border/50">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-[13px] text-muted-foreground leading-relaxed">
              <span className="font-semibold block mb-0.5 text-foreground">
                What's a folder?
              </span>
              Folders help you group related chats, files, and templates to keep your workspace organized.
            </div>
          </div>

          <DialogFooter className="mt-6 flex sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl h-10 text-[13px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim()}
              className="flex-1 rounded-xl h-10 text-[13px] font-semibold shadow-sm"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
