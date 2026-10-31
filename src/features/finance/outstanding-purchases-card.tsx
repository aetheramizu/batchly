"use client";

import { CircleCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/surface";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import type { PurchaseView } from "@/features/purchases/queries";
import { cn } from "@/lib/cn";

const INITIAL_LIMIT = 4;

export function OutstandingPurchasesCard({
  purchases,
  totalOutstandingCount,
}: {
  purchases: PurchaseView[];
  totalOutstandingCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? purchases : purchases.slice(0, INITIAL_LIMIT);
  const hasMore = purchases.length > INITIAL_LIMIT;

  return (
    <Card id="still-to-pay" className="scroll-mt-20 overflow-hidden">
      <CardHeader
        title="Still to pay"
        description="Purchases with outstanding balances, largest first."
        action={
          totalOutstandingCount > 0 && (
            <Link
              href="/purchases?payment=OUTSTANDING"
              className="text-sm font-medium text-accent-ink hover:underline"
            >
              View in Purchases{totalOutstandingCount > purchases.length ? ` (${totalOutstandingCount})` : ""}
            </Link>
          )
        }
      />

      {purchases.length === 0 ? (
        <div className="flex items-center gap-3 px-5 pb-5 text-sm text-ink-2">
          <CircleCheck className="size-5 text-success" aria-hidden="true" />
          Every purchase is fully paid.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line border-t border-line">
            {visible.map((purchase) => (
              <PurchaseRow
                key={purchase.id}
                purchase={purchase}
                from="finance"
                showStale={false}
              />
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="flex min-h-[44px] w-full items-center justify-center gap-1.5 border-t border-line py-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span>
                {expanded
                  ? "Show fewer purchases"
                  : `Show ${purchases.length - INITIAL_LIMIT} more purchases`}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-4 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
            </button>
          )}
        </>
      )}
    </Card>
  );
}
