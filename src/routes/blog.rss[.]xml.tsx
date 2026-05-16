import { createFileRoute } from "@tanstack/react-router";
import { fetchRssArticles } from "@/utils/public-pages.functions";

const SITE_URL = "https://www.hn-chat.com";

const esc = (s: string) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const stripMd = (s: string) =>
  (s || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const Route = createFileRoute("/blog/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const articles = await fetchRssArticles();
        const lastBuild = new Date().toUTCString();
        const lastPub =
          articles.length > 0
            ? new Date(articles[0].published_at ?? articles[0].updated_at ?? Date.now()).toUTCString()
            : lastBuild;

        const items = articles
          .map((a: any) => {
            const id = a.short_id ?? a.id;
            const link = `${SITE_URL}/blog/${id}`;
            const pubDate = new Date(a.published_at ?? a.updated_at ?? Date.now()).toUTCString();
            const desc = stripMd(a.short_description ?? "").slice(0, 280);
            const authorName = a.author?.full_name ?? a.author?.username ?? "hnChat";
            const cat = a.category?.name_ar ?? a.category?.name;
            const image = a.featured_image
              ? `<enclosure url="${esc(a.featured_image)}" type="image/jpeg" />`
              : "";
            const catTag = cat ? `<category>${esc(cat)}</category>` : "";
            return `    <item>
      <title>${esc(a.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(desc)}</description>
      <dc:creator>${esc(authorName)}</dc:creator>
      ${catTag}
      ${image}
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>مدونة hnChat</title>
    <link>${SITE_URL}/blog</link>
    <description>أحدث المقالات عن الذكاء الاصطناعي، التقنية، والتواصل الاجتماعي من فريق hnChat.</description>
    <language>ar</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <pubDate>${lastPub}</pubDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <generator>hnChat</generator>
    <image>
      <url>${SITE_URL}/icon-512.png</url>
      <title>مدونة hnChat</title>
      <link>${SITE_URL}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=1800",
          },
        });
      },
    },
  },
});
