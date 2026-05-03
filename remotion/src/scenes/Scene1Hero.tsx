// Scene 1: Hero intro - "The Global #1 Super App"
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { interFont } from "../fonts";

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo reveal
  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Title lines stagger
  const line1Y = interpolate(spring({ frame: frame - 15, fps, config: { damping: 18 } }), [0, 1], [80, 0]);
  const line1Op = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const line2Y = interpolate(spring({ frame: frame - 30, fps, config: { damping: 18 } }), [0, 1], [80, 0]);
  const line2Op = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subOp = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(spring({ frame: frame - 50, fps, config: { damping: 20 } }), [0, 1], [40, 0]);

  // Badge
  const badgeOp = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 70, fps, config: { damping: 12 } });

  // Floating glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 0.6]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: interFont }}>
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,${glowPulse}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* HN Logo mark */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(99,102,241,0.5)",
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900, color: "white", letterSpacing: -2 }}>HN</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ opacity: line1Op, transform: `translateY(${line1Y}px)` }}>
          <span style={{ fontSize: 82, fontWeight: 900, color: "white", letterSpacing: -3 }}>
            Welcome to{" "}
          </span>
        </div>
        <div style={{ opacity: line2Op, transform: `translateY(${line2Y}px)` }}>
          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: -4,
              background: "linear-gradient(135deg, #6366f1, #06b6d4, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            hnChat
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 24 }}>
        <p style={{ fontSize: 32, color: "rgba(255,255,255,0.7)", fontWeight: 400, textAlign: "center", maxWidth: 800 }}>
          Your smart companion for work & communication
        </p>
      </div>

      {/* Badge */}
      <div
        style={{
          opacity: badgeOp,
          transform: `scale(${badgeScale})`,
          marginTop: 40,
          padding: "14px 40px",
          borderRadius: 50,
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: "#06b6d4", letterSpacing: 2, textTransform: "uppercase" }}>
          🌍 The Global #1 Super App
        </span>
      </div>
    </AbsoluteFill>
  );
};
