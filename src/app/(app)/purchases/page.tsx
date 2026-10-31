import { Archive, Plus, SearchX, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/surface";
import { SearchInput } from "@/components/ui/url-state";
import { BackLink } from "@/components/ui/back-link";
import {
  applySecondaryFilters,
  matchesTab,
  parsePurchaseFilters,
  sortPurchases,
  TABS,
  type PurchaseTab,
} from "@/features/purchases/filters";
import { PurchaseFilterControls, PurchaseTabs } from "@/features/purchases/purchase-filters";
import { PurchaseRow } from "@/features/purchases/purchase-row";
import { listPurchases } from "@/features/purchases/queries";
import { requireUser } from "@/lib/auth";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Purchases" };

export default async function PurchasesPage({ searchParams }: PageProps<"/purchases">) {
  const params = await searchParams;
  const archivedView = params.view === "archived";
  const filters = parsePurchaseFilters(params);
  const { supabase } = await requireUser();

  const [purchases, { data: sources }] = await Promise.all([
    listPurchases(supabase, { scope: archivedView ? "archived" : "active", withImages: true }),
    supabase.from("sources").select("id, name, type, platform").order("name"),
  ]);

  const filtered = applySecondaryFilters(purchases, filters);
  const counts = Object.fromEntries(
    TABS.map((tab) => [tab.value, filtered.filter((p) => matchesTab(p, tab.value)).length]),
  ) as Record<PurchaseTab, number>;
  const visible = sortPurchases(
    filtered.filter((p) => matchesTab(p, filters.tab)),
    filters.sort,
  );

  if (archivedView) {
    return (
      <>
        <PageHeader
          back={<BackLink href="/purchases">Purchases</BackLink>}
          title="Archived purchases"
          description="Archived purchases are hidden from your lists and counts. Open one to restore it."
        />
        <Card className="overflow-hidden">
          {purchases.length === 0 ? (
            <EmptyState icon={<Archive />} title="Nothing archived" />
          ) : (
            <ul className="divide-y divide-line">
              {sortPurchases(purchases, "newest").map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} showStale={false} />
              ))}
            </ul>
          )}
        </Card>
      </>
    );
  }

  const hasAnyPurchase = purchases.length > 0;

  return (
    <>
      <PageHeader
        title="Purchases"
        description="Everything you've bought, where it is, and what's left to pay."
        actions={
          <div className="hidden sm:block">
            <ButtonLink href="/purchases/new">
              <Plus aria-hidden="true" />
              Add Purchase
            </ButtonLink>
          </div>
        }
      />

      {!hasAnyPurchase ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag />}
            title="No purchases yet"
            description="Add your first purchase to start tracking your collection."
            action={
              <ButtonLink href="/purchases/new">
                <Plus aria-hidden="true" />
                Add Purchase
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <PurchaseTabs current={filters.tab} counts={counts} />
            <SearchInput
              label="Search purchases"
              placeholder="Search item, artist, source or batch"
              className="min-w-0 flex-1 basis-40 sm:basis-64"
            />
            <PurchaseFilterControls filters={filters} sources={sources ?? []} />
          </div>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3 text-sm text-ink-3">
              <p aria-live="polite">{pluralize(visible.length, "purchase")}</p>
            </div>
            {visible.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="No purchases match your filters"
                description="Try a different search or remove a filter."
                action={
                  <ButtonLink href="/purchases" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {visible.map((purchase) => (
                  <PurchaseRow key={purchase.id} purchase={purchase} />
                ))}
              </ul>
            )}
          </Card>

          <Link
            href="/purchases?view=archived"
            className="inline-flex h-10 w-fit items-center gap-2 self-center text-sm font-medium text-ink-2 hover:text-ink"
          >
            <Archive className="size-4" aria-hidden="true" />
            View archived purchases
          </Link>
        </div>
      )}
    </>
  );
}
