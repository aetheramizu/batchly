import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";

/** Closing call to action. */
export function LandingCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <div className="flex flex-col items-center rounded-[var(--radius-sheet)] border border-line bg-surface px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-[-0.02em] text-balance text-ink sm:text-[32px]">
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
