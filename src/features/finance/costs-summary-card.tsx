"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { COST_TYPES, COST_TYPE_LABEL } from "@/lib/domain";
import { formatRupiah } from "@/lib/format";
import type { CostRow } from "../purchases/queries";
import type { CostFinance } from "./summary";

const INITIAL_UNPAID_LIMIT = 3;

/** Recorded additional costs, kept apart from purchase prices (FIN-03). */
export function CostsSummaryCard({
  summary,
  unpaid,
  itemNames,
}: {
  summary: CostFinance;
  unpaid: CostRow[];
  itemNames: Map<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleUnpaid = expanded ? unpaid : unpaid.slice(0, INITIAL_UNPAID_LIMIT);
  const hasMoreUnpaid = unpaid.length > INITIAL_UNPAID_LIMIT;

  return (
    <Card id="costs" className="scroll-mt-20">
      <CardHeader
        title="Additional costs"
        description="Tax, packing, and shipping across purchases."
      />
      <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        {summary.total === 0 ? (
          <p className="text-sm text-ink-3">
            No additional costs recorded. Add them from a purchase&apos;s detail page.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-3 gap-2 sm:gap-3 rounded-[var(--radius-control)] bg-surface-2 px-3 py-2.5 sm:px-4 sm:py-3 text-sm">
              <div className="min-w-0">
                <dt className="text-xs text-ink-3">Total</dt>
                <dd className="tabular mt-0.5 font-semibold text-xs min-[360px]:text-sm sm:text-base truncate text-ink">
                  {formatRupiah(summary.total)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-ink-3">Paid</dt>
                <dd className="tabular mt-0.5 font-semibold text-xs min-[360px]:text-sm sm:text-base truncate text-ink">
                  {formatRupiah(summary.paid)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-ink-3">Unpaid</dt>
                <dd
                  className={cn(
                    "tabular mt-0.5 font-semibold text-xs min-[360px]:text-sm sm:text-base truncate",
                    summary.unpaid > 0 ? "text-warning" : "text-ink",
                  )}
                >
                  {formatRupiah(summary.unpaid)}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {COST_TYPES.map((type) => {
                const amount = summary.byType[type];
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between gap-1.5 rounded-[var(--radius-control)] bg-surface-2/60 px-3 py-2 text-xs sm:text-sm"
                  >
                    <span className="truncate text-ink-2">{COST_TYPE_LABEL[type]}</span>
                    <span
                      className={cn(
                        "tabular font-semibold shrink-0",
                        amount > 0 ? "text-ink" : "text-ink-3",
                      )}
                    >
                      {formatRupiah(amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            {unpaid.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs sm:text-sm font-semibold text-ink">
                  Unpaid costs <span className="font-normal text-ink-3">· {unpaid.length}</span>
                </h3>
                <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {visibleUnpaid.map((cost) => (
                    <li key={cost.id}>
                      <Link
                        href={`/purchases/${cost.purchase_id}?from=finance`}
                        className="flex min-h-[44px] items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm transition-colors hover:bg-surface-2/60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">
                            {itemNames.get(cost.purchase_id) ?? "Purchase"}
                          </span>
                          <span className="block text-[11px] sm:text-xs text-ink-3">
                            {COST_TYPE_LABEL[cost.type]}
                          </span>
                        </span>
                        <span className="tabular shrink-0 font-semibold">{formatRupiah(cost.amount)}</span>
                        <Badge tone="warning">Unpaid</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
                {hasMoreUnpaid && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span>
                      {expanded
                        ? "Show fewer unpaid costs"
                        : `Show ${unpaid.length - INITIAL_UNPAID_LIMIT} more unpaid costs`}
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
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
