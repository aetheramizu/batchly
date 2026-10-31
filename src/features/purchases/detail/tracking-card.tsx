"use client";

import { Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StaleBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/surface";
import { TrackingRail } from "@/components/ui/tracking-rail";
import type { TrackingStatus } from "@/lib/domain";
import { formatBatchName, formatDate, formatDaysAgo, pluralize } from "@/lib/format";
import { updateBatchStatus } from "@/features/batches/actions";
import { StatusDialog } from "@/features/tracking/status-dialog";
import { updatePurchaseTracking } from "../actions";

/**
 * Group Order: status belongs to the batch — updating here updates the batch.
 * Direct Seller: status belongs to this purchase only (PRD §22).
 */
export function TrackingCard({
  purchaseId,
  status,
  lastUpdatedAt,
  daysSinceUpdate,
  stale,
  batch,
}: {
  purchaseId: string;
  status: TrackingStatus;
  lastUpdatedAt: string;
  daysSinceUpdate: number;
  stale: boolean;
  batch: { id: string; number: string; purchaseCount: number } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        title="Tracking"
        description={
          batch
            ? `Follows ${formatBatchName(batch.number)}, shared by ${pluralize(batch.purchaseCount, "purchase")}.`
            : "Tracked on this purchase only."
        }
        action={
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            {batch ? "Update batch status" : "Update status"}
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusBadge status={status} className="h-7 px-3 text-sm" />
          <p className="text-sm text-ink-2">
            Updated {formatDaysAgo(daysSinceUpdate)}
            <span className="text-ink-3"> · {formatDate(lastUpdatedAt)}</span>
          </p>
          {stale && <StaleBadge days={daysSinceUpdate} />}
        </div>
        <TrackingRail status={status} />

        {batch && (
          <Link
            href={`/batches/${batch.id}?from=${encodeURIComponent(`purchase:${purchaseId}`)}`}
            className="flex items-center gap-3 rounded-[var(--radius-control)] bg-surface-2 px-3.5 py-3 text-sm transition-colors hover:bg-surface-3"
          >
            <Layers className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span className="min-w-0 flex-1 break-words">
              <span className="font-medium">{formatBatchName(batch.number)}</span>
              <span className="text-ink-3"> · {pluralize(batch.purchaseCount, "purchase")}</span>
            </span>
            <span className="shrink-0 font-medium text-accent-ink">View batch</span>
          </Link>
        )}
      </div>

      <StatusDialog
        key={status}
        open={open}
        onClose={() => setOpen(false)}
        current={status}
        title={batch ? `Update ${formatBatchName(batch.number)}` : "Update tracking"}
        description={
          batch
            ? `All ${pluralize(batch.purchaseCount, "purchase")} in this batch will show the new status.`
            : "Only this purchase changes."
        }
        successMessage={batch ? "Batch updated" : "Tracking updated"}
        onSave={(next) =>
          batch ? updateBatchStatus(batch.id, next) : updatePurchaseTracking(purchaseId, next)
        }
      />
    </Card>
  );
}
