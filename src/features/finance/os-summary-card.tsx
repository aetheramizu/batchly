"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentBadge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { osDifference, paymentStatus, remainingAmount } from "@/lib/domain";
import { formatRupiah, formatSignedRupiah, pluralize } from "@/lib/format";
import type { PurchaseView } from "../purchases/queries";
import type { OsFinance } from "./summary";

const INITIAL_GIVEN_LIMIT = 3;

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
  const [expanded, setExpanded] = useState(false);
  const empty = summary.givenCount === 0 && summary.takenCount === 0;
  const visibleGiven = expanded ? given : given.slice(0, INITIAL_GIVEN_LIMIT);
  const hasMoreGiven = given.length > INITIAL_GIVEN_LIMIT;

  return (
    <Card id="os" className="scroll-mt-20">
      <CardHeader
        title="OS"
        description="OS Difference = OS price − original price. Excludes costs."
      />
      <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        {empty ? (
          <p className="text-sm text-ink-3">
            No OS yet. Give OS from a purchase&apos;s detail page, or choose Take OS when adding a purchase.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-control)] bg-surface-2 px-3 py-2.5 sm:px-4 sm:py-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-ink-3">Received</dt>
                <dd className="tabular mt-0.5 font-semibold text-xs min-[360px]:text-sm sm:text-base truncate text-ink">
                  {formatRupiah(summary.osReceived)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-ink-3">To receive</dt>
                <dd
                  className={cn(
                    "tabular mt-0.5 font-semibold text-xs min-[360px]:text-sm sm:text-base truncate",
                    summary.osToReceive > 0 ? "text-warning" : "text-ink",
                  )}
                >
                  {formatRupiah(summary.osToReceive)}
                </dd>
              </div>
            </dl>

            {given.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs sm:text-sm font-semibold text-ink">
                  Given OS <span className="font-normal text-ink-3">· {given.length}</span>
                </h3>
                <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {visibleGiven.map((p) => {
                    const osPrice = p.os_price ?? 0;
                    const received = p.os_paid_amount ?? 0;
                    const status = paymentStatus(osPrice, received);
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/purchases/${p.id}?from=finance`}
                          className="flex min-h-[44px] flex-col gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm transition-colors hover:bg-surface-2/60"
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-medium text-ink">{p.item_name}</span>
                            <span className="tabular shrink-0 font-semibold text-ink">
                              {formatSignedRupiah(osDifference(osPrice, p.price))}
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center justify-between gap-2 text-ink-3">
                            <span className="tabular text-[11px] sm:text-xs">
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

                {hasMoreGiven && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span>
                      {expanded
                        ? "Show fewer Given OS"
                        : `Show ${given.length - INITIAL_GIVEN_LIMIT} more Given OS`}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        expanded && "rotate-180",
                      )}
                    />
                  </button>
                )}

                <div className="mt-2.5 flex items-baseline justify-between gap-3 px-1 text-xs sm:text-sm">
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
                className="flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm transition-colors hover:bg-surface-2/60"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-ink truncate">
                    Taken OS <span className="font-normal text-ink-3">· {pluralize(summary.takenCount, "purchase")}</span>
                  </span>
                  <span className="block text-[11px] sm:text-xs text-ink-3 truncate">Included in Total spent</span>
                </span>
                <span className="tabular shrink-0 font-medium text-ink">{formatRupiah(summary.takenSpent)} paid</span>
              </Link>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
