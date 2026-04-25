import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Search,
  ShoppingBag,
  Trash2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "الكل",
  "إلكترونيات",
  "أزياء",
  "منزل",
  "رياضة",
  "كتب",
  "ألعاب",
  "صحة وجمال",
  "أخرى",
];

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string | null;
  stock: number;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  SAR: "﷼",
  AED: "د.إ",
  EGP: "£",
};

function formatPrice(p: Product) {
  const sym = CURRENCY_SYMBOL[p.currency] || p.currency;
  return `${sym} ${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductGrid({ refreshKey }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [selected, setSelected] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(60);
    if (cat !== "الكل") query = query.eq("category", cat);
    const { data } = await query;
    setProducts((data || []) as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, refreshKey]);

  const filtered = products.filter((p) =>
    q.trim()
      ? p.title.toLowerCase().includes(q.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(q.toLowerCase())
      : true,
  );

  async function handleDelete(p: Product) {
    if (!user || user.id !== p.seller_id) return;
    if (!confirm(`حذف "${p.title}"؟`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم الحذف");
      setSelected(null);
      load();
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="bg-ice-card border-ice-border pr-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-48 bg-ice-card border-ice-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-ice-card border-ice-border">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-cyan-glow" />
          <p className="text-sm text-muted-foreground">لا توجد منتجات بعد</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-ice-card border-ice-border overflow-hidden cursor-pointer hover:border-cyan-glow/60 transition group"
            >
              <div className="aspect-square bg-ice-bg overflow-hidden relative">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {p.stock === 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500/90 text-white border-0">
                    نفد
                  </Badge>
                )}
              </div>
              <div className="p-2 space-y-1">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-cyan-glow text-sm font-bold">{formatPrice(p)}</p>
                {p.category && (
                  <p className="text-[10px] text-muted-foreground">{p.category}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-ice-card border-ice-border max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.images && selected.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selected.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className={cn(
                          "rounded border border-ice-border object-cover",
                          selected.images!.length === 1 ? "col-span-2 aspect-video" : "aspect-square",
                        )}
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-cyan-glow">
                    {formatPrice(selected)}
                  </span>
                  {selected.category && (
                    <Badge variant="outline" className="border-ice-border">
                      {selected.category}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوفر: {selected.stock}
                </p>
                {selected.description && (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selected.description}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    disabled={selected.stock === 0}
                    className="flex-1 bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
                    onClick={() => toast.info("الدفع قريباً 💳")}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    {selected.stock === 0 ? "نفد" : "اشترِ الآن"}
                  </Button>
                  {user?.id === selected.seller_id && (
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(selected)}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
