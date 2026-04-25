import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  component: BookmarksPage,
});

function BookmarksPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ComingSoon
        icon={Bookmark}
        title="المحفوظات"
        description="كل ما حفظته من منشورات وفيديوهات ومنتجات في مكان واحد."
        features={[
          "Posts المحفوظة من الـ Feed",
          "Videos & Reels مع علامة مرجعية",
          "Products من Marketplace و hnShop",
          "تنظيم بمجلدات وعلامات",
        ]}
      />
    </div>
  );
}
