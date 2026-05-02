import { createServerFn } from "@tanstack/react-start";

const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, /^0\./, /^::1$/, /^localhost$/i, /^fc00:/i, /^fe80:/i,
];

function blockPrivateNetworks(urlStr: string): void {
  const u = new URL(urlStr);
  const hostname = u.hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_IP_PATTERNS.some((r) => r.test(hostname))) {
    throw new Error("Private network addresses are not allowed");
  }
}

export type ScrapedProduct = {
  url: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  siteName: string;
};

export type ScrapedListItem = {
  url: string;
  title: string;
  image: string | null;
  price: number | null;
  currency: string;
};

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeHtml(m[1].trim());
  }
  return null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function metaRe(prop: string, attr: "property" | "name" = "property"): RegExp {
  return new RegExp(
    `<meta[^>]+${attr}=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
}
function metaReRev(prop: string, attr: "property" | "name" = "property"): RegExp {
  return new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${prop}["']`,
    "i"
  );
}

function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {}
  }
  return out;
}

function findProductJsonLd(blocks: any[]): any | null {
  for (const b of blocks) {
    const items = Array.isArray(b?.["@graph"]) ? b["@graph"] : [b];
    for (const it of items) {
      const t = it?.["@type"];
      if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return it;
    }
  }
  return null;
}

function absolutize(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export const scrapeProductUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (!input?.url || typeof input.url !== "string") {
      throw new Error("URL is required");
    }
    let u: URL;
    try {
      u = new URL(input.url);
    } catch {
      throw new Error("Invalid URL");
    }
    if (!["http:", "https:"].includes(u.protocol)) {
      throw new Error("Only http/https URLs are allowed");
    }
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<ScrapedProduct> => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
    const html = await res.text();

    const jsonLdBlocks = extractJsonLd(html);
    const product = findProductJsonLd(jsonLdBlocks);

    let title =
      product?.name ||
      pickMeta(html, [metaRe("og:title"), metaReRev("og:title"), metaRe("twitter:title", "name")]) ||
      pickMeta(html, [/<title[^>]*>([^<]+)<\/title>/i]) ||
      "";

    let description =
      product?.description ||
      pickMeta(html, [
        metaRe("og:description"),
        metaReRev("og:description"),
        metaRe("description", "name"),
        metaRe("twitter:description", "name"),
      ]) ||
      "";

    const siteName =
      pickMeta(html, [metaRe("og:site_name"), metaReRev("og:site_name")]) ||
      new URL(data.url).hostname;

    // Price + currency
    let price: number | null = null;
    let currency = "USD";
    const offers = product?.offers;
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer) {
      const p = offer.price ?? offer.lowPrice;
      if (p != null) price = parseFloat(String(p));
      if (offer.priceCurrency) currency = String(offer.priceCurrency).toUpperCase();
    }
    if (price == null) {
      const metaPrice = pickMeta(html, [
        metaRe("product:price:amount"),
        metaRe("og:price:amount"),
        metaRe("twitter:data1", "name"),
      ]);
      if (metaPrice) {
        const n = parseFloat(metaPrice.replace(/[^\d.,]/g, "").replace(",", "."));
        if (!isNaN(n)) price = n;
      }
      const metaCur = pickMeta(html, [
        metaRe("product:price:currency"),
        metaRe("og:price:currency"),
      ]);
      if (metaCur) currency = metaCur.toUpperCase();
    }

    // Images
    const images: string[] = [];
    if (product?.image) {
      const imgs = Array.isArray(product.image) ? product.image : [product.image];
      for (const i of imgs) {
        if (typeof i === "string") images.push(absolutize(i, data.url));
        else if (i?.url) images.push(absolutize(i.url, data.url));
      }
    }
    const ogImg = pickMeta(html, [metaRe("og:image"), metaReRev("og:image"), metaRe("twitter:image", "name")]);
    if (ogImg) images.push(absolutize(ogImg, data.url));

    const unique = Array.from(new Set(images)).slice(0, 5);

    return {
      url: data.url,
      title: String(title).slice(0, 200),
      description: String(description).slice(0, 1000),
      price,
      currency,
      images: unique,
      siteName,
    };
  });

// ----- Category / store page scraping -----

function extractItemListJsonLd(blocks: any[]): any[] {
  const items: any[] = [];
  for (const b of blocks) {
    const list = Array.isArray(b?.["@graph"]) ? b["@graph"] : [b];
    for (const it of list) {
      const t = it?.["@type"];
      const isList = t === "ItemList" || (Array.isArray(t) && t.includes("ItemList"));
      if (isList && Array.isArray(it.itemListElement)) {
        for (const el of it.itemListElement) {
          const item = el?.item || el;
          if (item) items.push(item);
        }
      }
      const isProd = t === "Product" || (Array.isArray(t) && t.includes("Product"));
      if (isProd) items.push(it);
    }
  }
  return items;
}

function parsePriceText(text: string): { price: number | null; currency: string } {
  const curMatch = text.match(/(USD|EUR|GBP|SAR|AED|EGP|MAD|TND|DZD|JOD|KWD|QAR|\$|€|£|﷼|د\.إ)/i);
  let currency = "USD";
  if (curMatch) {
    const c = curMatch[1];
    currency = c === "$" ? "USD" : c === "€" ? "EUR" : c === "£" ? "GBP" : c === "﷼" ? "SAR" : c === "د.إ" ? "AED" : c.toUpperCase();
  }
  const numMatch = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const price = numMatch ? parseFloat(numMatch[1]) : null;
  return { price, currency };
}

function scrapeAnchorProducts(html: string, base: string): ScrapedListItem[] {
  const out: ScrapedListItem[] = [];
  const seen = new Set<string>();
  // find <a ...> ... </a> blocks (lazy)
  const aRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = aRe.exec(html)) && count < 200) {
    const href = m[1];
    const inner = m[2];
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) continue;
    const abs = absolutize(href, base);
    // heuristic: product-like url
    if (!/\/(product|products|p|item|dp|prod|shop)\//i.test(abs)) continue;
    if (seen.has(abs)) continue;

    const imgMatch = inner.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
    const altMatch = inner.match(/<img[^>]+alt=["']([^"']+)["']/i);
    const titleMatch =
      inner.match(/<(?:h[1-6]|span|div|p)[^>]*>([^<]{4,120})<\//i) ||
      (altMatch ? [null, altMatch[1]] : null);
    if (!titleMatch && !imgMatch) continue;

    const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const priceText = text.match(/[\$€£﷼]\s?\d[\d.,]*|\d[\d.,]*\s?(USD|EUR|GBP|SAR|AED|EGP|MAD|TND|DZD)/i);
    const { price, currency } = priceText ? parsePriceText(priceText[0]) : { price: null, currency: "USD" };

    seen.add(abs);
    out.push({
      url: abs,
      title: decodeHtml((titleMatch ? titleMatch[1] : altMatch?.[1] || "").trim()).slice(0, 200),
      image: imgMatch ? absolutize(imgMatch[1], base) : null,
      price,
      currency,
    });
    count++;
  }
  return out;
}

export const scrapeCategoryUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (!input?.url || typeof input.url !== "string") throw new Error("URL is required");
    let u: URL;
    try { u = new URL(input.url); } catch { throw new Error("Invalid URL"); }
    if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only http/https URLs are allowed");
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<{ items: ScrapedListItem[]; siteName: string }> => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
    const html = await res.text();

    const siteName =
      pickMeta(html, [metaRe("og:site_name"), metaReRev("og:site_name")]) ||
      new URL(data.url).hostname;

    const items: ScrapedListItem[] = [];
    const seen = new Set<string>();

    // 1) Try JSON-LD ItemList / Product nodes
    const ld = extractJsonLd(html);
    const ldItems = extractItemListJsonLd(ld);
    for (const it of ldItems) {
      const url = it.url || it["@id"];
      if (!url || typeof url !== "string") continue;
      const abs = absolutize(url, data.url);
      if (seen.has(abs)) continue;
      const offer = Array.isArray(it.offers) ? it.offers[0] : it.offers;
      const price = offer?.price ?? offer?.lowPrice;
      const img = Array.isArray(it.image) ? it.image[0] : it.image;
      seen.add(abs);
      items.push({
        url: abs,
        title: String(it.name || "").slice(0, 200),
        image: img ? absolutize(typeof img === "string" ? img : img.url, data.url) : null,
        price: price != null ? parseFloat(String(price)) : null,
        currency: offer?.priceCurrency ? String(offer.priceCurrency).toUpperCase() : "USD",
      });
    }

    // 2) Fallback: anchor heuristic scraping
    if (items.length < 3) {
      for (const it of scrapeAnchorProducts(html, data.url)) {
        if (!seen.has(it.url)) {
          seen.add(it.url);
          items.push(it);
        }
      }
    }

    return { items: items.slice(0, 60), siteName };
  });

// ----- Quick import by site name only -----
// User types "nike" or "nike.com" and we try common product/collection paths.

function normalizeSiteToOrigin(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!s.includes(".")) s = `${s}.com`;
  s = s.split("/")[0];
  return `https://${s}`;
}

const COMMON_PRODUCT_PATHS = [
  "/collections/all",
  "/collections/all-products",
  "/products",
  "/shop",
  "/store",
  "/catalog",
  "/all",
  "/",
];

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export const scrapeBySiteName = createServerFn({ method: "POST" })
  .inputValidator((input: { site: string }) => {
    if (!input?.site || typeof input.site !== "string") {
      throw new Error("Site name is required");
    }
    return { site: input.site };
  })
  .handler(
    async ({
      data,
    }): Promise<{
      items: ScrapedListItem[];
      siteName: string;
      origin: string;
      sourceUrl: string;
    }> => {
      const origin = normalizeSiteToOrigin(data.site);

      // 1) Try Shopify products.json (works on most Shopify stores)
      try {
        const shopifyRes = await fetch(`${origin}/products.json?limit=60`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.lovable.app)",
            Accept: "application/json",
          },
          redirect: "follow",
        });
        if (shopifyRes.ok) {
          const json: any = await shopifyRes.json();
          if (Array.isArray(json?.products) && json.products.length > 0) {
            const items: ScrapedListItem[] = json.products
              .slice(0, 60)
              .map((p: any) => {
                const variant = Array.isArray(p.variants) ? p.variants[0] : null;
                const image = Array.isArray(p.images) && p.images[0]
                  ? p.images[0].src
                  : null;
                const price = variant?.price ? parseFloat(variant.price) : null;
                return {
                  url: `${origin}/products/${p.handle}`,
                  title: String(p.title || "").slice(0, 200),
                  image,
                  price,
                  currency: "USD",
                };
              })
              .filter((it: ScrapedListItem) => it.title);
            if (items.length > 0) {
              return {
                items,
                siteName: new URL(origin).hostname,
                origin,
                sourceUrl: `${origin}/products.json`,
              };
            }
          }
        }
      } catch {}

      // 2) Try common HTML paths
      for (const path of COMMON_PRODUCT_PATHS) {
        const url = `${origin}${path}`;
        const html = await fetchHtml(url);
        if (!html) continue;

        const siteName =
          pickMeta(html, [metaRe("og:site_name"), metaReRev("og:site_name")]) ||
          new URL(origin).hostname;

        const items: ScrapedListItem[] = [];
        const seen = new Set<string>();

        const ld = extractJsonLd(html);
        const ldItems = extractItemListJsonLd(ld);
        for (const it of ldItems) {
          const u = it.url || it["@id"];
          if (!u || typeof u !== "string") continue;
          const abs = absolutize(u, url);
          if (seen.has(abs)) continue;
          const offer = Array.isArray(it.offers) ? it.offers[0] : it.offers;
          const price = offer?.price ?? offer?.lowPrice;
          const img = Array.isArray(it.image) ? it.image[0] : it.image;
          seen.add(abs);
          items.push({
            url: abs,
            title: String(it.name || "").slice(0, 200),
            image: img
              ? absolutize(typeof img === "string" ? img : img.url, url)
              : null,
            price: price != null ? parseFloat(String(price)) : null,
            currency: offer?.priceCurrency
              ? String(offer.priceCurrency).toUpperCase()
              : "USD",
          });
        }
        if (items.length < 3) {
          for (const it of scrapeAnchorProducts(html, url)) {
            if (!seen.has(it.url)) {
              seen.add(it.url);
              items.push(it);
            }
          }
        }

        if (items.length >= 3) {
          return {
            items: items.slice(0, 60),
            siteName,
            origin,
            sourceUrl: url,
          };
        }
      }

      // 3) Fallback: use Firecrawl (real browser) for SPA sites
      const fcKey = process.env.FIRECRAWL_API_KEY;
      if (fcKey) {
        const targetUrl = data.site.startsWith("http")
          ? data.site
          : `${origin}${data.site.includes("/") ? "/" + data.site.split("/").slice(1).join("/") : ""}`;

        try {
          const fcRes = await fetch("https://api.firecrawl.dev/v2/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${fcKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: targetUrl,
              formats: ["html", "links"],
              onlyMainContent: false,
              waitFor: 3000,
            }),
          });
          if (fcRes.ok) {
            const fcJson: any = await fcRes.json();
            const html: string =
              fcJson?.data?.html || fcJson?.data?.rawHtml || "";
            const siteName =
              pickMeta(html, [
                metaRe("og:site_name"),
                metaReRev("og:site_name"),
              ]) || new URL(origin).hostname;

            const items: ScrapedListItem[] = [];
            const seen = new Set<string>();

            const ld = extractJsonLd(html);
            const ldItems = extractItemListJsonLd(ld);
            for (const it of ldItems) {
              const u = it.url || it["@id"];
              if (!u || typeof u !== "string") continue;
              const abs = absolutize(u, targetUrl);
              if (seen.has(abs)) continue;
              const offer = Array.isArray(it.offers) ? it.offers[0] : it.offers;
              const price = offer?.price ?? offer?.lowPrice;
              const img = Array.isArray(it.image) ? it.image[0] : it.image;
              seen.add(abs);
              items.push({
                url: abs,
                title: String(it.name || "").slice(0, 200),
                image: img
                  ? absolutize(typeof img === "string" ? img : img.url, targetUrl)
                  : null,
                price: price != null ? parseFloat(String(price)) : null,
                currency: offer?.priceCurrency
                  ? String(offer.priceCurrency).toUpperCase()
                  : "USD",
              });
            }

            for (const it of scrapeAnchorProducts(html, targetUrl)) {
              if (!seen.has(it.url)) {
                seen.add(it.url);
                items.push(it);
              }
            }

            // Fallback: use Firecrawl's link list to detect product URLs
            // (works for SPAs where anchors aren't in the rendered HTML in the
            // same shape but links were collected by the real browser).
            if (items.length < 3) {
              const links: string[] = Array.isArray(fcJson?.data?.links)
                ? fcJson.data.links
                : [];
              const productLinks = links.filter((l) =>
                /\/(product|products|p|item|dp|prod|shop)\//i.test(l)
              );
              for (const l of productLinks.slice(0, 24)) {
                if (seen.has(l)) continue;
                seen.add(l);
                items.push({
                  url: l,
                  title: "",
                  image: null,
                  price: null,
                  currency: "USD",
                });
              }

              // Enrich first batch with metadata via parallel scrapes
              const toEnrich = items.filter((it) => !it.title).slice(0, 12);
              await Promise.all(
                toEnrich.map(async (it) => {
                  try {
                    const r = await fetch(
                      "https://api.firecrawl.dev/v2/scrape",
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${fcKey}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          url: it.url,
                          formats: ["html"],
                          onlyMainContent: false,
                          waitFor: 2000,
                        }),
                      }
                    );
                    if (!r.ok) return;
                    const j: any = await r.json();
                    const h: string = j?.data?.html || j?.data?.rawHtml || "";
                    const title =
                      pickMeta(h, [
                        metaRe("og:title"),
                        metaReRev("og:title"),
                      ]) ||
                      pickMeta(h, [/<title[^>]*>([^<]+)<\/title>/i]) ||
                      "";
                    const img = pickMeta(h, [
                      metaRe("og:image"),
                      metaReRev("og:image"),
                    ]);
                    const priceMeta = pickMeta(h, [
                      metaRe("product:price:amount"),
                      metaRe("og:price:amount"),
                    ]);
                    const curMeta = pickMeta(h, [
                      metaRe("product:price:currency"),
                      metaRe("og:price:currency"),
                    ]);
                    it.title = String(title).slice(0, 200);
                    if (img) it.image = absolutize(img, it.url);
                    if (priceMeta) {
                      const n = parseFloat(
                        priceMeta.replace(/[^\d.,]/g, "").replace(",", ".")
                      );
                      if (!isNaN(n)) it.price = n;
                    }
                    if (curMeta) it.currency = curMeta.toUpperCase();
                  } catch {}
                })
              );

              // Drop items that still have no title AND no image (likely junk)
              const cleaned = items.filter((it) => it.title || it.image);
              items.length = 0;
              items.push(...cleaned);
            }

            if (items.length > 0) {
              return {
                items: items.slice(0, 60),
                siteName,
                origin,
                sourceUrl: targetUrl,
              };
            }
          }
        } catch (e) {
          console.error("Firecrawl fallback failed:", e);
        }
      }

      return {
        items: [],
        siteName: new URL(origin).hostname,
        origin,
        sourceUrl: origin,
      };
    }
  );
