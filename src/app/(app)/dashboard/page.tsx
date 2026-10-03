import { PackagePlus, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/surface";
import { listBatches } from "@/features/batches/queries";
import { AttentionCard } from "@/features/dashboard/attention-card";
import { TrackingOverview } from "@/features/dashboard/tracking-overview";
import { summarizeCosts, summarizeOs, summarizePurchases } from "@/features/finance/summary";
import { isOsPurchase, matchesTab } from "@/features/purchases/filters";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import { listCosts, listPurchases, withImageUrls } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { formatRupiah, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const RECENT_LIMIT = 5;

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const [purchases, batches, costs] = await Promise.all([
    listPurchases(supabase),
    listBatches(supabase),
    listCosts(supabase),
  ]);

  const header = (
    <PageHeader
      title="Dashboard"
      description="What you have, where it is, and what still needs paying."
      actions={
        <ButtonLink href="/purchases/new" className="hidden lg:inline-flex">
          <Plus aria-hidden="true" />
          Add Purchase
        </ButtonLink>
      }
    />
  );

  if (purchases.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<PackagePlus />}
            title="No purchases yet"
            description="Add your first purchase to start tracking your collection."
            action={<ButtonLink href="/purchases/new">Add Purchase</ButtonLink>}
          />
        </Card>
      </>
    );
  }

  const money = summarizePurchases(purchases);
  const costSummary = summarizeCosts(costs, new Set(purchases.map((p) => p.id)));
  const os = summarizeOs(purchases);

  const activePurchases = purchases.filter((p) => matchesTab(p, "active")).length;
  const deliveredPurchases = purchases.filter((p) => matchesTab(p, "delivered")).length;
  const osPurchases = purchases.filter(isOsPurchase).length;
  const activeBatches = batches.filter((b) => b.status !== "DELIVERED").length;

  const recent = await withImageUrls(
    supabase,
    [...purchases].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, RECENT_LIMIT),
  );

  return (
    <>
      {header}

      <div className="flex flex-col gap-5">
        {/* How much? */}
        <section aria-labelledby="money-heading">
          <h2 id="money-heading" className="sr-only">
            Money
          </h2>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3">
            <Stat
              className="bg-surface"
              size="lg"
              label="Total spent"
              value={formatRupiah(money.spent)}
              hint="Paid toward purchases"
              href="/finance"
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
                  : "Tax, packing and shipping"
              }
              href="/finance#costs"
            />
          </div>
        </section>

        {/* What do I have? */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:grid-cols-4">
            <Stat
              className="bg-surface"
              label="Active purchases"
              value={activePurchases}
              href="/purchases?tab=active"
            />
            <Stat
              className="bg-surface"
              label="Active batches"
              value={activeBatches}
              href="/batches"
            />
            <Stat
              className="bg-surface"
              label="Delivered"
              value={deliveredPurchases}
              href="/purchases?tab=delivered"
            />
            <Stat
              className="bg-surface"
              label="OS purchases"
              value={osPurchases}
              href="/purchases?tab=os"
            />
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <TrackingOverview purchases={purchases} batches={batches} />
          <AttentionCard
            data={{
              staleBatches: batches.filter((b) => b.stale && b.purchaseCount > 0).length,
              staleDirect: purchases.filter((p) => p.stale && !p.batch_id),
              outstanding: { count: money.outstandingCount, amount: money.toPay },
              unpaidCosts: { count: costSummary.unpaidCount, amount: costSummary.unpaid },
              osToReceive: os.osToReceive,
            }}
          />
        </div>

        <Card className="overflow-hidden">
          <CardHeader
            title="Recently added"
            action={
              <Link href="/purchases" className="text-sm font-medium text-accent-ink hover:underline">
                View all {purchases.length}
              </Link>
            }
          />
          <ul className="divide-y divide-line border-t border-line">
            {recent.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} from="dashboard" />
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
