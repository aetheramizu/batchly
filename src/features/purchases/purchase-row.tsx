import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { OsBadge, PaymentBadge, StaleBadge, StatusBadge } from "@/components/ui/badge";
import { PurchaseThumb } from "@/components/ui/purchase-thumb";
import { COUNTRY_LABEL, SOURCE_TYPE_LABEL } from "@/lib/domain";
import { formatBatchName, formatRupiah } from "@/lib/format";
import type { PurchaseView } from "./queries";

/**
 * One purchase in a list. Priority: item → status → price/payment →
 * source/country/batch (DESIGN_SYSTEM §18). Batch is omitted for Direct Sellers.
 */
export function PurchaseRow({
  purchase,
  from,
  hideContext,
  showStale = true,
  compact = false,
}: {
  purchase: PurchaseView;
  /** Back-navigation context for Purchase Detail, e.g. "batch:<id>". */
  from?: string;
  /** Hide source/country/batch when the surrounding page already shows it. */
  hideContext?: boolean;
  showStale?: boolean;
  /** Compact presentation for dashboard: minimal metadata, no financial stats, optimized for mobile tapping */
  compact?: boolean;
}) {
  const href = from
    ? `/purchases/${purchase.id}?from=${encodeURIComponent(from)}`
    : `/purchases/${purchase.id}`;
  const osKind =
    purchase.ownership_status === "GIVEN_OS"
      ? "GIVEN"
      : purchase.purchase_origin === "TAKEN_OS"
        ? "TAKEN"
        : null;

  if (compact) {
    return (
      <li>
        <Link
          href={href}
          className="group flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60 active:bg-surface-2 focus-visible:-outline-offset-2 sm:px-5"
        >
          <PurchaseThumb src={purchase.imageSrc} alt="" size="sm" />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-sm font-medium text-ink sm:text-[15px]">
                {purchase.item_name}
              </p>
              {purchase.artist_group && (
                <span className="hidden shrink-0 truncate text-xs text-ink-3 sm:inline">
                  {purchase.artist_group}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-ink-3">
              {purchase.artist_group && (
                <span className="text-ink-2 sm:hidden">{purchase.artist_group} · </span>
              )}
              {purchase.source.name}
              {purchase.batch ? (
                <> · {formatBatchName(purchase.batch.batch_number)}</>
              ) : (
                <> · {COUNTRY_LABEL[purchase.effectiveCountry]}</>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={purchase.status} />
            {osKind && <OsBadge kind={osKind} className="hidden sm:inline-flex" />}
            <ChevronRight
              className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2 sm:items-center sm:gap-4 sm:px-5"
      >
        <PurchaseThumb src={purchase.imageSrc} alt="" size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="line-clamp-2 font-medium text-ink sm:line-clamp-1">{purchase.item_name}</p>
            {purchase.artist_group && (
              <span className="hidden shrink-0 truncate text-sm text-ink-3 sm:inline">
                {purchase.artist_group}
              </span>
            )}
          </div>
          {!hideContext && (
            <p className="relative mt-0.5 truncate text-sm text-ink-2">
              {purchase.source.name}
              <span className="text-ink-3">
                {" "}
                · {COUNTRY_LABEL[purchase.effectiveCountry]}
                {purchase.batch ? (
                  <> · {formatBatchName(purchase.batch.batch_number)}</>
                ) : (
                  <span className="sr-only">, {SOURCE_TYPE_LABEL[purchase.source.type]}</span>
                )}
              </span>
            </p>
          )}
          {hideContext && purchase.artist_group && (
            <p className="mt-0.5 truncate text-sm text-ink-3 sm:hidden">{purchase.artist_group}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={purchase.status} />
            {osKind && <OsBadge kind={osKind} />}
            {showStale && purchase.stale && <StaleBadge days={purchase.daysSinceUpdate} />}
            <span className="sm:hidden">
              <PaymentBadge status={purchase.payment} />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          <p className="tabular font-semibold text-ink">{formatRupiah(purchase.price)}</p>
          <span className="hidden sm:inline-flex">
            <PaymentBadge status={purchase.payment} />
          </span>
          {purchase.payment !== "PAID" && (
            <p className="tabular text-xs text-ink-3">{formatRupiah(purchase.remaining)} left</p>
          )}
        </div>
        <ChevronRight
          className="mt-1 hidden size-4 shrink-0 self-center text-ink-3 transition-transform group-hover:translate-x-0.5 sm:block"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
