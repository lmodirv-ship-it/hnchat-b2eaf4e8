import { createFileRoute } from "@tanstack/react-router";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_owner/owner-x9k2m7/settings")({
  component: () => (
    <OwnerShell title="Settings" subtitle="Module under construction">
      <OwnerCard className="p-12 text-center">
        <Sparkles className="h-10 w-10 mx-auto mb-3 text-[oklch(0.75_0.18_50)]" />
        <p className="text-[oklch(0.6_0.04_40)]">Settings module ready for build-out in next iteration.</p>
      </OwnerCard>
    </OwnerShell>
  ),
});
