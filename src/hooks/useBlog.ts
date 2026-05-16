import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export type Article = {
  id: string;
  short_id?: string | null;
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
  likes_count: number;
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

export type ArticleComment = {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profiles?: { username: string; full_name: string | null; avatar_url: string | null };
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
      return data as any as Article[];
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

      if (options?.language) q = q.eq("language", options.language);
      if (options?.limit) q = q.limit(options.limit);

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
      if (data?.id) {
        await supabase.rpc("increment_article_views", { _article_id: data.id });
      }
      return data as any as Article;
    },
  });
}

export function useArticleByIdFull(idOrShortId: string) {
  return useQuery({
    queryKey: ["article-full", idOrShortId],
    enabled: !!idOrShortId,
    queryFn: async () => {
      const isShortId = /^[a-z]\d{6}$/.test(idOrShortId);
      const column = isShortId ? "short_id" : "id";
      const { data, error } = await supabase
        .from("articles")
        .select("*, profiles(username, full_name, avatar_url, bio), article_categories(*)")
        .eq(column, idOrShortId)
        .single();
      if (error) throw error;
      if (data?.id) {
        await supabase.rpc("increment_article_views", { _article_id: data.id });
      }
      return data as any as Article;
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

      return { profile, articles: articles as any as Article[] };
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

// Article Comments
export function useArticleComments(articleId: string) {
  return useQuery({
    queryKey: ["article-comments", articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any as ArticleComment[];
    },
  });
}

export function useAddArticleComment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      articleId,
      content,
      parentId,
    }: {
      articleId: string;
      content: string;
      parentId?: string | null;
    }) => {
      const { error } = await supabase
        .from("article_comments")
        .insert({
          article_id: articleId,
          user_id: user!.id,
          content,
          parent_id: parentId ?? null,
        } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["article-comments", vars.articleId] });
    },
  });
}

export function useReportComment() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      commentId,
      reason,
      details,
    }: {
      commentId: string;
      reason: string;
      details?: string;
    }) => {
      if (!user) throw new Error("Login required");
      const { error } = await supabase
        .from("comment_reports")
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          details: details ?? null,
        } as any);
      if (error) throw error;
    },
  });
}

export function useDeleteArticleComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, articleId }: { id: string; articleId: string }) => {
      const { error } = await supabase.from("article_comments").delete().eq("id", id);
      if (error) throw error;
      return articleId;
    },
    onSuccess: (articleId) => {
      qc.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
  });
}

// Comment Likes — list of liked comment ids + counts per article
export function useArticleCommentLikes(articleId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["article-comment-likes", articleId, user?.id ?? "guest"],
    enabled: !!articleId,
    queryFn: async () => {
      const { data: allLikes } = await supabase
        .from("article_comment_likes")
        .select("comment_id, user_id")
        .in(
          "comment_id",
          (
            await supabase
              .from("article_comments")
              .select("id")
              .eq("article_id", articleId)
          ).data?.map((c: any) => c.id) ?? [],
        );
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const row of (allLikes ?? []) as any[]) {
        counts[row.comment_id] = (counts[row.comment_id] ?? 0) + 1;
        if (user && row.user_id === user.id) mine.add(row.comment_id);
      }
      return { counts, mine };
    },
  });

  const toggle = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Login required");
      const isLiked = data?.mine.has(commentId);
      if (isLiked) {
        await supabase
          .from("article_comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("article_comment_likes")
          .insert({ comment_id: commentId, user_id: user.id } as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-comment-likes", articleId] });
    },
  });

  return {
    counts: data?.counts ?? {},
    mine: data?.mine ?? new Set<string>(),
    toggle: toggle.mutate,
  };
}

// Article Likes
export function useArticleLike(articleId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: liked = false } = useQuery({
    queryKey: ["article-liked", articleId, user?.id],
    enabled: !!articleId && !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      if (liked) {
        await supabase.from("article_likes").delete().eq("article_id", articleId).eq("user_id", user.id);
      } else {
        await supabase.from("article_likes").insert({ article_id: articleId, user_id: user.id } as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-liked", articleId] });
      qc.invalidateQueries({ queryKey: ["article", articleId] });
      qc.invalidateQueries({ queryKey: ["published-articles"] });
    },
  });

  return { liked, toggle: toggle.mutate, isPending: toggle.isPending };
}

/**
 * Smart related-articles fetch:
 *   1. Same category (excluding current)
 *   2. Fill with shared-tag articles
 *   3. Fallback with recent articles
 * Always returns up to `limit` distinct items.
 */
export function useRelatedArticles(opts: {
  currentId: string;
  categoryId?: string | null;
  tags?: string[];
  limit?: number;
}) {
  const { currentId, categoryId, tags = [], limit = 3 } = opts;
  return useQuery({
    queryKey: ["related-articles", currentId, categoryId, tags.join(","), limit],
    enabled: !!currentId,
    queryFn: async () => {
      const collected = new Map<string, Article>();
      const select = "*, profiles!articles_author_id_fkey(username, full_name, avatar_url), article_categories(*)";

      // 1. Same category
      if (categoryId) {
        const { data } = await supabase
          .from("articles")
          .select(select)
          .eq("status", "published")
          .eq("category_id", categoryId)
          .neq("id", currentId)
          .order("published_at", { ascending: false })
          .limit(limit + 3);
        (data ?? []).forEach((a: any) => collected.set(a.id, a as Article));
      }

      // 2. Shared tags
      if (collected.size < limit && tags.length > 0) {
        const { data } = await supabase
          .from("articles")
          .select(select)
          .eq("status", "published")
          .neq("id", currentId)
          .overlaps("tags", tags)
          .order("published_at", { ascending: false })
          .limit(limit + 3);
        (data ?? []).forEach((a: any) => {
          if (!collected.has(a.id)) collected.set(a.id, a as Article);
        });
      }

      // 3. Recent fallback
      if (collected.size < limit) {
        const { data } = await supabase
          .from("articles")
          .select(select)
          .eq("status", "published")
          .neq("id", currentId)
          .order("published_at", { ascending: false })
          .limit(limit + 3);
        (data ?? []).forEach((a: any) => {
          if (!collected.has(a.id)) collected.set(a.id, a as Article);
        });
      }

      return Array.from(collected.values()).slice(0, limit);
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
