import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "./container";

/** Minimal public footer. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-center justify-between gap-5 py-9 sm:flex-row">
        <Link href="/" aria-label="Batchly home" className="inline-flex items-center">
          <Logo className="text-lg" />
        </Link>

        <p className="order-3 text-sm text-ink-3 sm:order-2">
          A personal purchase tracker for collectors.
        </p>

        <nav
          className="order-2 flex items-center gap-1 text-sm text-ink-2 sm:order-3"
          aria-label="Footer"
        >
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center px-3 transition-colors duration-150 hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center px-3 transition-colors duration-150 hover:text-ink"
          >
            Get Started
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
