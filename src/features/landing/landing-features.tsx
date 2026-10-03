import { Radar, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import { Container } from "./container";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ShoppingBag,
    title: "Track purchases",
    description: "Keep Group Order and Direct Seller purchases organized.",
  },
  {
    icon: Wallet,
    title: "Stay on top of payments",
    description: "See what you've paid and what remains.",
  },
  {
    icon: Radar,
    title: "Know what's happening",
    description: "Follow tracking updates and identify purchases that need attention.",
  },
];

/** Three centered benefit cards. */
export function LandingFeatures() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-surface/75 px-6 py-8 text-center"
            >
              <span className="grid size-[54px] place-items-center rounded-[15px] bg-accent-soft text-accent">
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h3>
              <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-ink-2">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
