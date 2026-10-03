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
        className="pointer-events-none absolute inset-x-6 -top-12 bottom-2 -z-10 rounded-[var(--radius-sheet)]"
        style={{
          backgroundImage:
            "radial-gradient(58% 60% at 50% 0%, var(--color-accent-soft), transparent 72%)",
        }}
      />

      <div className="overflow-hidden rounded-[var(--radius-sheet)] border border-line bg-surface shadow-[var(--shadow-preview)]">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-line-strong" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-line-strong" aria-hidden="true" />
        </div>

        <Image
          src="/batchly-dashboard.png"
          alt="The Batchly dashboard showing spending totals, where purchases are, and which ones need attention."
          width={1264}
          height={719}
          priority
          sizes="(min-width: 1024px) 1088px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
