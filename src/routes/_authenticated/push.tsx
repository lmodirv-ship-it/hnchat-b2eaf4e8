import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { CatalogItem } from "@/hooks/useCatalog";

export const Route = createFileRoute("/_authenticated/push")({
  component: PushPage,
});

function PushPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("غير مسجّل دخول");
      if (!title.trim()) throw new Error("العنوان مطلوب");
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        type: "system",
        content: `${title}${body ? ` — ${body}` : ""}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال الإشعار التجريبي إلى صندوقك");
      setTitle(""); setBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const useTemplate = (item: CatalogItem) => {
    const meta = (item.metadata ?? {}) as { title?: string; body?: string };
    setTitle(meta.title ?? item.title);
    setBody(meta.body ?? item.description ?? "");
    toast.info(`تم تعبئة قالب: ${item.title}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell title="Push Strategy" subtitle="جرّب إشعارات الدفع وأرسل اختباراً لنفسك">
      <div className="space-y-6">
        <Card className="p-5 bg-ice-card border-ice-border space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-glow" /> اختبار إشعار
          </h3>
          <Input
            placeholder="عنوان الإشعار"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="نص الإشعار..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
          <Button onClick={() => send.mutate()} disabled={send.isPending} className="gap-2">
            <Send className="h-4 w-4" />
            {send.isPending ? "جاري الإرسال..." : "أرسل اختباراً"}
          </Button>
        </Card>

        <div>
          <h3 className="text-sm font-semibold mb-3">قوالب جاهزة</h3>
          <CatalogGrid
            type="push_template"
            cardIcon={Send}
            ctaLabel="استخدم"
            accent="violet"
            emptyText="لا توجد قوالب"
            onAction={useTemplate}
          />
        </div>
      </div>
    </PageShell>
  );
}
