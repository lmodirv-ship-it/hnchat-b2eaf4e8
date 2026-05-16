import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const fetchPublicPost = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const isShortId = /^[a-z]\d{6}$/.test(data.id);
    const column = isShortId ? "short_id" : "id";
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("id, short_id, content, media_urls, type, likes_count, comments_count, views_count, created_at, user_id")
      .eq(column, data.id)
      .maybeSingle();

    if (error || !post) return null;

    const { data: author } = await supabaseAdmin
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", post.user_id)
      .maybeSingle();

    return {
      id: post.short_id ?? post.id,
      content: post.content,
      media_urls: post.media_urls ?? [],
      type: post.type,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      views_count: post.views_count,
      created_at: post.created_at,
      author: author ?? null,
    };
  });

export const fetchPublicStream = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { data: stream, error } = await supabaseAdmin
      .from("live_streams")
      .select("id, user_id, title, description, thumbnail_url, status, viewer_count, peak_viewers, category, started_at, ended_at, created_at, is_private")
      .eq("id", data.id)
      .maybeSingle();

    if (error || !stream || stream.is_private) return null;

    const { data: author } = await supabaseAdmin
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", stream.user_id)
      .maybeSingle();

    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      thumbnail_url: stream.thumbnail_url,
      status: stream.status,
      viewer_count: stream.viewer_count,
      peak_viewers: stream.peak_viewers,
      category: stream.category,
      started_at: stream.started_at,
      ended_at: stream.ended_at,
      created_at: stream.created_at,
      author: author ?? null,
    };
  });

export const fetchPublicArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const isShortId = /^[a-z]\d{6}$/.test(data.id);
    const isUuid = /^[0-9a-f-]{36}$/i.test(data.id);
    const column = isShortId ? "short_id" : isUuid ? "id" : "slug";

    const { data: article } = await supabaseAdmin
      .from("articles")
      .select("id, short_id, title, slug, language, featured_image, short_description, content, tags, seo_title, seo_description, reading_time, published_at, updated_at, views_count, likes_count, author_id, category_id")
      .eq(column, data.id)
      .eq("status", "published")
      .maybeSingle();

    if (!article) return null;

    const [{ data: author }, { data: category }] = await Promise.all([
      supabaseAdmin.from("profiles").select("username, full_name, avatar_url, bio").eq("id", article.author_id).maybeSingle(),
      article.category_id
        ? supabaseAdmin.from("article_categories").select("name, name_ar, name_fr, slug").eq("id", article.category_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return { ...article, author, category };
  });

export const fetchRssArticles = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabaseAdmin
      .from("articles")
      .select("id, short_id, slug, title, short_description, featured_image, published_at, updated_at, language, author_id, category_id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(30);
    const items = data ?? [];
    if (items.length === 0) return [] as any[];

    const authorIds = [...new Set(items.map((a) => a.author_id).filter(Boolean))] as string[];
    const categoryIds = [...new Set(items.map((a) => a.category_id).filter(Boolean))] as string[];

    const [{ data: authors }, { data: categories }] = await Promise.all([
      authorIds.length > 0
        ? supabaseAdmin.from("profiles").select("id, username, full_name").in("id", authorIds)
        : Promise.resolve({ data: [] as any[] }),
      categoryIds.length > 0
        ? supabaseAdmin.from("article_categories").select("id, name, name_ar").in("id", categoryIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const authorMap = new Map((authors ?? []).map((a: any) => [a.id, a]));
    const catMap = new Map((categories ?? []).map((c: any) => [c.id, c]));

    return items.map((a) => ({
      ...a,
      author: authorMap.get(a.author_id) ?? null,
      category: catMap.get(a.category_id) ?? null,
    }));
  });

export const fetchSitemapData = createServerFn({ method: "GET" })
  .handler(async () => {
    let posts: { id: string; updated_at: string }[] = [];
    let streams: { id: string; updated_at: string }[] = [];
    let articles: { id: string; short_id: string | null; slug: string; updated_at: string; published_at: string | null; featured_image: string | null; title: string }[] = [];

    try {
      const { data } = await supabaseAdmin
        .from("posts")
        .select("id, updated_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (data) posts = data;
    } catch {}

    try {
      const { data } = await supabaseAdmin
        .from("live_streams")
        .select("id, updated_at")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(500);
      if (data) streams = data;
    } catch {}

    try {
      const { data } = await supabaseAdmin
        .from("articles")
        .select("id, short_id, slug, updated_at, published_at, featured_image, title")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(2000);
      if (data) articles = data as any;
    } catch {}

    return { posts, streams, articles };
  });
