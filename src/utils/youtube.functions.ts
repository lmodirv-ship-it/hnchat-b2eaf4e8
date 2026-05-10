import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Simple in-memory cache (per server instance, ~10 min TTL)
const cache = new Map<string, { at: number; data: any }>();
const TTL = 10 * 60 * 1000;
function getCached(key: string) {
  const e = cache.get(key);
  if (e && Date.now() - e.at < TTL) return e.data;
  return null;
}
function setCached(key: string, data: any) {
  cache.set(key, { at: Date.now(), data });
}

export type YtVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  author: string;
};

export type YtChannel = {
  channelId: string;
  title: string;
  avatar: string | null;
  description: string | null;
};

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

const ALLOWED_YT_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"];

function isAllowedYoutubeUrl(href: string): boolean {
  try {
    const u = new URL(href);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_YT_HOSTS.some((h) => u.hostname === h);
  } catch {
    return false;
  }
}

async function resolveChannelIdFromUrl(input: string): Promise<{ channelId: string; html: string } | null> {
  let url = input.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url.replace(/^\/+/, "");

  // Block non-YouTube URLs to prevent SSRF
  if (!isAllowedYoutubeUrl(url)) return null;

  // Direct channel id
  const m = url.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})/);
  if (m) {
    return { channelId: m[1], html: "" };
  }

  // Fetch the page and try to extract channelId
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.net)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const idMatch =
      html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})"/) ||
      html.match(/<meta itemprop="identifier" content="(UC[A-Za-z0-9_-]{20,})"/) ||
      html.match(/"externalId":"(UC[A-Za-z0-9_-]{20,})"/) ||
      html.match(/"browseId":"(UC[A-Za-z0-9_-]{20,})"/) ||
      html.match(/"channelId":"(UC[A-Za-z0-9_-]{20,})"/);
    if (!idMatch) return null;
    return { channelId: idMatch[1], html };
  } catch {
    return null;
  }
}

function extractChannelMeta(html: string): { title: string; avatar: string | null; description: string | null } {
  const titleMatch =
    html.match(/<meta property="og:title" content="([^"]+)"/) ||
    html.match(/<title>([^<]+) - YouTube<\/title>/);
  const avatarMatch =
    html.match(/<meta property="og:image" content="([^"]+)"/) ||
    html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  return {
    title: titleMatch ? decode(titleMatch[1]) : "YouTube Channel",
    avatar: avatarMatch ? avatarMatch[1].replace(/\\u0026/g, "&") : null,
    description: descMatch ? decode(descMatch[1]) : null,
  };
}

function parseRssFeed(xml: string): YtVideo[] {
  const entries = xml.split(/<entry>/).slice(1);
  return entries.map((e) => {
    const get = (tag: string, attr?: string) => {
      const r = attr
        ? new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`).exec(e)
        : new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(e);
      return r ? r[1] : "";
    };
    const videoId = (get("yt:videoId") || "").trim();
    const title = decode(get("title").trim());
    const published = get("published").trim();
    const description = decode(get("media:description").trim());
    const author = decode(get("name").trim());
    return {
      videoId,
      title,
      publishedAt: published,
      description,
      author,
      thumbnail: videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "",
    };
  }).filter((v) => v.videoId);
}

export const importYoutubeChannel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ url: z.string().min(1).max(500) }).parse(input)
  )
  .handler(async ({ data }): Promise<{ channel: YtChannel; videos: YtVideo[] } | { error: string }> => {
    const cacheKey = `yt:${data.url}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const resolved = await resolveChannelIdFromUrl(data.url);
    if (!resolved) {
      return { error: "تعذّر العثور على قناة YouTube عبر هذا الرابط. تأكد من صحته." };
    }
    const { channelId, html } = resolved;

    // Fetch channel meta if we don't have HTML yet
    let meta = { title: "YouTube Channel", avatar: null as string | null, description: null as string | null };
    if (html) {
      meta = extractChannelMeta(html);
    } else {
      try {
        const r = await fetch(`https://www.youtube.com/channel/${channelId}`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; HnBot/1.0)" },
        });
        if (r.ok) meta = extractChannelMeta(await r.text());
      } catch {}
    }

    // Fetch RSS feed (last ~15 videos)
    let videos: YtVideo[] = [];
    try {
      const rssRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      );
      if (rssRes.ok) {
        const xml = await rssRes.text();
        videos = parseRssFeed(xml);
      }
    } catch (err) {
      console.error("RSS fetch failed", err);
    }

    const result = {
      channel: { channelId, ...meta },
      videos,
    };
    setCached(cacheKey, result);
    return result;
  });

export const getYoutubeVideoMeta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ videoId: z.string().min(5).max(20).regex(/^[A-Za-z0-9_-]+$/) }).parse(input)
  )
  .handler(async ({ data }): Promise<{ title: string; author: string; channelId: string | null; thumbnail: string }> => {
    const cacheKey = `ytv:${data.videoId}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    let title = "YouTube Video";
    let author = "";
    let channelId: string | null = null;
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${data.videoId}&format=json`
      );
      if (res.ok) {
        const j = await res.json();
        title = j.title || title;
        author = j.author_name || "";
      }
      // Try to get channelId from watch page
      const watch = await fetch(`https://www.youtube.com/watch?v=${data.videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HnBot/1.0)" },
      });
      if (watch.ok) {
        const html = await watch.text();
        const m = html.match(/"channelId":"(UC[A-Za-z0-9_-]{20,})"/);
        if (m) channelId = m[1];
      }
    } catch (err) {
      console.error("oembed failed", err);
    }
    const result = {
      title,
      author,
      channelId,
      thumbnail: `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
    };
    setCached(cacheKey, result);
    return result;
  });
