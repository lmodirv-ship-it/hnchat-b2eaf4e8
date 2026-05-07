import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Article = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  category_id: string | null;
  language: string;
  featured_image: string | null;
  video_url: string | null;
  short_description: string | null;
  content: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  status: string;
  views_count: number;
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { username: string; full_name: string | null; avatar_url: string | null; bio: string | null };
  article_categories?: { name: string; name_ar: string | null; name_fr: string | null; slug: string; color: string | null };
};

export type ArticleCategory = {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
  slug: string;
  color: string | null;
  sort_order: number | null;
};

export function useCategories() {
  return useQuery({
    queryKey: ["article-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as ArticleCategory[];
    },
  });
}

export function useMyArticles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-articles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, article_categories(*)")
        .eq("author_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
  });
}

export function usePublishedArticles(options?: { category?: string; limit?: number; language?: string }) {
  return useQuery({
    queryKey: ["published-articles", options],
    queryFn: async () => {
      let q = supabase
        .from("articles")
        .select("*, profiles!articles_author_id_fkey(username, full_name, avatar_url), article_categories(*)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (options?.limit) {
        q = q.limit(options.limit);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any as Article[];
    },
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, profiles(username, full_name, avatar_url, bio), article_categories(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      // Increment views
      if (data?.id) {
        await supabase.rpc("increment_article_views", { _article_id: data.id });
      }
      return data as Article;
    },
  });
}

export function useArticleById(id: string) {
  return useQuery({
    queryKey: ["article-edit", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, article_categories(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Article;
    },
  });
}

export function useAuthorArticles(username: string) {
  return useQuery({
    queryKey: ["author-articles", username],
    enabled: !!username,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio")
        .eq("username", username)
        .single();
      if (!profile) throw new Error("Author not found");

      const { data: articles, error } = await supabase
        .from("articles")
        .select("*, article_categories(*)")
        .eq("author_id", profile.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;

      return { profile, articles: articles as Article[] };
    },
  });
}

export function useSaveArticle() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (article: Partial<Article> & { id?: string }) => {
      const { profiles, article_categories, ...rest } = article as any;
      const payload = {
        ...rest,
        author_id: user!.id,
        reading_time: rest.content ? Math.max(1, Math.ceil((rest.content.split(/\s+/).length) / 200)) : 1,
        ...(rest.status === "published" && !rest.published_at ? { published_at: new Date().toISOString() } : {}),
      };

      if (rest.id) {
        const { data, error } = await supabase
          .from("articles")
          .update(payload as any)
          .eq("id", rest.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { id: _id, ...insertPayload } = payload;
        const { data, error } = await supabase
          .from("articles")
          .insert(insertPayload as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-articles"] });
      qc.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-articles"] });
      qc.invalidateQueries({ queryKey: ["published-articles"] });
      toast.success("تم حذف المقال");
    },
  });
}

export async function uploadBlogImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}
