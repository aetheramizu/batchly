import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";
import { ProductPreview } from "./product-preview";

/** Public hero: headline, description, primary actions, product preview. */
export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(70% 60% at 50% -10%, var(--color-accent-soft), transparent 70%)",
        }}
      />

      <Container className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          A simple home for your collection
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-[36px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-ink sm:text-[56px] lg:text-[64px]">
          Your collection, organized.
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink-2 sm:text-lg">
          Keep track of your Group Orders, Direct Seller purchases, payments, and
          deliveries—all in one place.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/signup" size="md" className="w-full sm:w-auto">
            Get Started
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/login" variant="secondary" size="md" className="w-full sm:w-auto">
            Log in
          </ButtonLink>
        </div>
      </Container>

      <Container className="mt-14 sm:mt-16">
        <ProductPreview />
      </Container>
    </section>
  );
}
