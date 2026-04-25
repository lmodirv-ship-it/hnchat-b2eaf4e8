import { useState } from "react";
import { Share2, Download, Loader2, Check, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  videoUrl: string;
  caption?: string | null;
  className?: string;
}

// Brand SVG icons (inline, no extra deps)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.45a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.2z" />
  </svg>
);

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function SocialShareMenu({ videoUrl, caption, className }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const ytId = getYouTubeId(videoUrl);
  const shareText = caption?.trim() || "Check out this video on HN Chat";
  const shareUrl = ytId ? `https://youtu.be/${ytId}` : videoUrl;

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      toast.success("Caption copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy caption");
    }
  }

  async function downloadVideo() {
    if (ytId) {
      toast.info("YouTube videos can't be downloaded directly. Caption copied instead.");
      copyCaption();
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hnchat-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Video downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function shareTo(platform: "facebook" | "instagram" | "tiktok") {
    // 1) copy caption
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    } catch {
      // ignore
    }

    // 2) trigger download (skip for youtube)
    if (!ytId) {
      downloadVideo();
    }

    // 3) open the target platform
    let target = "";
    if (platform === "facebook") {
      target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    } else if (platform === "instagram") {
      target = "https://www.instagram.com/";
      toast.info("Video downloaded & caption copied. Upload it on Instagram.");
    } else {
      target = "https://www.tiktok.com/upload";
      toast.info("Video downloaded & caption copied. Upload it on TikTok.");
    }
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-violet-glow/10 transition-colors hover:text-violet-glow",
            className
          )}
          aria-label="Share video"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => shareTo("facebook")} className="gap-2">
          <span className="text-[#1877F2]"><FacebookIcon /></span>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareTo("instagram")} className="gap-2">
          <span className="text-[#E4405F]"><InstagramIcon /></span>
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareTo("tiktok")} className="gap-2">
          <span><TikTokIcon /></span>
          TikTok
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={downloadVideo} disabled={downloading} className="gap-2">
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download video
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyCaption} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy caption
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
