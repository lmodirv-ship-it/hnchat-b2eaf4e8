import { createFileRoute, Link } from "@tanstack/react-router";
import { Youtube, Film, Sparkles } from "lucide-react";
import { MyChannelsCard } from "@/components/feed/MyChannelsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/add-channel")({
  head: () => ({
    meta: [
      { title: "إضافة قناة — استورد قنواتك إلى الخلاصة" },
      { name: "description", content: "ألصق رابط قناة YouTube ليتم استيراد فيديوهاتها تلقائياً إلى خلاصتك و Reels." },
    ],
  }),
  component: AddChannelPage,
});

function AddChannelPage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30">
          <Youtube className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">إضافة قناة</h1>
          <p className="text-sm text-muted-foreground">
            استورد قناة YouTube لتظهر فيديوهاتها في خلاصتك و Reels تلقائياً.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <Card className="p-4 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">في الخلاصة</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            تظهر فيديوهات قنواتك بشكل جميل مع إعجاب وتعليق ومشاركة.
          </p>
          <Link to="/feed" className="block mt-3">
            <Button variant="outline" size="sm" className="w-full">عرض الخلاصة</Button>
          </Link>
        </Card>
        <Card className="p-4 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-4 w-4 text-pink-500" />
            <h3 className="font-semibold text-sm">في Reels</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            تُعرض الفيديوهات أيضاً ضمن تجربة Reels العمودية.
          </p>
          <Link to="/reels" className="block mt-3">
            <Button variant="outline" size="sm" className="w-full">فتح Reels</Button>
          </Link>
        </Card>
      </div>

      <MyChannelsCard />

      <p className="text-xs text-muted-foreground text-center mt-4">
        تريد تصفح فيديوهات قناة قبل الإضافة؟{" "}
        <Link to="/youtube" className="text-primary underline">صفحة الاستيراد المتقدمة</Link>
      </p>
    </div>
  );
}
