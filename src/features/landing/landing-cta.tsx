import { ArrowRight, BarChart3, Check, Package } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";

/** Closing call to action with restrained decorative art. */
export function LandingCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <div className="relative isolate flex min-h-[180px] items-center justify-center overflow-hidden rounded-[var(--radius-sheet)] border border-line px-6 py-14 text-center sm:px-10">
          {/* Warm radial wash + horizontally-masked grid. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 40%, var(--color-accent-soft), var(--color-surface) 78%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "linear-gradient(90deg, #000, transparent 28%, transparent 72%, #000)",
              WebkitMaskImage:
                "linear-gradient(90deg, #000, transparent 28%, transparent 72%, #000)",
              opacity: 0.7,
            }}
          />

          {/* Left art */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[27%] lg:block"
          >
            <span className="absolute left-[6%] top-[75px] size-12 bg-accent-glow/20 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]" />
            <span className="absolute left-[25%] top-[22px] grid size-[58px] -rotate-[11deg] place-items-center rounded-[15px] border border-white bg-surface/85 text-accent shadow-[var(--shadow-float)]">
              <BarChart3 className="size-7" strokeWidth={1.8} />
            </span>
            <span className="absolute left-[48%] top-[72px] grid size-[58px] rotate-[10deg] place-items-center rounded-[15px] border border-white bg-surface/85 text-accent shadow-[var(--shadow-float)]">
              <Package className="size-7" strokeWidth={1.8} />
            </span>
          </div>

          {/* Right art */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[27%] lg:block"
          >
            <span className="absolute left-[12%] top-[30px] size-11 bg-accent-glow/20 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]" />
            <span className="absolute right-[6%] top-[37px] flex rotate-[8deg] items-center gap-3 rounded-[13px] bg-surface/85 px-4 py-3 shadow-[var(--shadow-float)]">
              <span className="grid size-7 place-items-center rounded-full bg-success text-white">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <span className="text-left text-xs leading-tight text-ink-2">
                Everything
                <br />
                in one place
              </span>
            </span>
          </div>

          {/* Copy */}
          <div className="relative">
            <h2 className="mx-auto max-w-xl font-display text-2xl font-bold tracking-[-0.02em] text-balance text-ink sm:text-[32px]">
              Ready to organize your collection?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-2">
              Start tracking your purchases, payments, and deliveries today.
            </p>
            <ButtonLink
              href="/signup"
              size="md"
              className="landing-action landing-action-accent group mt-7 gap-3 px-5"
            >
              Get Started
              <ArrowRight
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
