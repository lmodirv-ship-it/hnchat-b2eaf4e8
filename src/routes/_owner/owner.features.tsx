import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Power } from "lucide-react";

export const Route = createFileRoute("/_owner/owner/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const { user } = useAuth();
  const { data: flags, refetch } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data } = await supabase.from("feature_flags").select("*").order("key");
      return data ?? [];
    },
  });

  async function toggle(key: string, enabled: boolean) {
    const { error } = await supabase.from("feature_flags").update({ enabled, updated_by: user?.id, updated_at: new Date().toISOString() }).eq("key", key);
    if (error) return toast.error(error.message);
    toast.success(`${key} ${enabled ? "enabled" : "disabled"}`);
    await supabase.from("owner_audit_logs").insert({
      actor_id: user!.id, action: "feature_flag.toggle", target_type: "feature_flag", target_id: key,
      metadata: { enabled },
    });
    refetch();
  }

  return (
    <OwnerShell title="Feature Flags" subtitle="Toggle entire features across the platform instantly">
      <OwnerCard className="divide-y divide-[oklch(0.15_0.03_30)]">
        {flags?.map((f) => (
          <div key={f.key} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${f.enabled ? "bg-[oklch(0.75_0.18_50/0.15)]" : "bg-[oklch(0.15_0.03_30)]"}`}>
                <Power className={`h-4 w-4 ${f.enabled ? "text-[oklch(0.85_0.15_50)]" : "text-[oklch(0.5_0.04_40)]"}`} />
              </div>
              <div>
                <div className="font-mono text-sm text-[oklch(0.9_0.05_50)]">{f.key}</div>
                <div className="text-xs text-[oklch(0.55_0.04_40)]">{f.description}</div>
              </div>
            </div>
            <Switch checked={f.enabled} onCheckedChange={(v) => toggle(f.key, v)} />
          </div>
        ))}
      </OwnerCard>
    </OwnerShell>
  );
}
