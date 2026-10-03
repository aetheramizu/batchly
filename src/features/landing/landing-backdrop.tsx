/**
 * Page-level ambient backdrop for the public landing page.
 *
 * A fixed, very subtle grid that fades out toward the bottom of the viewport.
 * Purely decorative: `aria-hidden`, never interactive, and painted behind the
 * page content via `-z-10` inside the landing page's isolated stacking context.
 */
export function LandingBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, #000, transparent 78%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 78%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
