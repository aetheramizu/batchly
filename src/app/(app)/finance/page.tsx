import { CircleCheck, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/surface";
import { CostsSummaryCard } from "@/features/finance/costs-summary-card";
import { OsSummaryCard } from "@/features/finance/os-summary-card";
import { PaymentBreakdownCard } from "@/features/finance/payment-breakdown-card";
import { summarizeCosts, summarizeOs, summarizePurchases } from "@/features/finance/summary";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import { listCosts, listPurchases, withImageUrls } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { formatRupiah, formatSignedRupiah, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Finance" };

const OUTSTANDING_LIMIT = 8;

export default async function FinancePage() {
  const { supabase } = await requireUser();
  const [purchases, costs, archivedCount] = await Promise.all([
    listPurchases(supabase),
    listCosts(supabase),
    supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .not("archived_at", "is", null)
      .then(({ count }) => count ?? 0),
  ]);

  const header = (
    <PageHeader
      title="Finance"
      description="What you've paid, what you still owe, and your additional costs."
    />
  );

  if (purchases.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<Wallet />}
            title="No financial data yet"
            description="Your spending summary will appear here after adding purchases."
            action={<ButtonLink href="/purchases/new">Add Purchase</ButtonLink>}
          />
        </Card>
      </>
    );
  }

  const money = summarizePurchases(purchases);
  const costSummary = summarizeCosts(costs, new Set(purchases.map((p) => p.id)));
  const os = summarizeOs(purchases);

  const itemNames = new Map(purchases.map((p) => [p.id, p.item_name]));
  const unpaidCosts = costs.filter((c) => !c.paid && itemNames.has(c.purchase_id));
  const given = purchases.filter((p) => p.ownership_status === "GIVEN_OS" && p.os_price !== null);
  const outstandingAll = purchases
    .filter((p) => p.payment !== "PAID")
    .sort((a, b) => b.remaining - a.remaining);
  const outstanding = await withImageUrls(supabase, outstandingAll.slice(0, OUTSTANDING_LIMIT));

  return (
    <>
      {header}

      <div className="flex flex-col gap-5">
        <section aria-labelledby="finance-summary-heading">
          <h2 id="finance-summary-heading" className="sr-only">
            Summary
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              className="bg-surface"
              size="lg"
              label="Total spent"
              value={formatRupiah(money.spent)}
              hint="Paid toward purchase prices"
            />
            <Stat
              className="bg-surface"
              size="lg"
              label="To pay"
              value={formatRupiah(money.toPay)}
              tone={money.toPay > 0 ? "warning" : "default"}
              hint={
                money.outstandingCount > 0
                  ? `Across ${pluralize(money.outstandingCount, "purchase")}`
                  : "Everything is paid"
              }
              href="/purchases?payment=OUTSTANDING"
            />
            <Stat
              className="bg-surface"
              size="lg"
              label="Additional costs"
              value={formatRupiah(costSummary.total)}
              hint={
                costSummary.unpaid > 0
                  ? `${formatRupiah(costSummary.unpaid)} unpaid`
                  : "All recorded costs paid"
              }
              href="#costs"
            />
            <Stat
              className="bg-surface"
              size="lg"
              label="OS Difference"
              value={formatSignedRupiah(os.difference)}
              hint={
                os.givenCount > 0
                  ? `From ${pluralize(os.givenCount, "Given OS purchase")}`
                  : "No Given OS yet"
              }
              href="#os"
            />
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

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <PaymentBreakdownCard summary={money} />

            <Card className="overflow-hidden">
              <CardHeader
                title="Still to pay"
                description="Purchases that aren't fully paid, largest balance first."
                action={
                  outstandingAll.length > OUTSTANDING_LIMIT && (
                    <Link
                      href="/purchases?payment=OUTSTANDING"
                      className="text-sm font-medium text-accent-ink hover:underline"
                    >
                      View all {outstandingAll.length}
                    </Link>
                  )
                }
              />
              {outstanding.length === 0 ? (
                <div className="flex items-center gap-3 px-5 pb-5 text-sm text-ink-2">
                  <CircleCheck className="size-5 text-success" aria-hidden="true" />
                  Every purchase is fully paid.
                </div>
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  {outstanding.map((purchase) => (
                    <PurchaseRow key={purchase.id} purchase={purchase} from="finance" showStale={false} />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <CostsSummaryCard summary={costSummary} unpaid={unpaidCosts} itemNames={itemNames} />
            <OsSummaryCard summary={os} given={given} />
          </div>
        </div>
      </div>
    </>
  );
}
