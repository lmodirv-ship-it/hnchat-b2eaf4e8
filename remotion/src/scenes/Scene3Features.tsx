// Scene 3: All-in-One Features Grid (Bento style)
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { interFont } from "../fonts";

const features = [
  { icon: "💬", title: "Instant Messaging", desc: "Text, voice & video calls", color: "#6366f1", size: "large" },
  { icon: "🤖", title: "AI Assistant", desc: "Powered by GPT-5 & Gemini", color: "#06b6d4", size: "medium" },
  { icon: "🎤", title: "Live Voice Rooms", desc: "Real-time audio discussions", color: "#a855f7", size: "medium" },
  { icon: "🛒", title: "Marketplace", desc: "Buy & sell securely", color: "#22c55e", size: "large" },
  { icon: "📈", title: "Crypto Trading", desc: "Real-time prices & trading", color: "#f59e0b", size: "medium" },
  { icon: "🎬", title: "Short Videos", desc: "Create & share reels", color: "#ec4899", size: "medium" },
];

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ fontFamily: interFont, padding: 80 }}>
      {/* Section title */}
      <div style={{ textAlign: "center", opacity: titleOp, transform: `scale(${titleScale})` }}>
        <h2 style={{ fontSize: 72, fontWeight: 900, color: "white", margin: 0 }}>
          Everything in{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            One Place
          </span>
        </h2>
        <p style={{ fontSize: 26, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
          6 powerful apps unified into one super platform
        </p>
      </div>

      {/* Bento Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 24,
          marginTop: 60,
          height: 620,
        }}
      >
        {features.map((f, i) => {
          const delay = 20 + i * 12;
          const cardOp = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const cardY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 14 } }), [0, 1], [60, 0]);
          const hoverGlow = interpolate(Math.sin((frame - delay) * 0.04), [-1, 1], [0.05, 0.15]);

          return (
            <div
              key={f.title}
              style={{
                opacity: cardOp,
                transform: `translateY(${cardY}px)`,
                borderRadius: 28,
                background: `linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 36,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Color glow */}
              <div
                style={{
                  position: "absolute",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: f.color,
                  opacity: hoverGlow,
                  filter: "blur(60px)",
                  top: -40,
                  right: -40,
                }}
              />
              <span style={{ fontSize: 52, marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", margin: "8px 0 0" }}>{f.desc}</p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
