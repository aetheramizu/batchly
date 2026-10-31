import { Archive, Layers, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/surface";
import { BatchFilterControls } from "@/features/batches/batch-filters";
import { BatchRow } from "@/features/batches/batch-row";
import { filterBatches, parseBatchFilters } from "@/features/batches/filters";
import { listBatches } from "@/features/batches/queries";
import { requireUser } from "@/lib/auth";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Batches" };

export default async function BatchesPage({ searchParams }: PageProps<"/batches">) {
  const params = await searchParams;
  const filters = parseBatchFilters(params);

  const { supabase } = await requireUser();
  const allBatches = await listBatches(supabase);

  const totalBatches = allBatches.length;
  const activeBatches = allBatches.filter((b) => b.status !== "DELIVERED");
  const deliveredBatches = allBatches.filter((b) => b.status === "DELIVERED");
  const deliveredCount = deliveredBatches.length;
  const staleCount = activeBatches.filter((b) => b.stale).length;

  if (totalBatches === 0) {
    return (
      <>
        <PageHeader title="Batches" description="Your Group Order batches and where they are." />
        <Card>
          <EmptyState
            icon={<Layers />}
            title="No Group Order batches yet"
            description="Create a Group Order purchase to get started. Direct Seller purchases don't use batches."
            action={<ButtonLink href="/purchases/new">Add Purchase</ButtonLink>}
          />
        </Card>
      </>
    );
  }

  if (filters.view === "archived") {
    const visible = filterBatches(allBatches, filters);

    return (
      <>
        <PageHeader
          back={<BackLink href="/batches">Batches</BackLink>}
          title="Archived batches"
          description="Completed batches that have been delivered."
        />

        <div className="flex flex-col gap-4">
          {deliveredCount > 0 && (
            <BatchFilterControls
              filters={filters}
              counts={{ total: deliveredCount, stale: 0 }}
            />
          )}

          <Card className="overflow-hidden">
            {deliveredCount === 0 ? (
              <EmptyState
                icon={<Archive />}
                title="No archived batches"
                description="Batches marked as Delivered will appear here."
                action={
                  <ButtonLink href="/batches" variant="secondary">
                    Back to active batches
                  </ButtonLink>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="No archived batches match your filters"
                description="Try a different search or clear your filters."
                action={
                  <ButtonLink href="/batches?view=archived" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm text-ink-3 sm:px-5">
                  <p aria-live="polite">
                    {pluralize(visible.length, "archived batch", "archived batches")}
                  </p>
                </div>
                <ul className="divide-y divide-line">
                  {visible.map((batch) => (
                    <BatchRow key={batch.id} batch={batch} from="archived" />
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      </>
    );
  }

  const visible = filterBatches(allBatches, filters);
  const isFiltered = Boolean(filters.q || filters.status || filters.country);

  return (
    <>
      <PageHeader
        title="Batches"
        description="Group Order batches. Updating a batch updates every purchase inside it."
        actions={
          deliveredCount > 0 ? (
            <ButtonLink href="/batches?view=archived" variant="secondary" size="sm">
              <Archive aria-hidden="true" />
              Archived ({deliveredCount})
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4">
        <BatchFilterControls
          filters={filters}
          counts={{
            total: activeBatches.length,
            stale: staleCount,
          }}
        />

        <Card className="overflow-hidden">
          {visible.length === 0 ? (
            isFiltered ? (
              <EmptyState
                icon={<SearchX />}
                title="No batches match your filters"
                description="Try a different search or remove a filter."
                action={
                  <ButtonLink href="/batches" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            ) : activeBatches.length === 0 ? (
              <EmptyState
                icon={<Layers />}
                title="All batches delivered"
                description="You don't have any active batches right now. Your completed batches are safely archived."
                action={
                  <ButtonLink href="/batches?view=archived" variant="secondary">
                    <Archive className="size-4" aria-hidden="true" />
                    View archived batches ({deliveredCount})
                  </ButtonLink>
                }
              />
            ) : (
              <EmptyState
                icon={<Layers />}
                title="No batches found"
                description="Create a Group Order purchase to get started."
                action={<ButtonLink href="/purchases/new">Add Purchase</ButtonLink>}
              />
            )
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm text-ink-3 sm:px-5">
                <p aria-live="polite">{pluralize(visible.length, "batch")}</p>
                {staleCount > 0 && (
                  <span className="text-warning text-xs font-medium">
                    {staleCount} need update
                  </span>
                )}
              </div>
              <ul className="divide-y divide-line">
                {visible.map((batch) => (
                  <BatchRow key={batch.id} batch={batch} />
                ))}
              </ul>
            </>
          )}
        </Card>

        {deliveredCount > 0 && (
          <Link
            href="/batches?view=archived"
            className="inline-flex h-10 w-fit items-center gap-2 self-center text-sm font-medium text-ink-2 hover:text-ink"
          >
            <Archive className="size-4" aria-hidden="true" />
            View archived batches ({deliveredCount})
          </Link>
        )}
      </div>
    </>
  );
}
