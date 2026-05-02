import { Button } from "@/components/ui/button";
import { Twitter, Facebook, MessageCircle, Link as LinkIcon, Share2 } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  url: string;
  title: string;
  text?: string;
  compact?: boolean;
}

export function SocialShare({ url, title, text, compact = false }: SocialShareProps) {
  const fullUrl = url.startsWith("http") ? url : `https://www.hn-chat.com${url}`;
  const shareText = text || title;

  const copy = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success("تم نسخ الرابط ✅");
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, text: shareText, url: fullUrl });
    } else {
      copy();
    }
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, "_blank");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${fullUrl}`)}`, "_blank");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={shareNative} className="p-1.5 rounded-full hover:bg-muted transition" aria-label="Share">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button onClick={shareTwitter} size="sm" variant="ghost" className="h-8 px-2">
        <Twitter className="h-3.5 w-3.5" />
      </Button>
      <Button onClick={shareFacebook} size="sm" variant="ghost" className="h-8 px-2">
        <Facebook className="h-3.5 w-3.5" />
      </Button>
      <Button onClick={shareWhatsApp} size="sm" variant="ghost" className="h-8 px-2">
        <MessageCircle className="h-3.5 w-3.5" />
      </Button>
      <Button onClick={copy} size="sm" variant="ghost" className="h-8 px-2">
        <LinkIcon className="h-3.5 w-3.5" />
      </Button>
      <Button onClick={shareNative} size="sm" variant="ghost" className="h-8 px-2">
        <Share2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
