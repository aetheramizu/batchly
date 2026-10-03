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

/** Three compact feature cards. */
export function LandingFeatures() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <ul className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5 sm:p-6"
            >
              <span className="grid size-10 place-items-center rounded-[var(--radius-control)] bg-accent-soft text-accent-ink">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
