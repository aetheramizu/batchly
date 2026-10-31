import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/lib/domain";
import { formatRupiah, pluralize } from "@/lib/format";
import type { PurchaseFinance } from "./summary";

const ROWS: { status: PaymentStatus; dot: string; amountLabel: string }[] = [
  { status: "UNPAID", dot: "bg-danger", amountLabel: "left" },
  { status: "PARTIAL", dot: "bg-warning", amountLabel: "left" },
  { status: "PAID", dot: "bg-success", amountLabel: "paid" },
];

/** Purchase payments only — additional costs are shown separately (FIN-03). */
export function PaymentBreakdownCard({ summary }: { summary: PurchaseFinance }) {
  const paidPercent = summary.totalValue > 0 ? (summary.spent / summary.totalValue) * 100 : 0;

  return (
    <Card id="purchase-payments" className="scroll-mt-20">
      <CardHeader
        title="Purchase payments"
        description="Progress on purchase prices. Excludes additional costs."
        action={
          <span className="tabular rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">
            {formatRupiah(summary.totalValue)} total
          </span>
        }
      />
      <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        <div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-surface-3"
            role="img"
            aria-label={`${Math.round(paidPercent)}% of purchase prices paid`}
          >
            <div
              className="h-full bg-success transition-[width] duration-300"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <p className="text-ink-2">
              <span className="tabular font-semibold text-ink">{formatRupiah(summary.spent)}</span>{" "}
              paid ({Math.round(paidPercent)}%)
            </p>
            <p className="text-ink-2">
              <span className="tabular font-semibold text-ink">{formatRupiah(summary.toPay)}</span>{" "}
              to pay
            </p>
          </div>
        </div>

        <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
          {ROWS.map(({ status, dot, amountLabel }) => {
            const row = summary.byPayment[status];
            return (
              <li key={status}>
                <Link
                  href={`/purchases?payment=${status}`}
                  className="flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm transition-colors hover:bg-surface-2/60 focus-visible:-outline-offset-2"
                >
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dot)} />
                  <span className="min-w-0 flex-1 font-medium text-ink truncate">
                    {PAYMENT_STATUS_LABEL[status]}
                    <span className="font-normal text-ink-3"> · {pluralize(row.count, "purchase")}</span>
                  </span>
                  <span className="tabular shrink-0 text-right text-ink-2">
                    {formatRupiah(row.amount)} <span className="text-ink-3">{amountLabel}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
