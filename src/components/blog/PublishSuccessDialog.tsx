import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink, Copy, FileText, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  articleUrl: string;
  articleTitle: string;
  onClose: () => void;
};

/**
 * Shown after a successful article publish. Confirms the dedicated page
 * was created and gives the author quick ways to open or share it.
 */
export function PublishSuccessDialog({ open, articleUrl, articleTitle, onClose }: Props) {
  const navigate = useNavigate();
  if (!open) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      toast.success("تم نسخ الرابط");
    } catch {
      toast.error("تعذّر نسخ الرابط");
    }
  };

  const openArticle = () => {
    window.open(articleUrl, "_blank", "noopener,noreferrer");
  };

  const goDashboard = () => {
    onClose();
    navigate({ to: "/blog-dashboard" as any });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-cyan-glow/20 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.13_0.02_250)] p-7 shadow-[0_20px_80px_oklch(0_0_0/0.6)]"
        dir="rtl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 border border-cyan-glow/30">
            <CheckCircle2 className="h-6 w-6 text-cyan-glow" />
          </div>
          <div>
            <h3 className="text-lg font-bold">تم نشر المقال ✨</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              تم إنشاء صفحة خاصة بمقالك
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground/70 mb-2 line-clamp-2 font-semibold text-foreground/85">
          {articleTitle}
        </p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-[oklch(0.10_0.02_250)] border border-ice-border/10 mb-5">
          <FileText className="h-3.5 w-3.5 text-cyan-glow shrink-0" />
          <span dir="ltr" className="text-[11px] text-muted-foreground/70 truncate flex-1 font-mono">
            {articleUrl}
          </span>
          <button
            onClick={copyLink}
            className="p-1.5 rounded-lg hover:bg-cyan-glow/10 text-muted-foreground/60 hover:text-cyan-glow transition"
            title="نسخ"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <Button
            onClick={openArticle}
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground h-11"
          >
            <ExternalLink className="h-4 w-4 ml-2" />
            فتح صفحة المقال
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={copyLink} variant="outline" className="border-ice-border/20 h-10 text-xs">
              <Copy className="h-3.5 w-3.5 ml-1.5" /> نسخ الرابط
            </Button>
            <Button onClick={goDashboard} variant="outline" className="border-ice-border/20 h-10 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5 ml-1.5" /> لوحة التحكم
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
