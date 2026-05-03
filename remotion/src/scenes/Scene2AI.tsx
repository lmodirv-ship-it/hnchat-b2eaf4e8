// Scene 2: AI Chat Feature
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { interFont } from "../fonts";

const chatMessages = [
  { role: "user", text: "Explain quantum computing in simple terms", delay: 10 },
  { role: "ai", text: "Quantum computing uses qubits that can be 0 and 1 simultaneously, enabling parallel processing of complex problems exponentially faster than classical computers.", delay: 40 },
  { role: "user", text: "Write me a Python function for sorting", delay: 80 },
  { role: "ai", text: "def quick_sort(arr):\n  if len(arr) <= 1: return arr\n  pivot = arr[0]\n  return quick_sort([x for x in arr[1:] if x < pivot]) + [pivot] + quick_sort([x for x in arr[1:] if x >= pivot])", delay: 100 },
];

export const Scene2AI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleX = interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [-100, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: interFont, padding: 80 }}>
      {/* Left side - Title & description */}
      <div style={{ position: "absolute", left: 80, top: 80, width: 700 }}>
        <div style={{ opacity: titleOp, transform: `translateX(${titleX}px)` }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "10px 24px", borderRadius: 30,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 28 }}>🤖</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#818cf8" }}>AI POWERED</span>
          </div>
          <h2 style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1.1, margin: 0 }}>
            Advanced{" "}
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              AI Chat
            </span>
          </h2>
          <p style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 20, lineHeight: 1.6 }}>
            Chat with the most powerful AI models. Get instant answers, write code, translate languages, and create content — all in one conversation.
          </p>

          {/* Feature pills */}
          {["GPT-5", "Gemini 2.5", "Code Generation", "Translation"].map((f, i) => {
            const pillOp = interpolate(frame, [40 + i * 8, 55 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pillScale = spring({ frame: frame - (40 + i * 8), fps, config: { damping: 14 } });
            return (
              <span
                key={f}
                style={{
                  display: "inline-block",
                  margin: "8px 8px 0 0",
                  padding: "8px 20px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: pillOp,
                  transform: `scale(${pillScale})`,
                }}
              >
                {f}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right side - Chat mockup */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 100,
          width: 820,
          height: 800,
          borderRadius: 32,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}
      >
        {/* Chat header */}
        <div style={{
          padding: "20px 30px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 20, fontWeight: 900 }}>AI</span>
          </div>
          <div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>hnChat AI Assistant</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {chatMessages.map((msg, i) => {
            const msgOp = interpolate(frame, [msg.delay, msg.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const msgY = interpolate(spring({ frame: frame - msg.delay, fps, config: { damping: 18 } }), [0, 1], [30, 0]);
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                style={{
                  opacity: msgOp,
                  transform: `translateY(${msgY}px)`,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isUser
                      ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isUser ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 16,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    fontFamily: msg.role === "ai" && i === 3 ? "monospace" : interFont,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
