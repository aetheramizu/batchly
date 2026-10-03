import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "./container";

/** Public top bar: brand on the left, account actions on the right. */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Batchly home" className="inline-flex min-h-11 items-center">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2" aria-label="Account">
          <ButtonLink href="/login" variant="secondary">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup">Get Started</ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
