import type { CSSProperties } from "react";
import { Container } from "./container";
import { RevealOnScroll } from "./reveal-on-scroll";

const STEPS = [
  {
    title: "Add your purchase.",
    description: "Create a purchase from a Group Order or Direct Seller in a few clicks.",
  },
  {
    title: "Track its payment and status.",
    description: "Update payments and follow tracking progress.",
  },
  {
    title: "Keep everything organized until it arrives.",
    description: "View your purchases, batches, and deliveries in one place.",
  },
];

/**
 * Dashed connector that bridges the gutter between two steps, aligned with the
 * number row. Geometry assumes a 42px number, a 24px column gap and a 6px
 * breathing space either side — see the grid below. Rendered as a masked
 * repeating gradient so the dashes fade softly at both ends.
 */
function StepConnector() {
  const fade = "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)";
  return (
    <span
      aria-hidden="true"
      className="step-link pointer-events-none absolute top-[21px] hidden h-px sm:block"
      style={
        {
          left: "calc(50% + 27px)",
          width: "calc(100% - 30px)",
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-line-strong) 0 6px, transparent 6px 13px)",
          maskImage: fade,
          WebkitMaskImage: fade,
        } as CSSProperties
      }
    />
  );
}

/** Three-step explanation of how Batchly is used. */
export function LandingHowItWorks() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-ink-3 uppercase">
            <span className="h-px w-5 bg-accent" aria-hidden="true" />
            How it works
          </span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <h2 className="mx-auto mt-6 max-w-2xl text-center font-display text-[26px] font-bold tracking-[-0.02em] text-balance text-ink sm:text-[34px]">
          Simple, focused, and made for collectors.
        </h2>

        <RevealOnScroll>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative text-center"
                style={{ "--step-delay": `${index * 110}ms` } as CSSProperties}
              >
                <span className="step-num tabular mx-auto grid size-[42px] place-items-center rounded-full bg-accent-soft font-display text-xl font-bold text-accent">
                  {index + 1}
                </span>

                {index < STEPS.length - 1 ? <StepConnector /> : null}

                <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-ink-2">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
