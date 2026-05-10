import { createFileRoute } from "@tanstack/react-router";
import { fetchSitemapData } from "@/utils/public-pages.functions";

const SITE_URL = "https://www.hn-chat.com";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const truncate = (s: string, n = 100) => {
  const t = (s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const staticRoutes = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/blog", priority: "0.9", changefreq: "daily" },
          { loc: "/about", priority: "0.8", changefreq: "monthly" },
          { loc: "/contact", priority: "0.7", changefreq: "monthly" },
          { loc: "/privacy", priority: "0.5", changefreq: "yearly" },
          { loc: "/terms", priority: "0.5", changefreq: "yearly" },
          { loc: "/sign-up-login", priority: "0.7", changefreq: "monthly" },
        ];

        const { posts, streams, articles } = await fetchSitemapData();

        const articleUrls = (articles ?? []).map((a) => {
          const id = a.short_id ?? a.id;
          const lastmod = new Date(a.updated_at || a.published_at || Date.now()).toISOString();
          const title = truncate(a.title || "", 120);
          const img = a.featured_image
            ? `<image:image><image:loc>${escapeXml(a.featured_image)}</image:loc><image:title>${escapeXml(title)}</image:title></image:image>`
            : "";
          return `<url><loc>${SITE_URL}/blog/${id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority>${img}</url>`;
        });

        const postUrls = posts.map(
          (p) =>
            `<url><loc>${SITE_URL}/post/${p.id}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
        );

        const liveUrls = streams.map(
          (s) =>
            `<url><loc>${SITE_URL}/live/${s.id}</loc><lastmod>${new Date(s.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
        );

        const staticUrls = staticRoutes.map(
          (r) =>
            `<url><loc>${SITE_URL}${r.loc}</loc><lastmod>${now}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls.join("\n")}
${articleUrls.join("\n")}
${postUrls.join("\n")}
${liveUrls.join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Short cache so new articles appear in the sitemap quickly
            "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
