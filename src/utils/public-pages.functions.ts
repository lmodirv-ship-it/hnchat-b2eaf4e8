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

export const fetchSitemapData = createServerFn({ method: "GET" })
  .handler(async () => {
    let posts: { id: string; updated_at: string }[] = [];
    let streams: { id: string; updated_at: string }[] = [];

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

    return { posts, streams };
  });
