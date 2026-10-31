import { Wallet } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/surface";
import { CostsSummaryCard } from "@/features/finance/costs-summary-card";
import { FinanceSummaryGrid } from "@/features/finance/finance-summary-grid";
import { OsSummaryCard } from "@/features/finance/os-summary-card";
import { OutstandingPurchasesCard } from "@/features/finance/outstanding-purchases-card";
import { PaymentBreakdownCard } from "@/features/finance/payment-breakdown-card";
import { summarizeCosts, summarizeOs, summarizePurchases } from "@/features/finance/summary";
import { listCosts, listPurchases, withImageUrls } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";

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
      description="Track spending, outstanding balances, and additional expenses."
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
        <FinanceSummaryGrid
          money={money}
          costSummary={costSummary}
          os={os}
          archivedCount={archivedCount}
        />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <PaymentBreakdownCard summary={money} />
            <OutstandingPurchasesCard
              purchases={outstanding}
              totalOutstandingCount={outstandingAll.length}
            />
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
