import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "hnChat — The World's First Super App | AI Chat, Social, Crypto & More" },
      { name: "description", content: "hnChat is the global super app. AI-powered chat, social networking, marketplace, crypto trading, voice rooms, and short videos — all in one platform. Start free." },
      { property: "og:title", content: "hnChat — The World's First Super App" },
      { property: "og:description", content: "AI chat, social networking, marketplace, crypto trading — everything you need in one place. Join millions of users worldwide." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hn-chat.com" },
      { property: "og:site_name", content: "hnChat" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "hnChat — The World's First Super App" },
      { name: "twitter:description", content: "AI chat, social networking, marketplace, crypto trading — all in one platform." },
      { name: "keywords", content: "super app, AI chat, social network, marketplace, crypto trading, voice rooms, short videos, hnChat, hn-chat" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "en", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "ar", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "fr", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "es", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "de", href: "https://hn-chat.com" },
      { rel: "alternate", hreflang: "x-default", href: "https://hn-chat.com" },
    ],
  }),
  component: LandingPage,
});
