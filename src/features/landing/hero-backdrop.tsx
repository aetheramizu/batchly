/**
 * Decorative ambient shapes for the public hero.
 *
 * Two large, soft coral orbs sit behind the headline and preview to add warmth
 * and depth without competing with the content. The layer is clipped to the
 * hero so the orbs never introduce horizontal overflow.
 */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -right-[120px] top-[190px] size-[420px] rounded-full sm:size-[560px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 45% 40%, var(--color-accent-glow), transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute -left-[180px] top-[330px] size-[360px] rounded-full sm:size-[450px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 45% 40%, var(--color-accent-glow), transparent 70%)",
          opacity: 0.45,
        }}
      />
    </div>
  );
}
