/**
 * Ambient backdrop for the public hero.
 *
 * Purely decorative: a faint grid that fades out toward the edges, a soft
 * coral glow behind the headline, and a bottom fade into the page canvas so
 * the preview reads as part of one continuous surface. All layers are
 * `aria-hidden` and never intercept pointer events.
 */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Faint structural grid, masked so it dissolves before the edges. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 78%)",
          opacity: 0.6,
        }}
      />

      {/* Restrained coral ambient light behind the headline. */}
      <div
        className="absolute inset-x-0 -top-24 h-[520px]"
        style={{
          backgroundImage:
            "radial-gradient(52% 60% at 50% 30%, var(--color-accent-soft), transparent 72%)",
        }}
      />

      {/* Bottom fade into the canvas for a calm transition to the preview. */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent, var(--color-canvas))",
        }}
      />
    </div>
  );
}
