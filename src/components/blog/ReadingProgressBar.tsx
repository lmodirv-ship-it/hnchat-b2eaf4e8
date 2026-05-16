import { useEffect, useState } from "react";

/**
 * Fixed reading progress bar that shows how far the user has scrolled
 * through the article. Uses requestAnimationFrame for smooth updates.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      setProgress(pct);
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, oklch(0.78 0.18 220) 0%, oklch(0.65 0.25 295) 100%)",
          boxShadow: "0 0 12px oklch(0.78 0.18 220 / 0.6)",
        }}
      />
    </div>
  );
}
