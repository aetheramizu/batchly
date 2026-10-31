import { PackagePlus, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui/surface";
import { listBatches } from "@/features/batches/queries";
import { TrackingOverview } from "@/features/dashboard/tracking-overview";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import { listPurchases, withImageUrls } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

const RECENT_LIMIT = 5;

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const [purchases, batches] = await Promise.all([
    listPurchases(supabase),
    listBatches(supabase),
  ]);

  const header = (
    <PageHeader
      title="Dashboard"
      description="What you recently added and where your orders currently are."
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

  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const recent = await withImageUrls(supabase, sortedPurchases.slice(0, RECENT_LIMIT));

  return (
    <>
      {header}

      <div className="flex flex-col gap-5 sm:gap-6">
        {/* Recently added */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Recently added"
            action={
              <Link
                href="/purchases"
                className="text-sm font-medium text-accent-ink hover:underline"
              >
                View all ({purchases.length})
              </Link>
            }
          />
          <ul className="divide-y divide-line border-t border-line">
            {recent.map((purchase) => (
              <PurchaseRow
                key={purchase.id}
                purchase={purchase}
                from="dashboard"
                compact
              />
            ))}
          </ul>
        </Card>

        {/* Where things are */}
        <TrackingOverview purchases={purchases} batches={batches} />
      </div>
    </>
  );
}
