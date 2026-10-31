import { PackageOpen, Plus } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaleBadge, StatusBadge } from "@/components/ui/badge";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, DetailRow, EmptyState } from "@/components/ui/surface";
import { TrackingRail } from "@/components/ui/tracking-rail";
import { EditBatchButton, UpdateBatchStatusButton } from "@/features/batches/batch-controls";
import { getBatchWithPurchases } from "@/features/batches/queries";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import { requireUser } from "@/lib/auth";
import { COUNTRY_LABEL, SOURCE_TYPE_LABEL } from "@/lib/domain";
import { formatBatchName, formatDate, formatDaysAgo, formatRupiah, pluralize } from "@/lib/format";
import { isUuid } from "@/lib/validation";

export const metadata: Metadata = { title: "Batch" };

/** Where "Back" goes, preserving navigation context (UX_SPEC §54). */
function backTarget(from: string | undefined, isDelivered?: boolean) {
  if (from?.startsWith("purchase:") && isUuid(from.slice(9))) {
    return { href: `/purchases/${from.slice(9)}`, label: "Back to purchase" };
  }
  if (from === "dashboard") return { href: "/dashboard", label: "Dashboard" };
  if (from === "archived" || (!from && isDelivered)) {
    return { href: "/batches?view=archived", label: "Archived batches" };
  }
  return { href: "/batches", label: "Batches" };
}

export default async function BatchDetailPage({
  params,
  searchParams,
}: PageProps<"/batches/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();

  const { supabase } = await requireUser();
  const result = await getBatchWithPurchases(supabase, id);
  if (!result) notFound();

  const { batch, purchases } = result;
  const isDelivered = batch.status === "DELIVERED";
  const back = backTarget(
    typeof query.from === "string" ? query.from : undefined,
    isDelivered,
  );
  const addHref = `/purchases/new?batch=${batch.id}`;

  return (
    <div className="flex flex-col gap-5">
      <BackLink href={back.href}>{back.label}</BackLink>

      {/* Summary — status is the most prominent value */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-ink-2">
              {batch.source.name}
              <span className="text-ink-3">
                {" "}
                · {SOURCE_TYPE_LABEL[batch.source.type]} · {batch.source.platform}
              </span>
            </p>
            <h1 className="mt-1 font-display text-2xl leading-tight font-bold tracking-[-0.02em] break-words sm:text-[28px]">
              {formatBatchName(batch.batch_number)}
            </h1>
            <p className="mt-1 text-[15px] text-ink-2">
              {COUNTRY_LABEL[batch.country]}
              {batch.batch_date && <> · {formatDate(batch.batch_date)}</>}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <EditBatchButton
              batchId={batch.id}
              batchNumber={batch.batch_number}
              batchDate={batch.batch_date}
              notes={batch.notes}
              className="w-full sm:w-auto"
            />
            <UpdateBatchStatusButton
              batchId={batch.id}
              batchNumber={batch.batch_number}
              status={batch.status}
              purchaseCount={batch.purchaseCount}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={batch.status} className="h-7 px-3 text-sm" />
            <p className="text-sm text-ink-2">
              Updated {formatDaysAgo(batch.daysSinceUpdate)}
              <span className="text-ink-3"> · {formatDate(batch.last_updated_at)}</span>
            </p>
            {batch.stale && <StaleBadge days={batch.daysSinceUpdate} />}
          </div>
          <TrackingRail status={batch.status} />
          {batch.stale && (
            <p className="text-sm text-ink-3">
              No tracking update has been recorded in the last {batch.daysSinceUpdate} days.
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader
            title="Purchases"
            description="Every purchase here shows this batch's status."
            action={
              purchases.length > 0 && (
                <ButtonLink href={addHref} variant="secondary" size="sm">
                  <Plus aria-hidden="true" />
                  Add to batch
                </ButtonLink>
              )
            }
          />
          {purchases.length === 0 ? (
            <EmptyState
              icon={<PackageOpen />}
              title="No purchases in this batch"
              description="Add a purchase and it will follow this batch's tracking status."
              action={<ButtonLink href={addHref}>Add Purchase</ButtonLink>}
            />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {purchases.map((purchase) => (
                <PurchaseRow
                  key={purchase.id}
                  purchase={purchase}
                  from={`batch:${batch.id}`}
                  hideContext
                  showStale={false}
                />
              ))}
            </ul>
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader title="Summary" />
            <dl className="divide-y divide-line px-5 pb-3">
              <DetailRow label="Purchases">{pluralize(batch.purchaseCount, "purchase")}</DetailRow>
              <DetailRow label="Total purchase value">
                <span className="tabular">{formatRupiah(batch.totalValue)}</span>
              </DetailRow>
              <DetailRow label="Source">{batch.source.name}</DetailRow>
              <DetailRow label="Country">{COUNTRY_LABEL[batch.country]}</DetailRow>
              <DetailRow label="Batch date">{formatDate(batch.batch_date)}</DetailRow>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <div className="px-5 pb-5">
              {batch.notes ? (
                <p className="text-sm leading-relaxed whitespace-pre-line text-ink-2">
                  {batch.notes}
                </p>
              ) : (
                <p className="text-sm text-ink-3">No notes.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
