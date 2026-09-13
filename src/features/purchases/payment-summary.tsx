import { PaymentBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { paymentStatus, remainingAmount } from "@/lib/domain";
import { formatRupiah } from "@/lib/format";

/**
 * Live payment preview (UX_SPEC §21, §26). Remaining and status are always
 * derived, never typed by the user.
 */
export function PaymentSummary({
  total,
  paid,
  totalLabel = "Price",
  paidLabel = "Paid",
  className,
}: {
  total: number | null;
  paid: number | null;
  totalLabel?: string;
  paidLabel?: string;
  className?: string;
}) {
  const hasTotal = total !== null && total >= 0;
  const safePaid = paid ?? 0;
  const overpaid = hasTotal && safePaid > total;
  const status = hasTotal && !overpaid ? paymentStatus(total, safePaid) : null;
  const remaining = hasTotal && !overpaid ? remainingAmount(total, safePaid) : null;
  const percent = hasTotal && total > 0 ? Math.min((safePaid / total) * 100, 100) : 0;

  return (
    <div
      aria-live="polite"
      className={cn("rounded-[var(--radius-control)] bg-surface-2 px-4 py-3", className)}
    >
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-ink-3">{totalLabel}</dt>
          <dd className="tabular mt-0.5 font-medium">{hasTotal ? formatRupiah(total) : "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-3">{paidLabel}</dt>
          <dd className="tabular mt-0.5 font-medium">{formatRupiah(safePaid)}</dd>
        </div>
        <div>
          <dt className="text-ink-3">Remaining</dt>
          <dd className="tabular mt-0.5 font-medium">
            {remaining === null ? "—" : formatRupiah(remaining)}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              status === "PAID" ? "bg-success" : "bg-warning",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        {status ? (
          <PaymentBadge status={status} />
        ) : (
          <span className="text-xs text-ink-3">{overpaid ? "More than the price" : "Enter a price"}</span>
        )}
      </div>
    </div>
  );
}
