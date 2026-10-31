import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatRupiah, formatSignedRupiah, pluralize } from "@/lib/format";
import type { CostFinance, OsFinance, PurchaseFinance } from "./summary";

export function FinanceSummaryGrid({
  money,
  costSummary,
  os,
  archivedCount,
}: {
  money: PurchaseFinance;
  costSummary: CostFinance;
  os: OsFinance;
  archivedCount: number;
}) {
  return (
    <section aria-labelledby="finance-summary-heading">
      <h2 id="finance-summary-heading" className="sr-only">
        Financial summary
      </h2>

      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
        {/* 1. Total spent (Primary metric) */}
        <Link
          href="#purchase-payments"
          className="group block min-w-0 bg-surface p-3.5 sm:p-4 lg:p-5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2"
        >
          <div className="flex items-center justify-between gap-1.5 text-xs">
            <span className="font-semibold text-ink truncate">Total spent</span>
            <span className="flex items-center gap-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink uppercase tracking-wide">
                Main
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </div>
          <p className="tabular mt-1 font-display text-xl min-[400px]:text-2xl sm:text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink whitespace-nowrap truncate">
            {formatRupiah(money.spent)}
          </p>
          <p
            className="mt-1 text-[11px] sm:text-xs text-ink-3 truncate"
            title="Paid toward purchase prices"
          >
            Paid toward purchase prices
          </p>
        </Link>

        {/* 2. To pay (Outstanding balance) */}
        <Link
          href="#still-to-pay"
          className="group block min-w-0 bg-surface p-3.5 sm:p-4 lg:p-5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2"
        >
          <div className="flex items-center justify-between gap-1 text-xs text-ink-2">
            <span className="font-medium truncate">To pay</span>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 text-ink-3 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p
            className={cn(
              "tabular mt-1 font-display text-xl min-[400px]:text-2xl sm:text-[26px] font-bold leading-tight tracking-[-0.01em] whitespace-nowrap truncate",
              money.toPay > 0 ? "text-warning" : "text-ink",
            )}
          >
            {formatRupiah(money.toPay)}
          </p>
          <p
            className="mt-1 text-[11px] sm:text-xs text-ink-3 truncate"
            title={
              money.outstandingCount > 0
                ? `Across ${pluralize(money.outstandingCount, "purchase")}`
                : "Everything is paid"
            }
          >
            {money.outstandingCount > 0
              ? `Across ${pluralize(money.outstandingCount, "purchase")}`
              : "Everything is paid"}
          </p>
        </Link>

        {/* 3. Additional costs */}
        <Link
          href="#costs"
          className="group block min-w-0 bg-surface p-3.5 sm:p-4 lg:p-5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2"
        >
          <div className="flex items-center justify-between gap-1 text-xs text-ink-2">
            <span className="font-medium truncate">Additional costs</span>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 text-ink-3 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="tabular mt-1 font-display text-lg min-[400px]:text-xl sm:text-2xl font-bold leading-tight tracking-[-0.01em] text-ink whitespace-nowrap truncate">
            {formatRupiah(costSummary.total)}
          </p>
          <p
            className="mt-1 text-[11px] sm:text-xs text-ink-3 truncate"
            title={
              costSummary.unpaid > 0
                ? `${formatRupiah(costSummary.unpaid)} unpaid`
                : "All recorded costs paid"
            }
          >
            {costSummary.unpaid > 0
              ? `${formatRupiah(costSummary.unpaid)} unpaid`
              : "All recorded costs paid"}
          </p>
        </Link>

        {/* 4. OS Difference */}
        <Link
          href="#os"
          className="group block min-w-0 bg-surface p-3.5 sm:p-4 lg:p-5 transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2"
        >
          <div className="flex items-center justify-between gap-1 text-xs text-ink-2">
            <span className="font-medium truncate">OS Difference</span>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 text-ink-3 shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <p className="tabular mt-1 font-display text-lg min-[400px]:text-xl sm:text-2xl font-bold leading-tight tracking-[-0.01em] text-ink whitespace-nowrap truncate">
            {formatSignedRupiah(os.difference)}
          </p>
          <p
            className="mt-1 text-[11px] sm:text-xs text-ink-3 truncate"
            title={
              os.givenCount > 0
                ? `From ${pluralize(os.givenCount, "Given OS purchase")}`
                : "No Given OS yet"
            }
          >
            {os.givenCount > 0
              ? `From ${pluralize(os.givenCount, "Given OS purchase")}`
              : "No Given OS yet"}
          </p>
        </Link>
      </div>

      {archivedCount > 0 && (
        <p className="mt-2 text-xs text-ink-3">
          Excludes {pluralize(archivedCount, "archived purchase")}.{" "}
          <Link href="/purchases?view=archived" className="text-accent-ink hover:underline">
            View archived
          </Link>
        </p>
      )}
    </section>
  );
}
