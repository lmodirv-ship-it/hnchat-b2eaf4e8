// Scene 5: Privacy & Security + CTA
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { interFont } from "../fonts";

const securityFeatures = [
  { icon: "🔒", title: "End-to-End Encryption" },
  { icon: "🛡️", title: "Zero Data Sharing" },
  { icon: "🔐", title: "Advanced RLS Policies" },
  { icon: "✅", title: "GDPR Compliant" },
];

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Privacy section (first half)
  const privTitleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const shieldScale = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });

  // CTA section (second half)
  const ctaStart = 80;
  const ctaOp = interpolate(frame, [ctaStart, ctaStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - ctaStart, fps, config: { damping: 15 } });

  // Pulse for CTA
  const pulse = interpolate(Math.sin((frame - ctaStart) * 0.08), [-1, 1], [1, 1.04]);

  // URL
  const urlOp = interpolate(frame, [ctaStart + 30, ctaStart + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Credits
  const creditsOp = interpolate(frame, [ctaStart + 50, ctaStart + 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: interFont }}>
      {/* Privacy Section */}
      {frame < ctaStart + 20 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ opacity: privTitleOp, transform: `scale(${shieldScale})`, textAlign: "center" }}>
            <div style={{ fontSize: 100, marginBottom: 20 }}>🛡️</div>
            <h2 style={{ fontSize: 64, fontWeight: 900, color: "white", margin: 0 }}>
              Privacy{" "}
              <span style={{
                background: "linear-gradient(135deg, #22c55e, #06b6d4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                First
              </span>
            </h2>
            <p style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginTop: 16, maxWidth: 700 }}>
              Your data is encrypted and protected with the latest security technologies
            </p>
          </div>

          {/* Security feature pills */}
          <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
            {securityFeatures.map((f, i) => {
              const delay = 25 + i * 10;
              const pillOp = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const pillY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 14 } }), [0, 1], [30, 0]);
              return (
                <div
                  key={f.title}
                  style={{
                    opacity: pillOp,
                    transform: `translateY(${pillY}px)`,
                    padding: "16px 28px",
                    borderRadius: 20,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{f.icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 18 }}>{f.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: ctaOp,
        }}
      >
        {/* Logo */}
        <div style={{ transform: `scale(${ctaScale})` }}>
          <div style={{
            width: 100, height: 100, borderRadius: 26,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 20px 60px rgba(99,102,241,0.5)",
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: "white" }}>HN</span>
          </div>
        </div>

        <h2 style={{
          fontSize: 80,
          fontWeight: 900,
          color: "white",
          margin: "30px 0 0",
          textAlign: "center",
          transform: `scale(${pulse})`,
        }}>
          Join{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #06b6d4, #a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            hnChat
          </span>
          {" "}Today
        </h2>

        <p style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>
          The future of communication is here
        </p>

        {/* URL */}
        <div style={{
          opacity: urlOp,
          marginTop: 40,
          padding: "16px 48px",
          borderRadius: 50,
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          boxShadow: "0 16px 50px rgba(99,102,241,0.4)",
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: 1 }}>
            hn-chat.com
          </span>
        </div>

        {/* Credits */}
        <div style={{ opacity: creditsOp, marginTop: 60 }}>
          <div style={{ width: 200, height: 1, background: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            Designed by Moulay Ismail El Hassani
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
