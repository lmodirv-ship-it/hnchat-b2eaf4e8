import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversalComposer } from "./UniversalComposer";

export function FloatingComposeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-cyan-glow to-violet-glow hover:scale-110 transition-transform"
        aria-label="إنشاء جديد"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <UniversalComposer open={open} onOpenChange={setOpen} />
    </>
  );
}
