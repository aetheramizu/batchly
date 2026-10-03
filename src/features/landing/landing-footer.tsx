import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "./container";

/** Minimal public footer. */
export function LandingFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <Logo className="text-lg" />
        <p className="text-sm text-ink-3">
          A personal purchase tracker for collectors.
        </p>
        <nav className="flex items-center gap-1 text-sm text-ink-2" aria-label="Footer">
          <Link href="/login" className="inline-flex min-h-11 items-center px-3 hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className="inline-flex min-h-11 items-center px-3 hover:text-ink">
            Get Started
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
