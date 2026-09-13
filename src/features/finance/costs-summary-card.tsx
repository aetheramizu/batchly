import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, DetailRow } from "@/components/ui/surface";
import { COST_TYPES, COST_TYPE_LABEL } from "@/lib/domain";
import { formatRupiah } from "@/lib/format";
import type { CostRow } from "../purchases/queries";
import type { CostFinance } from "./summary";

const UNPAID_LIMIT = 6;

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
  return (
    <Card id="costs" className="scroll-mt-20">
      <CardHeader
        title="Additional costs"
        description="Tax, packing and shipping you recorded on purchases."
      />
      <div className="flex flex-col gap-4 px-5 pb-5">
        {summary.total === 0 ? (
          <p className="text-sm text-ink-3">
            No additional costs recorded. Add them from a purchase&apos;s detail page.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-3 gap-3 rounded-[var(--radius-control)] bg-surface-2 px-4 py-3 text-sm">
              <div>
                <dt className="text-ink-3">Total</dt>
                <dd className="tabular mt-0.5 font-semibold">{formatRupiah(summary.total)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Paid</dt>
                <dd className="tabular mt-0.5 font-semibold">{formatRupiah(summary.paid)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Unpaid</dt>
                <dd
                  className={`tabular mt-0.5 font-semibold ${summary.unpaid > 0 ? "text-warning" : ""}`}
                >
                  {formatRupiah(summary.unpaid)}
                </dd>
              </div>
            </dl>

            <dl className="divide-y divide-line">
              {COST_TYPES.map((type) => (
                <DetailRow key={type} label={COST_TYPE_LABEL[type]}>
                  <span className="tabular">{formatRupiah(summary.byType[type])}</span>
                </DetailRow>
              ))}
            </dl>

            {unpaid.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink">Unpaid costs</h3>
                <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                  {unpaid.slice(0, UNPAID_LIMIT).map((cost) => (
                    <li key={cost.id}>
                      <Link
                        href={`/purchases/${cost.purchase_id}?from=finance`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-2/60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">
                            {itemNames.get(cost.purchase_id) ?? "Purchase"}
                          </span>
                          <span className="block text-ink-3">{COST_TYPE_LABEL[cost.type]}</span>
                        </span>
                        <span className="tabular shrink-0 font-medium">{formatRupiah(cost.amount)}</span>
                        <Badge tone="warning">Unpaid</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
                {unpaid.length > UNPAID_LIMIT && (
                  <p className="mt-2 text-xs text-ink-3">
                    And {unpaid.length - UNPAID_LIMIT} more unpaid costs.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
