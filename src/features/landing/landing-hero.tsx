import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";
import { HeroBackdrop } from "./hero-backdrop";
import { ProductPreview } from "./product-preview";

/** Public hero: editorial overline, headline, actions, product preview. */
export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24">
      <HeroBackdrop />

      <Container className="flex flex-col items-center text-center">
        <p className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-ink-3 uppercase">
          <span className="h-px w-6 bg-accent" aria-hidden="true" />
          Group Orders &amp; Direct Sellers
        </p>

        <h1 className="mt-6 font-display text-[42px] leading-[1.0] font-bold tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[68px]">
          Your collection,
          <br />
          <span className="text-accent">organized.</span>
        </h1>

        <p className="mt-5 max-w-[570px] text-pretty text-[15px] leading-relaxed text-ink-2 sm:text-base">
          Keep track of your Group Orders, Direct Seller purchases, payments, and
          deliveries—all in one place.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink
            href="/signup"
            size="md"
            className="landing-action landing-action-accent group w-full gap-3 px-5 sm:w-auto"
          >
            Get Started
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </ButtonLink>
          <ButtonLink
            href="/login"
            variant="secondary"
            size="md"
            className="landing-action w-full px-5 sm:w-auto"
          >
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
