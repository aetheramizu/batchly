import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex h-9 w-fit items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}
