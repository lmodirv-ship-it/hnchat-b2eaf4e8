// Scene 4: Social Proof & Stats
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { interFont } from "../fonts";

const stats = [
  { value: "10K+", label: "Active Users", icon: "👥", color: "#6366f1" },
  { value: "50K+", label: "AI Conversations Daily", icon: "🤖", color: "#06b6d4" },
  { value: "1M+", label: "Messages Sent", icon: "💬", color: "#a855f7" },
  { value: "99.9%", label: "Uptime", icon: "⚡", color: "#22c55e" },
];

const languages = ["English", "العربية", "Français", "Español", "Deutsch", "Türkçe", "Português", "中文", "Русский"];

export const Scene4Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: interFont }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginTop: 80, opacity: titleOp }}>
        <h2 style={{ fontSize: 68, fontWeight: 900, color: "white", margin: 0 }}>
          Trusted{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Worldwide
          </span>
        </h2>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 70, padding: "0 80px" }}>
        {stats.map((s, i) => {
          const delay = 15 + i * 15;
          const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });

          // Animated counter
          const counterProgress = interpolate(frame, [delay, delay + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const numericVal = parseInt(s.value.replace(/[^0-9]/g, "")) || 0;
          const displayNum = Math.round(numericVal * counterProgress);
          const suffix = s.value.replace(/[0-9]/g, "");
          const displayValue = s.value.includes(".")
            ? interpolate(counterProgress, [0, 1], [0, 99.9]).toFixed(1) + "%"
            : displayNum + suffix;

          return (
            <div
              key={s.label}
              style={{
                opacity: op,
                transform: `scale(${scale})`,
                width: 380,
                padding: "50px 30px",
                borderRadius: 28,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", width: 150, height: 150, borderRadius: "50%",
                background: s.color, opacity: 0.08, filter: "blur(40px)", top: -30, left: "50%", transform: "translateX(-50%)",
              }} />
              <span style={{ fontSize: 48 }}>{s.icon}</span>
              <div style={{ fontSize: 56, fontWeight: 900, color: "white", marginTop: 12 }}>{displayValue}</div>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Languages strip */}
      <div style={{ textAlign: "center", marginTop: 70 }}>
        <div style={{
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>🌍 Available in 9 languages</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {languages.map((lang, i) => {
              const langOp = interpolate(frame, [90 + i * 5, 100 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span
                  key={lang}
                  style={{
                    opacity: langOp,
                    padding: "8px 20px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {lang}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
