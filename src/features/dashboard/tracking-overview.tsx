import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { TRACKING_TONE } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { TRACKING_STATUSES, TRACKING_STATUS_LABEL, type TrackingStatus } from "@/lib/domain";
import { pluralize } from "@/lib/format";
import type { BatchView } from "../batches/queries";
import type { PurchaseView } from "../purchases/queries";

const BAR_TONE: Record<string, string> = {
  neutral: "bg-ink-3",
  slate: "bg-slate-500",
  info: "bg-info",
  teal: "bg-teal",
  success: "bg-success",
};

/**
 * Where purchases are, by status (UX_SPEC §4.1). Group Order counts come from
 * batches; Direct Seller counts come from the purchases themselves.
 */
export function TrackingOverview({
  purchases,
  batches,
}: {
  purchases: PurchaseView[];
  batches: BatchView[];
}) {
  const rows = TRACKING_STATUSES.map((status) => ({
    status,
    purchases: purchases.filter((p) => p.status === status).length,
    batches: batches.filter((b) => b.status === status && b.purchaseCount > 0).length,
    direct: purchases.filter((p) => p.status === status && !p.batch_id).length,
  }));
  const max = Math.max(...rows.map((r) => r.purchases), 1);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Where things are"
        description="Group Orders follow their batch. Direct Seller purchases are tracked one by one."
      />
      <ul className="flex flex-col px-2 pb-3">
        {rows.map((row) => (
          <li key={row.status}>
            <Link
              href={`/purchases?status=${row.status}`}
              className="group grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-x-3 rounded-[var(--radius-control)] px-3 py-2.5 transition-colors hover:bg-surface-2/60 active:bg-surface-2 sm:grid-cols-[10rem_1fr_auto]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {TRACKING_STATUS_LABEL[row.status]}
                </span>
                <span className="block truncate text-xs text-ink-3">
                  {breakdown(row)}
                </span>
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                <span
                  className={cn("block h-full rounded-full", barTone(row.status))}
                  style={{ width: `${(row.purchases / max) * 100}%` }}
                />
              </span>
              <span className="flex items-center gap-1">
                <span className="tabular w-8 text-right font-display text-base font-semibold text-ink">
                  {row.purchases}
                </span>
                <span className="sr-only"> {row.purchases === 1 ? "purchase" : "purchases"}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function barTone(status: TrackingStatus) {
  return BAR_TONE[TRACKING_TONE[status]] ?? "bg-ink-3";
}

function breakdown(row: { batches: number; direct: number }) {
  const parts = [];
  if (row.batches > 0) parts.push(pluralize(row.batches, "batch", "batches"));
  if (row.direct > 0) parts.push(`${row.direct} direct`);
  return parts.length > 0 ? parts.join(" · ") : "None";
}
