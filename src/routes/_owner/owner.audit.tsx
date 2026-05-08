import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { data } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("owner_audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <OwnerShell title="Audit Logs" subtitle="Every owner action is tracked here">
      <OwnerCard className="divide-y divide-[oklch(0.15_0.03_30)]">
        {data?.length === 0 && <div className="p-12 text-center text-[oklch(0.5_0.04_40)]"><Activity className="h-8 w-8 mx-auto mb-2" />No actions yet</div>}
        {data?.map((log) => (
          <div key={log.id} className="p-4 grid grid-cols-12 gap-3 text-sm">
            <div className="col-span-3 text-[oklch(0.6_0.04_40)] text-xs">{formatDistanceToNow(new Date(log.created_at))} ago</div>
            <div className="col-span-3 font-mono text-[oklch(0.85_0.15_50)]">{log.action}</div>
            <div className="col-span-2 text-[oklch(0.7_0.04_40)]">{log.target_type}</div>
            <div className="col-span-4 text-[oklch(0.6_0.04_40)] font-mono text-xs truncate">{log.target_id}</div>
          </div>
        ))}
      </OwnerCard>
    </OwnerShell>
  );
}
