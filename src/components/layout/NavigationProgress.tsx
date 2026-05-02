import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";

/**
 * Thin YouTube-style navigation progress bar.
 * Shows at the very top of the viewport during route transitions.
 */
export function NavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(15);
      // Simulate progress: fast at first, slows down
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Slow down as we approach 90%
          const increment = Math.max(0.5, (90 - prev) * 0.08);
          return Math.min(prev + increment, 90);
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (visible) {
        setProgress(100);
        // Hide after completion animation
        const timeout = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100
            ? "width 200ms ease-out, opacity 300ms ease-out 100ms"
            : "width 200ms ease-out",
        }}
      />
      {/* Glow effect at the tip */}
      {progress < 100 && (
        <div
          className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent to-cyan-glow/50 blur-sm"
          style={{ right: `${100 - progress}%` }}
        />
      )}
    </div>
  );
}
