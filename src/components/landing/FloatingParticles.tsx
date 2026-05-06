// Removed canvas animation for performance — replaced with pure CSS dots
export function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            width: i % 2 === 0 ? 3 : 2,
            height: i % 2 === 0 ? 3 : 2,
            background: i % 2 === 0
              ? "oklch(0.78 0.18 220 / 0.25)"
              : "oklch(0.65 0.25 295 / 0.2)",
          }}
        />
      ))}
    </div>
  );
}