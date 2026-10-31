import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StaleBadge, StatusBadge } from "@/components/ui/badge";
import { COUNTRY_CODE, COUNTRY_LABEL } from "@/lib/domain";
import { pluralize } from "@/lib/format";
import type { BatchView } from "./queries";

/**
 * Simplified Group Order batch card (DESIGN_SYSTEM §19).
 * Mobile-first: compact, wrap long names, clear tap target.
 */
export function BatchRow({
  batch,
  showSource = true,
  from,
}: {
  batch: BatchView;
  showSource?: boolean;
  from?: string;
}) {
  const href = from
    ? `/batches/${batch.id}?from=${encodeURIComponent(from)}`
    : `/batches/${batch.id}`;

  const displayName = /^batch\b/i.test(batch.batch_number)
    ? batch.batch_number
    : `Batch ${batch.batch_number}`;

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/60 active:bg-surface-2 focus-visible:-outline-offset-2 sm:gap-4 sm:px-5"
      >
        <span
          aria-hidden="true"
          title={COUNTRY_LABEL[batch.country]}
          className="tabular grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-xs font-semibold text-ink-2"
        >
          {COUNTRY_CODE[batch.country]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="break-words font-medium text-ink line-clamp-2 sm:line-clamp-1">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-2 sm:text-sm">
            {showSource && <>{batch.source.name} · </>}
            <span className="text-ink-3">
              {COUNTRY_LABEL[batch.country]} · {pluralize(batch.purchaseCount, "purchase")}
            </span>
            {batch.stale && (
              <span className="font-medium text-warning sm:hidden"> · Needs update</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {batch.stale && (
            <StaleBadge days={batch.daysSinceUpdate} className="hidden sm:inline-flex" />
          )}
          <StatusBadge status={batch.status} />
          <ChevronRight
            className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </Link>
    </li>
  );
}
