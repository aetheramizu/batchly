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
        <div className="border-t border-line pt-12 sm:pt-16">
          <p className="flex items-center gap-3 text-[13px] font-medium tracking-[0.16em] text-ink-3 uppercase">
            <span className="h-px w-6 bg-accent" aria-hidden="true" />
            How it works
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[0_1px_2px_rgb(24_24_27_/_0.04)]"
              >
                <span className="tabular grid size-9 place-items-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent-ink">
                  {index + 1}
                </span>
                <p className="mt-5 text-[15px] leading-relaxed text-ink-2">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
