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
    <Card>
      <CardHeader
        title="Purchase payments"
        description={`${formatRupiah(summary.totalValue)} in purchase prices. Additional costs are not included.`}
      />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-surface-3"
            role="img"
            aria-label={`${Math.round(paidPercent)}% of purchase prices paid`}
          >
            <div className="h-full bg-success" style={{ width: `${paidPercent}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
            <p className="text-ink-2">
              <span className="tabular font-medium text-ink">{formatRupiah(summary.spent)}</span> paid
            </p>
            <p className="text-ink-2">
              <span className="tabular font-medium text-ink">{formatRupiah(summary.toPay)}</span> to pay
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
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-2/60"
                >
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dot)} />
                  <span className="flex-1 font-medium text-ink">
                    {PAYMENT_STATUS_LABEL[status]}
                    <span className="font-normal text-ink-3"> · {pluralize(row.count, "purchase")}</span>
                  </span>
                  <span className="tabular text-right text-ink-2">
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
