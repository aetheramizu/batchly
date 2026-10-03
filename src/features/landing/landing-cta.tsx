import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";

/** Closing call to action. */
export function LandingCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[var(--radius-sheet)] border border-line bg-surface px-6 py-14 text-center sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-64"
            style={{
              backgroundImage:
                "radial-gradient(50% 60% at 50% 0%, var(--color-accent-soft), transparent 72%)",
            }}
          />

          <h2 className="mx-auto max-w-xl font-display text-2xl font-bold tracking-[-0.02em] text-balance text-ink sm:text-[32px]">
            Ready to organize your collection?
          </h2>
          <ButtonLink href="/signup" size="md" className="mt-7">
            Get Started
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
