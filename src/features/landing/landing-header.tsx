import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";

/** Public top bar: brand on the left, account actions on the right. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[68px]">
        <Link href="/" aria-label="Batchly home" className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-sm font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
          >
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm" className="landing-action landing-action-accent group gap-2">
            Get Started
            <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
