import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StaleBadge, StatusBadge } from "@/components/ui/badge";
import { COUNTRY_CODE, COUNTRY_LABEL } from "@/lib/domain";
import { formatDaysAgo, formatRupiah, pluralize } from "@/lib/format";
import type { BatchView } from "./queries";

/** One Group Order batch: status is the most prominent value (DESIGN_SYSTEM §19). */
export function BatchRow({ batch, showSource = true }: { batch: BatchView; showSource?: boolean }) {
  return (
    <li>
      <Link
        href={`/batches/${batch.id}`}
        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2 sm:gap-4 sm:px-5"
      >
        <span
          aria-hidden="true"
          className="tabular grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-sm font-semibold text-ink-2"
        >
          {COUNTRY_CODE[batch.country]}
        </span>

        <div className="min-w-0 flex-1">
          <p className="tabular font-medium text-ink">Batch {batch.batch_number}</p>
          <p className="truncate text-sm text-ink-2">
            {showSource && <>{batch.source.name} · </>}
            <span className="text-ink-3">
              {COUNTRY_LABEL[batch.country]} · {pluralize(batch.purchaseCount, "purchase")}
              <span className="hidden sm:inline"> · {formatRupiah(batch.totalValue)}</span>
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">
            <StatusBadge status={batch.status} />
            {batch.stale && <StaleBadge days={batch.daysSinceUpdate} />}
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <div className="flex items-center gap-1.5">
            {batch.stale && <StaleBadge days={batch.daysSinceUpdate} />}
            <StatusBadge status={batch.status} />
          </div>
          <p className="text-xs text-ink-3">Updated {formatDaysAgo(batch.daysSinceUpdate)}</p>
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
