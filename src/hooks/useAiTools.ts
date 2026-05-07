import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AiTool = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  logo_url: string | null;
  website_url: string | null;
  category_id: string | null;
  category_slug: string | null;
  rating: number;
  is_free: boolean;
  is_featured: boolean;
  pricing_info: string | null;
  pros: string[] | null;
  cons: string[] | null;
  features: any;
  tags: string[] | null;
  views_count: number;
  created_at: string;
};

export type AiToolCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export function useAiToolCategories() {
  return useQuery({
    queryKey: ["ai-tool-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tool_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as AiToolCategory[];
    },
  });
}

export function useAiTools(categorySlug?: string | null) {
  return useQuery({
    queryKey: ["ai-tools", categorySlug],
    queryFn: async () => {
      let q = supabase
        .from("ai_tools")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });
      if (categorySlug) q = q.eq("category_slug", categorySlug);
      const { data, error } = await q;
      if (error) throw error;
      return data as AiTool[];
    },
  });
}

export function useAiTool(slug: string) {
  return useQuery({
    queryKey: ["ai-tool", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as AiTool | null;
    },
    enabled: !!slug,
  });
}

export function useFeaturedTools() {
  return useQuery({
    queryKey: ["ai-tools-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("is_featured", true)
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as AiTool[];
    },
  });
}
