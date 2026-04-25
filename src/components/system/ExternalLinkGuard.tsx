import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Prevents users from leaving the site.
 * - Intercepts clicks on external <a> links
 * - Blocks window.open to external URLs
 * - Blocks form submissions to external action URLs
 *
 * Allowed: same-origin, lovable.app subdomains, blob:, data:, mailto:, tel:, javascript:void, #anchors
 */
const ALLOWED_HOST_SUFFIXES = ["lovable.app", "lovable.dev", "hnchat.net"];

function isAllowedUrl(href: string): boolean {
  if (!href) return true;
  const trimmed = href.trim();
  if (!trimmed) return true;
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("?") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("sms:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("javascript:")
  ) {
    return true;
  }
  try {
    const url = new URL(trimmed, window.location.href);
    if (url.origin === window.location.origin) return true;
    const host = url.hostname;
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith("." + suffix),
    );
  } catch {
    return true;
  }
}

export function ExternalLinkGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (!isAllowedUrl(href)) {
        e.preventDefault();
        e.stopPropagation();
        toast.info("الروابط الخارجية معطّلة داخل التطبيق", {
          description: "ابقَ معنا داخل hnChat ✨",
        });
      }
    }

    function handleSubmit(e: SubmitEvent) {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const action = form.getAttribute("action");
      if (!action) return;
      if (!isAllowedUrl(action)) {
        e.preventDefault();
        e.stopPropagation();
        toast.info("الإرسال للروابط الخارجية معطّل");
      }
    }

    // Wrap window.open
    const originalOpen = window.open;
    window.open = function (
      url?: string | URL,
      target?: string,
      features?: string,
    ) {
      const href = typeof url === "string" ? url : url?.toString() || "";
      if (href && !isAllowedUrl(href)) {
        toast.info("لا يمكن فتح روابط خارجية");
        return null;
      }
      return originalOpen.call(window, url as any, target, features);
    } as typeof window.open;

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.open = originalOpen;
    };
  }, []);

  return null;
}
