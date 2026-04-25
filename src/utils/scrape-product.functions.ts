import { createServerFn } from "@tanstack/react-start";

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
