import { Container } from "./container";

const STEPS = [
  "Add your purchase.",
  "Track its payment and status.",
  "Keep everything organized until it arrives.",
];

/** Three-step explanation of how Batchly is used. */
export function LandingHowItWorks() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-[28px]">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6"
            >
              <span className="tabular grid size-8 place-items-center rounded-full bg-surface-2 font-display text-sm font-bold text-ink">
                {index + 1}
              </span>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
