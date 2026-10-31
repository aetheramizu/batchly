import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-[44px] sm:min-h-9 h-11 sm:h-9 w-fit items-center gap-1.5 rounded-md px-2.5 sm:px-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink active:bg-surface-3 select-none touch-manipulation transition-colors"
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </Link>
  );
}
