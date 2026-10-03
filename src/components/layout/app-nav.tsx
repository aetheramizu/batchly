"use client";

import {
  Layers,
  LayoutGrid,
  Plus,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/batches", label: "Batches", icon: Layers },
  { href: "/finance", label: "Finance", icon: Wallet },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/purchases") {
      return pathname.startsWith("/purchases") && pathname !== "/purchases/new";
    }
    return pathname.startsWith(href);
  };
}

export function SidebarNav() {
  const isActive = useIsActive();
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      <Link
        href="/purchases/new"
        aria-current={pathname === "/purchases/new" ? "page" : undefined}
        className={buttonClasses({ className: "w-full" })}
      >
        <Plus aria-hidden="true" />
        Add Purchase
      </Link>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[15px] transition-colors",
                  active
                    ? "bg-surface-2 font-semibold text-ink"
                    : "text-ink-2 hover:bg-surface-2/60 hover:text-ink",
                )}
              >
                <Icon
                  className={cn("size-[18px]", active ? "text-accent" : "text-ink-3")}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const isActive = useIsActive();
  const pathname = usePathname();
  const [first, second, third, fourth] = NAV_ITEMS;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center">
        {[first, second].map((item) => (
          <BottomNavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
        <li className="flex justify-center">
          <Link
            href="/purchases/new"
            aria-label="Add Purchase"
            aria-current={pathname === "/purchases/new" ? "page" : undefined}
            className="grid size-12 place-items-center rounded-full bg-accent text-white shadow-[var(--shadow-float)] transition-transform active:scale-95"
          >
            <Plus className="size-6" aria-hidden="true" />
          </Link>
        </li>
        {[third, fourth].map((item) => (
          <BottomNavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </ul>
    </nav>
  );
}

function BottomNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
          active ? "text-ink" : "text-ink-3",
        )}
      >
        <Icon
          className={cn("size-5", active && "text-accent")}
          strokeWidth={active ? 2.25 : 2}
          aria-hidden="true"
        />
        {label}
      </Link>
    </li>
  );
}
