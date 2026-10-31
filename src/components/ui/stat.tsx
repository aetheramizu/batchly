import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "default" | "warning" | "success";

const valueTone: Record<Tone, string> = {
  default: "text-ink",
  warning: "text-warning",
  success: "text-success",
};

/**
 * Compact summary value (DESIGN_SYSTEM §20, §27). Links to the detailed view
 * when `href` is set so users never have to recreate filters (UX_SPEC §5).
 */
export function Stat({
  label,
  value,
  hint,
  href,
  tone = "default",
  size = "md",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: Tone;
  size?: "md" | "lg";
  className?: string;
}) {
  const body = (
    <>
      <p className="flex items-center gap-1 text-sm text-ink-2">
        {label}
        {href && (
          <ChevronRight
            aria-hidden="true"
            className="size-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5"
          />
        )}
      </p>
      <p
        className={cn(
          "tabular mt-1 font-display leading-tight font-bold tracking-[-0.01em] break-words",
          size === "lg" ? "text-2xl sm:text-[28px]" : "text-2xl",
          valueTone[tone],
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-3 break-words">{hint}</p>}
    </>
  );

  const base = "block min-w-0 px-4 py-4 sm:px-5";
  if (!href) return <div className={cn(base, className)}>{body}</div>;
  return (
    <Link
      href={href}
      className={cn(
        base,
        "group transition-colors hover:bg-surface-2/60 active:bg-surface-2 select-none touch-manipulation focus-visible:-outline-offset-2",
        className,
      )}
    >
      {body}
    </Link>
  );
}
