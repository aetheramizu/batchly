import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Framed preview of the real Batchly dashboard.
 *
 * The screenshot is a static asset (public/batchly-dashboard.png) so the
 * authenticated dashboard implementation stays untouched.
 */
export function ProductPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative isolate", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 50% 0%, var(--color-accent-soft), transparent 75%)",
        }}
      />

      <div className="overflow-hidden rounded-[var(--radius-sheet)] border border-line bg-surface shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>

        <Image
          src="/batchly-dashboard.png"
          alt="The Batchly dashboard showing spending totals, where purchases are, and which ones need attention."
          width={1279}
          height={719}
          priority
          sizes="(min-width: 1024px) 1088px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
