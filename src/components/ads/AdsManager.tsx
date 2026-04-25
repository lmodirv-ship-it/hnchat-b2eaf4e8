import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  MousePointerClick,
  DollarSign,
  Target,
  Plus,
  TrendingUp,
  TrendingDown,
  Loader2,
  Pause,
  Play,
  Trash2,
  Image as ImageIcon,
  Video,
  Megaphone,
  Users,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: "video" | "banner" | "story" | "product" | "sponsored_post";
  status: "draft" | "active" | "paused" | "ended";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  thumbnail_url: string | null;
  created_at: string;
}

const typeIcons: Record<Campaign["type"], typeof Video> = {
  video: Video,
  banner: ImageIcon,
  story: Megaphone,
  product: ImageIcon,
  sponsored_post: Megaphone,
};

const typeLabels: Record<Campaign["type"], string> = {
  video: "Video Ad",
  banner: "Banner Ad",
  story: "Story Ad",
  product: "Product Ad",
  sponsored_post: "Sponsored Post",
};

const statusColors: Record<Campaign["status"], string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/40",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  ended: "bg-red-500/20 text-red-400 border-red-500/40",
};

export function AdsManager() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("ad_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setCampaigns((data || []) as Campaign[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  // Aggregate stats
  const stats = useMemo(() => {
    return campaigns.reduce(
      (acc, c) => {
        acc.impressions += Number(c.impressions || 0);
        acc.clicks += Number(c.clicks || 0);
        acc.spent += Number(c.spent || 0);
        acc.conversions += Number(c.conversions || 0);
        return acc;
      },
      { impressions: 0, clicks: 0, spent: 0, conversions: 0 },
    );
  }, [campaigns]);

  // Mock weekly data (can be replaced with real time-series later)
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const seed = stats.impressions || 100000;
    return days.map((d, i) => ({
      day: d,
      impressions: Math.floor((seed / 7) * (0.6 + Math.sin(i + 1) * 0.5 + Math.random() * 0.4)),
      clicks: Math.floor((stats.clicks / 7) * (0.5 + Math.cos(i) * 0.4 + Math.random() * 0.3)),
    }));
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            Ads Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reach millions across hnChat's global network
          </p>
        </div>
        <NewCampaignDialog onCreated={load} />
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-ice-card border border-ice-border h-auto p-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-glow/20 data-[state=active]:text-cyan-glow">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-cyan-glow/20 data-[state=active]:text-cyan-glow">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-cyan-glow/20 data-[state=active]:text-cyan-glow">
            Create
          </TabsTrigger>
          <TabsTrigger value="audience" className="data-[state=active]:bg-cyan-glow/20 data-[state=active]:text-cyan-glow">
            Audience
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-cyan-glow/20 data-[state=active]:text-cyan-glow">
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Eye}
              iconColor="text-cyan-glow"
              iconBg="bg-cyan-glow/20"
              value={formatNumber(stats.impressions)}
              label="Total Impressions"
              trend={24}
            />
            <StatCard
              icon={MousePointerClick}
              iconColor="text-violet-glow"
              iconBg="bg-violet-glow/20"
              value={formatNumber(stats.clicks)}
              label="Total Clicks"
              trend={18}
            />
            <StatCard
              icon={DollarSign}
              iconColor="text-yellow-400"
              iconBg="bg-yellow-400/20"
              value={`$${formatNumber(stats.spent)}`}
              label="Total Spent"
              trend={-8}
            />
            <StatCard
              icon={Target}
              iconColor="text-pink-glow"
              iconBg="bg-pink-glow/20"
              value={formatNumber(stats.conversions)}
              label="Conversions"
              trend={31}
            />
          </div>

          {/* Weekly Performance Chart */}
          <div className="rounded-2xl border border-ice-border bg-ice-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Weekly Performance</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-glow" />
                  <span className="text-muted-foreground">Impressions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-glow" />
                  <span className="text-muted-foreground">Clicks</span>
                </div>
              </div>
            </div>
            <div className="h-[280px]">
              <ChartContainer
                config={{
                  impressions: { label: "Impressions", color: "oklch(0.78 0.18 220)" },
                  clicks: { label: "Clicks", color: "oklch(0.65 0.25 295)" },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 240 / 0.3)" />
                    <XAxis dataKey="day" stroke="oklch(0.65 0.02 240)" fontSize={12} />
                    <YAxis stroke="oklch(0.65 0.02 240)" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="impressions" fill="var(--color-impressions)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="rounded-2xl border border-ice-border bg-ice-card p-5">
            <h3 className="font-semibold mb-4">Active Campaigns</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
              </div>
            ) : campaigns.filter((c) => c.status === "active").length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد حملات نشطة. ابدأ بإنشاء حملة جديدة! 🚀
              </p>
            ) : (
              <div className="space-y-3">
                {campaigns
                  .filter((c) => c.status === "active")
                  .slice(0, 5)
                  .map((c) => (
                    <CampaignRow key={c.id} campaign={c} onChange={load} />
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <div className="rounded-2xl border border-ice-border bg-ice-card p-5">
            <h3 className="font-semibold mb-4">All Campaigns ({campaigns.length})</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                لم تُنشئ أي حملة بعد.
              </p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c) => (
                  <CampaignRow key={c.id} campaign={c} onChange={load} showStatus />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <div className="rounded-2xl border border-ice-border bg-ice-card p-8 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-cyan-glow mb-3" />
            <h3 className="text-xl font-semibold mb-2">أنشئ حملة جديدة</h3>
            <p className="text-sm text-muted-foreground mb-5">
              اختر نوع الحملة، حدّد الميزانية، واستهدف الجمهور المناسب.
            </p>
            <NewCampaignDialog onCreated={load} />
          </div>
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <div className="rounded-2xl border border-ice-border bg-ice-card p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-violet-glow mb-3" />
            <h3 className="text-xl font-semibold mb-2">استهداف الجمهور</h3>
            <p className="text-sm text-muted-foreground">
              حدّد الفئات العمرية، الموقع الجغرافي، الاهتمامات، واللغة لكل حملة.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <div className="rounded-2xl border border-ice-border bg-ice-card p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-pink-glow mb-3" />
            <h3 className="text-xl font-semibold mb-2">الفواتير والدفع</h3>
            <p className="text-sm text-muted-foreground mb-4">
              إجمالي الإنفاق هذا الشهر: <span className="text-foreground font-bold">${formatNumber(stats.spent)}</span>
            </p>
            <Button disabled className="bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/40">
              إضافة طريقة دفع (قريباً)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  trend,
}: {
  icon: typeof Eye;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
  trend: number;
}) {
  const positive = trend >= 0;
  return (
    <div className="rounded-2xl border border-ice-border bg-ice-card p-4 relative overflow-hidden hover:border-cyan-glow/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-9 w-9 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            positive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
          } flex items-center gap-1`}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}
          {trend}%
        </span>
      </div>
      <div className={`text-2xl font-bold ${iconColor}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CampaignRow({
  campaign,
  onChange,
  showStatus,
}: {
  campaign: Campaign;
  onChange: () => void;
  showStatus?: boolean;
}) {
  const Icon = typeIcons[campaign.type];
  const [busy, setBusy] = useState(false);
  const pct = campaign.budget > 0 ? Math.min(100, (Number(campaign.spent) / Number(campaign.budget)) * 100) : 0;

  async function toggleStatus() {
    setBusy(true);
    const next: Campaign["status"] = campaign.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("ad_campaigns")
      .update({ status: next })
      .eq("id", campaign.id);
    if (error) toast.error(error.message);
    else toast.success(next === "active" ? "تم تشغيل الحملة" : "تم إيقاف الحملة");
    setBusy(false);
    onChange();
  }

  async function remove() {
    if (!confirm("حذف هذه الحملة؟")) return;
    setBusy(true);
    const { error } = await supabase.from("ad_campaigns").delete().eq("id", campaign.id);
    if (error) toast.error(error.message);
    else toast.success("تم الحذف");
    setBusy(false);
    onChange();
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-ice-bg/40 border border-ice-border hover:border-cyan-glow/40 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-cyan-glow" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{campaign.name}</h4>
          {showStatus && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusColors[campaign.status]}`}>
              {campaign.status.toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span>{typeLabels[campaign.type]}</span>
          <span>•</span>
          <span>{formatNumber(campaign.impressions)} impressions</span>
        </div>
        <div className="mt-2 h-1.5 bg-ice-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-glow to-violet-glow transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-cyan-glow">${formatNumber(campaign.spent)}</div>
        <div className="text-[10px] text-muted-foreground">of ${formatNumber(campaign.budget)}</div>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggleStatus}
          disabled={busy || campaign.status === "ended"}
          aria-label="toggle"
        >
          {campaign.status === "active" ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 hover:text-destructive"
          onClick={remove}
          disabled={busy}
          aria-label="delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function NewCampaignDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "banner" as Campaign["type"],
    budget: "100",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("اسم الحملة مطلوب");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("ad_campaigns").insert({
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type,
      budget: parseFloat(form.budget) || 0,
      status: "active",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم إنشاء الحملة 🚀");
      setOpen(false);
      setForm({ name: "", description: "", type: "banner", budget: "100" });
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow text-primary-foreground font-semibold hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-ice-card border-ice-border">
        <DialogHeader>
          <DialogTitle>أنشئ حملة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">اسم الحملة</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Diamond Summer Sale 2026"
              className="bg-ice-bg border-ice-border"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">الوصف</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="هدف الحملة..."
              rows={2}
              className="bg-ice-bg border-ice-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">النوع</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Campaign["type"] })}>
                <SelectTrigger className="bg-ice-bg border-ice-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner Ad</SelectItem>
                  <SelectItem value="video">Video Ad</SelectItem>
                  <SelectItem value="story">Story Ad</SelectItem>
                  <SelectItem value="product">Product Ad</SelectItem>
                  <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الميزانية ($)</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="bg-ice-bg border-ice-border"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow text-primary-foreground font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            إنشاء الحملة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}
