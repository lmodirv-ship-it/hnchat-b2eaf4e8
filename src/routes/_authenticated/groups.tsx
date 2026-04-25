import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { COUNTRY_NAMES, LANGUAGE_NAMES } from "@/lib/locale";

export const Route = createFileRoute("/_authenticated/groups")({
  component: GroupsPage,
});

function GroupsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups-list"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("member_count", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  async function createGroup() {
    if (!name.trim() || !user) return;
    setCreating(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase.from("groups").insert({
      name: name.trim(), slug, description: desc.trim() || null,
      country_code: country || null, language_code: language || null,
      created_by: user.id,
    }).select().single();
    if (error) { setCreating(false); return toast.error(error.message); }
    // Auto-join creator as admin
    await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id, role: "admin" });
    toast.success("Group created");
    setOpen(false); setName(""); setDesc(""); setCountry(""); setLanguage("");
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["groups-list"] });
  }

  return (
    <PageShell title="Groups" subtitle="Communities organized by country and language" action={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground"><Plus className="h-4 w-4 me-1.5" /> New Group</Button>
        </DialogTrigger>
        <DialogContent className="bg-popover border-ice-border">
          <DialogHeader><DialogTitle>Create a Group</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Diamond Builders" /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's this group about?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Country</Label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full mt-1.5 h-9 px-3 rounded-md bg-input/50 border border-input text-sm">
                  <option value="">Global</option>
                  {Object.entries(COUNTRY_NAMES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
              </div>
              <div>
                <Label>Language</Label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full mt-1.5 h-9 px-3 rounded-md bg-input/50 border border-input text-sm">
                  <option value="">Any</option>
                  {Object.entries(LANGUAGE_NAMES).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={createGroup} disabled={creating || !name.trim()} className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    }>
      {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
      {groups?.length === 0 && (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-cyan-glow" />
          <p className="text-muted-foreground">No groups yet. Be the first to create one!</p>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((g) => (
          <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }}>
            <Card className="p-5 bg-ice-card border-ice-border hover:shadow-[0_0_24px_oklch(0.78_0.18_220/0.2)] transition-all h-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold">{g.name}</h3>
                {g.country_code && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-glow/15 text-cyan-glow">{g.country_code}</span>}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{g.description || "No description"}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {g.member_count}</span>
                {g.language_code && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {g.language_code.toUpperCase()}</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
