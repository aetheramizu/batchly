import Link from "next/link";
import { PaymentBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/surface";
import { osDifference, paymentStatus, remainingAmount } from "@/lib/domain";
import { formatRupiah, formatSignedRupiah, pluralize } from "@/lib/format";
import type { PurchaseView } from "../purchases/queries";
import type { OsFinance } from "./summary";

/**
 * OS history and OS Difference (DATA_MODEL §21). The label is always
 * "OS Difference", never profit, and the sign is shown explicitly.
 */
export function OsSummaryCard({
  summary,
  given,
}: {
  summary: OsFinance;
  given: PurchaseView[];
}) {
  const empty = summary.givenCount === 0 && summary.takenCount === 0;

  return (
    <Card id="os" className="scroll-mt-20">
      <CardHeader
        title="OS"
        description="OS Difference = OS price − original price. Additional costs are not included."
      />
      <div className="flex flex-col gap-4 px-5 pb-5">
        {empty ? (
          <p className="text-sm text-ink-3">
            No OS yet. Give OS from a purchase&apos;s detail page, or choose Take OS when adding a purchase.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-control)] bg-surface-2 px-4 py-3 text-sm">
              <div>
                <dt className="text-ink-3">Received</dt>
                <dd className="tabular mt-0.5 font-semibold">{formatRupiah(summary.osReceived)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">To receive</dt>
                <dd
                  className={`tabular mt-0.5 font-semibold ${summary.osToReceive > 0 ? "text-warning" : ""}`}
                >
                  {formatRupiah(summary.osToReceive)}
                </dd>
              </div>
            </dl>

            {given.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink">
                  Given OS <span className="font-normal text-ink-3">· {given.length}</span>
                </h3>
                <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {given.map((p) => {
                    const osPrice = p.os_price ?? 0;
                    const received = p.os_paid_amount ?? 0;
                    const status = paymentStatus(osPrice, received);
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/purchases/${p.id}?from=finance`}
                          className="flex flex-col gap-1.5 px-4 py-3 text-sm transition-colors hover:bg-surface-2/60"
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-medium text-ink">{p.item_name}</span>
                            <span className="tabular shrink-0 font-semibold">
                              {formatSignedRupiah(osDifference(osPrice, p.price))}
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center justify-between gap-2 text-ink-3">
                            <span className="tabular">
                              {formatRupiah(p.price)} → {formatRupiah(osPrice)}
                            </span>
                            <PaymentBadge
                              status={status}
                              remaining={remainingAmount(osPrice, received)}
                            />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 flex items-baseline justify-between gap-3 px-1 text-sm">
                  <span className="text-ink-2">Total OS Difference</span>
                  <span className="tabular font-semibold text-ink">
                    {formatSignedRupiah(summary.difference)}
                  </span>
                </div>
              </div>
            )}

            {summary.takenCount > 0 && (
              <Link
                href="/purchases?tab=os"
                className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line px-4 py-3 text-sm transition-colors hover:bg-surface-2/60"
              >
                <span>
                  <span className="block font-medium text-ink">
                    Taken OS <span className="font-normal text-ink-3">· {pluralize(summary.takenCount, "purchase")}</span>
                  </span>
                  <span className="block text-ink-3">Already included in Total spent</span>
                </span>
                <span className="tabular shrink-0 font-medium">{formatRupiah(summary.takenSpent)} paid</span>
              </Link>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
