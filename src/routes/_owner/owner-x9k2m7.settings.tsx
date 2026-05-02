// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Globe, Database, Server, Shield, ExternalLink, Save, Loader2, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/owner-x9k2m7/settings")({
  component: GlobalConfigPage,
});

function GlobalConfigPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: appSettings, isLoading } = useQuery({
    queryKey: ["owner-app-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("*").order("key");
      return data ?? [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("app_settings")
        .update({ value, updated_by: user!.id, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id,
        action: "settings.update",
        target_type: "app_setting",
        target_id: key,
        metadata: { new_value: value },
      });
    },
    onSuccess: () => {
      toast.success("تم حفظ الإعداد");
      qc.invalidateQueries({ queryKey: ["owner-app-settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { data: siteStats } = useQuery({
    queryKey: ["owner-settings-stats"],
    queryFn: async () => {
      const [visits, profiles, posts, products] = await Promise.all([
        supabase.from("site_visits").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);
      return {
        visits: visits.count ?? 0,
        profiles: profiles.count ?? 0,
        posts: posts.count ?? 0,
        products: products.count ?? 0,
      };
    },
  });

  const getSettingValue = (key: string) => {
    const s = appSettings?.find((s: any) => s.key === key);
    return s?.value ?? {};
  };

  if (isLoading) {
    return (
      <OwnerShell title="Global Config" subtitle="إعدادات الموقع العامة والتحكم الشامل">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[oklch(0.75_0.18_50)]" />
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell title="Global Config" subtitle="إعدادات الموقع العامة والتحكم الشامل">
      {/* Critical Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Maintenance Mode */}
        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">وضع الصيانة</h2>
          </div>
          <SettingToggle
            label="تفعيل وضع الصيانة"
            description="عند التفعيل، سيظهر للمستخدمين رسالة صيانة بدلاً من الموقع"
            settingKey="maintenance_mode"
            field="enabled"
            value={getSettingValue("maintenance_mode")}
            onUpdate={(v) => updateMutation.mutate({ key: "maintenance_mode", value: v })}
          />
          <div className="mt-3">
            <label className="text-xs text-[oklch(0.55_0.04_40)] block mb-1">رسالة الصيانة</label>
            <SettingTextInput
              settingKey="maintenance_mode"
              field="message"
              value={getSettingValue("maintenance_mode")}
              onUpdate={(v) => updateMutation.mutate({ key: "maintenance_mode", value: v })}
            />
          </div>
        </OwnerCard>

        {/* Registration Toggle */}
        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">التسجيل</h2>
          </div>
          <SettingToggle
            label="السماح بالتسجيل الجديد"
            description="أوقف التسجيل مؤقتاً لمنع مستخدمين جدد"
            settingKey="registration_enabled"
            field="enabled"
            value={getSettingValue("registration_enabled")}
            onUpdate={(v) => updateMutation.mutate({ key: "registration_enabled", value: v })}
          />
        </OwnerCard>

        {/* Welcome Message */}
        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-cyan-400" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">رسالة الترحيب</h2>
          </div>
          <SettingTextInput
            settingKey="welcome_message"
            field="text"
            value={getSettingValue("welcome_message")}
            onUpdate={(v) => updateMutation.mutate({ key: "welcome_message", value: v })}
            multiline
          />
        </OwnerCard>

        {/* AI Configuration */}
        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">إعدادات الذكاء الاصطناعي</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[oklch(0.55_0.04_40)] block mb-1">النموذج الافتراضي</label>
              <SettingTextInput
                settingKey="ai_config"
                field="default_model"
                value={getSettingValue("ai_config")}
                onUpdate={(v) => updateMutation.mutate({ key: "ai_config", value: v })}
              />
            </div>
            <div>
              <label className="text-xs text-[oklch(0.55_0.04_40)] block mb-1">الحد الأقصى للرموز لكل مستخدم</label>
              <SettingNumberInput
                settingKey="ai_config"
                field="max_tokens_per_user"
                value={getSettingValue("ai_config")}
                onUpdate={(v) => updateMutation.mutate({ key: "ai_config", value: v })}
              />
            </div>
          </div>
        </OwnerCard>
      </div>

      {/* Platform Info & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> تكوين المنصة
          </h2>
          <div className="space-y-3">
            {[
              { label: "اسم المنصة", value: "hnChat", icon: Globe },
              { label: "الدومين", value: "www.hn-chat.com", icon: ExternalLink },
              { label: "قاعدة البيانات", value: "Lovable Cloud", icon: Database },
              { label: "الاستضافة", value: "Edge (Cloudflare)", icon: Server },
              { label: "الحماية", value: "RLS + Security Definer", icon: Shield },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.06_0.02_30)]">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[oklch(0.6_0.04_40)]" />
                    <span className="text-sm text-[oklch(0.7_0.04_40)]">{s.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[oklch(0.9_0.05_50)]">{s.value}</span>
                </div>
              );
            })}
          </div>
        </OwnerCard>

        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> ملخص البيانات
          </h2>
          <div className="space-y-3">
            {[
              { label: "زيارات الموقع", value: siteStats?.visits ?? 0 },
              { label: "المستخدمون", value: siteStats?.profiles ?? 0 },
              { label: "المنشورات", value: siteStats?.posts ?? 0 },
              { label: "المنتجات", value: siteStats?.products ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.06_0.02_30)]">
                <span className="text-sm text-[oklch(0.7_0.04_40)]">{item.label}</span>
                <span className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </OwnerCard>
      </div>
    </OwnerShell>
  );
}

/* Sub-components for setting controls */
function SettingToggle({ label, description, settingKey, field, value, onUpdate }: {
  label: string; description: string; settingKey: string; field: string; value: any; onUpdate: (v: any) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.06_0.02_30)]">
      <div>
        <div className="text-sm font-medium text-[oklch(0.85_0.04_50)]">{label}</div>
        <div className="text-xs text-[oklch(0.5_0.04_40)] mt-0.5">{description}</div>
      </div>
      <Switch
        checked={!!value?.[field]}
        onCheckedChange={(checked) => onUpdate({ ...value, [field]: checked })}
      />
    </div>
  );
}

function SettingTextInput({ settingKey, field, value, onUpdate, multiline }: {
  settingKey: string; field: string; value: any; onUpdate: (v: any) => void; multiline?: boolean;
}) {
  const [localVal, setLocalVal] = useState(value?.[field] ?? "");
  const changed = localVal !== (value?.[field] ?? "");
  const Component = multiline ? Textarea : Input;
  return (
    <div className="flex gap-2">
      <Component
        value={localVal}
        onChange={(e: any) => setLocalVal(e.target.value)}
        className="flex-1 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.9_0.05_50)] text-sm"
      />
      {changed && (
        <Button size="sm" onClick={() => onUpdate({ ...value, [field]: localVal })} className="bg-[oklch(0.75_0.18_50)] text-[oklch(0.04_0.01_280)] hover:bg-[oklch(0.8_0.15_50)] h-9">
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

function SettingNumberInput({ settingKey, field, value, onUpdate }: {
  settingKey: string; field: string; value: any; onUpdate: (v: any) => void;
}) {
  const [localVal, setLocalVal] = useState(String(value?.[field] ?? ""));
  const changed = localVal !== String(value?.[field] ?? "");
  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        className="flex-1 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.9_0.05_50)] text-sm"
      />
      {changed && (
        <Button size="sm" onClick={() => onUpdate({ ...value, [field]: Number(localVal) })} className="bg-[oklch(0.75_0.18_50)] text-[oklch(0.04_0.01_280)] hover:bg-[oklch(0.8_0.15_50)] h-9">
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
