"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark } from "lucide-react";

export function SavePresetDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-8 px-3 py-0 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent">
        <Bookmark className="w-4 h-4 mr-2" />
        Save
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50">
        <DialogHeader>
          <DialogTitle>Save Filter Preset</DialogTitle>
          <DialogDescription className="text-t2">
            Name your current filter configuration to quickly access it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input 
            id="name" 
            placeholder="e.g. High Growth Tech, Value Picks" 
            className="col-span-3 bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-zinc-800 text-zinc-300">
            Cancel
          </Button>
          <Button type="submit" onClick={() => setOpen(false)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
