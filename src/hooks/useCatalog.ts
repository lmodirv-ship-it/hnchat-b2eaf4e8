import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CatalogItem = Database["public"]["Tables"]["catalog_items"]["Row"];
export type CatalogType = Database["public"]["Enums"]["catalog_item_type"];

export function useCatalog(type: CatalogType, options?: { featuredOnly?: boolean; category?: string | null; search?: string }) {
  return useQuery({
    queryKey: ["catalog", type, options?.featuredOnly ?? false, options?.category ?? null, options?.search ?? ""],
    queryFn: async () => {
      let q = supabase
        .from("catalog_items")
        .select("*")
        .eq("type", type)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(60);
      if (options?.featuredOnly) q = q.eq("is_featured", true);
      if (options?.category) q = q.eq("category", options.category);
      if (options?.search && options.search.trim()) {
        const s = options.search.trim();
        q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CatalogItem[];
    },
    staleTime: 30_000,
  });
}

export function useCatalogCategories(type: CatalogType) {
  return useQuery({
    queryKey: ["catalog-categories", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("category")
        .eq("type", type)
        .eq("is_active", true)
        .not("category", "is", null);
      if (error) throw error;
      const set = new Set<string>();
      (data ?? []).forEach((r) => { if (r.category) set.add(r.category); });
      return Array.from(set).sort();
    },
    staleTime: 60_000,
  });
}
