import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Cinematic3DScreen — A futuristic 3D-perspective video screen.
 * Wraps any iframe/video element in a holographic floating display with:
 * - 3D perspective tilt (parallax with mouse)
 * - Glowing neon edges
 * - Floor reflection
 * - Light particles & ambient halo
 * - Holographic frame
 */
export function Cinematic3DScreen({
  children,
  aspect = "16/9",
}: {
  children: ReactNode;
  aspect?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setTilt({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) }),
      );
    }
    function onLeave() {
      setTilt({ x: 0, y: 0 });
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Tilt limits (degrees)
  const rotY = tilt.x * 8;
  const rotX = -tilt.y * 6;

  return (
    <div
      ref={stageRef}
      className="cinematic-stage relative w-full mb-2 select-none"
      style={{ perspective: "1600px", perspectiveOrigin: "50% 30%" }}
    >
      {/* Ambient room glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[120%] w-[120%] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, oklch(0.78 0.18 220 / 0.55), transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[80%] w-[120%] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 80%, oklch(0.65 0.25 295 / 0.55), transparent 60%)",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-cyan-glow/40"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animation: `floatY ${6 + (i % 5)}s ease-in-out ${i * 0.3}s infinite alternate`,
              boxShadow: "0 0 10px oklch(0.78 0.18 220 / 0.9)",
            }}
          />
        ))}
      </div>

      {/* 3D screen */}
      <div
        className="cinematic-screen relative mx-auto w-full"
        style={{
          aspectRatio: aspect,
          maxWidth: "min(100%, 1100px)",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {/* Outer holographic ring */}
        <div
          className="absolute -inset-1 rounded-[26px] opacity-90"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.18 220), oklch(0.65 0.25 295), oklch(0.75 0.22 340), oklch(0.78 0.18 220))",
            backgroundSize: "300% 300%",
            animation: "holoShift 8s ease-in-out infinite",
            filter: "blur(8px)",
            transform: "translateZ(-30px)",
          }}
        />

        {/* Bezel */}
        <div
          className="absolute inset-0 rounded-[22px] p-[2px]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.05 240 / 0.9), oklch(0.25 0.03 280 / 0.9))",
            boxShadow:
              "0 30px 80px -20px oklch(0.5 0.2 260 / 0.6), 0 0 60px -10px oklch(0.78 0.18 220 / 0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          <div
            className="relative h-full w-full rounded-[20px] overflow-hidden bg-black"
            style={{ transform: "translateZ(20px)" }}
          >
            {children}

            {/* Top scan-line shimmer */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
              style={{
                background:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)",
              }}
            />
            {/* Vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            {/* Top edge gloss */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
              }}
            />
          </div>
        </div>

        {/* Bottom corner accents */}
        <div className="pointer-events-none absolute -bottom-1 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-glow/80 to-transparent" />
      </div>

      {/* Floor reflection */}
      <div
        className="cinematic-floor relative mx-auto -mt-2 w-full overflow-hidden"
        style={{
          aspectRatio: aspect,
          maxWidth: "min(100%, 1100px)",
          height: "auto",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 35%, transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 35%, transparent 70%)",
          transform: "scaleY(-1) perspective(1200px) rotateX(35deg)",
          transformOrigin: "top center",
          filter: "blur(2px) saturate(1.2)",
          opacity: 0.5,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.78 0.18 220 / 0.35), oklch(0.65 0.25 295 / 0.2) 50%, transparent)",
          }}
        />
      </div>

      {/* Floor grid */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-40px] w-[120%] h-32 -z-10 opacity-30"
        style={{
          background:
            "linear-gradient(transparent, oklch(0.78 0.18 220 / 0.4)), repeating-linear-gradient(90deg, transparent 0 39px, oklch(0.78 0.18 220 / 0.5) 39px 40px), repeating-linear-gradient(0deg, transparent 0 39px, oklch(0.78 0.18 220 / 0.5) 39px 40px)",
          transform: "perspective(600px) rotateX(70deg)",
          transformOrigin: "top center",
          maskImage: "linear-gradient(180deg, transparent, black 40%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, black 40%, transparent)",
        }}
      />

      <style>{`
        @keyframes holoShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes floatY {
          0% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: translateY(-30px) translateX(8px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
