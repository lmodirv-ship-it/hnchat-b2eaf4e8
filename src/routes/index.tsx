import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HN-Chat — عالمك في تطبيق واحد | دردشة ذكاء اصطناعي" },
      { name: "description", content: "HN-Chat أفضل منصة سوبر آب عربية. دردشة ذكاء اصطناعي، تواصل اجتماعي، تسوق، تداول عملات رقمية، وفيديوهات في تطبيق واحد. ابدأ مجاناً الآن." },
      { property: "og:title", content: "HN-Chat — عالمك في تطبيق واحد" },
      { property: "og:description", content: "دردشة AI، تواصل اجتماعي، تسوق، تداول عملات رقمية — كل ما تحتاجه في مكان واحد." },
    ],
  }),
  component: LandingPage,
});
