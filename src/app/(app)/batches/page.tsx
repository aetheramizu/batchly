import { Layers, SearchX } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { ChipFilter } from "@/components/ui/chip-filter";
import { Card, EmptyState, PageHeader } from "@/components/ui/surface";
import { SearchInput } from "@/components/ui/url-state";
import { BatchRow } from "@/features/batches/batch-row";
import { listBatches, type BatchView } from "@/features/batches/queries";
import { requireUser } from "@/lib/auth";
import {
  COUNTRY_LABEL,
  isTrackingStatus,
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
} from "@/lib/domain";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Batches" };

const NEEDS_UPDATE = "needs-update";

function matchesStatus(batch: BatchView, filter: string) {
  if (!filter) return true;
  if (filter === NEEDS_UPDATE) return batch.stale;
  return batch.status === filter;
}

export default async function BatchesPage({ searchParams }: PageProps<"/batches">) {
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : "";
  const status = rawStatus === NEEDS_UPDATE || isTrackingStatus(rawStatus) ? rawStatus : "";
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const { supabase } = await requireUser();
  const batches = await listBatches(supabase);

  if (batches.length === 0) {
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

  const searched = q
    ? batches.filter((b) =>
        `batch ${b.batch_number} ${b.source.name} ${COUNTRY_LABEL[b.country]}`
          .toLowerCase()
          .includes(q),
      )
    : batches;
  const visible = searched.filter((b) => matchesStatus(b, status));

  // Organized by Source → Country → Batch (PRD §23).
  const groups = new Map<string, { title: string; batches: BatchView[] }>();
  for (const batch of visible) {
    const key = `${batch.source.id}:${batch.country}`;
    if (!groups.has(key)) {
      groups.set(key, {
        title: `${batch.source.name} · ${COUNTRY_LABEL[batch.country]}`,
        batches: [],
      });
    }
    groups.get(key)!.batches.push(batch);
  }
  const sortedGroups = [...groups.values()].sort((a, b) => a.title.localeCompare(b.title));

  const active = batches.filter((b) => b.status !== "DELIVERED").length;
  const stale = batches.filter((b) => b.stale).length;
  const delivered = batches.length - active;

  const options = [
    { value: "", label: "All", count: searched.length },
    { value: NEEDS_UPDATE, label: "Needs update", count: searched.filter((b) => b.stale).length },
    ...TRACKING_STATUSES.map((s) => ({
      value: s,
      label: TRACKING_STATUS_LABEL[s],
      count: searched.filter((b) => b.status === s).length,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Batches"
        description="Group Order batches. Updating a batch updates every purchase inside it."
      />

      <dl className="mb-5 grid grid-cols-3 divide-x divide-line rounded-[var(--radius-card)] border border-line bg-surface">
        <Stat label="In progress" value={active} />
        <Stat label="Needs update" value={stale} highlight={stale > 0} />
        <Stat label="Delivered" value={delivered} />
      </dl>

      <div className="mb-4 flex flex-col gap-3">
        <SearchInput label="Search batches" placeholder="Search batch number or source" />
        <ChipFilter param="status" value={status} options={options} label="Filter by status" />
      </div>

      {sortedGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX />}
            title="No batches match your filters"
            action={
              <ButtonLink href="/batches" variant="secondary">
                Clear filters
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {sortedGroups.map((group) => (
            <Card key={group.title} className="overflow-hidden">
              <div className="flex items-baseline justify-between gap-3 border-b border-line bg-surface-2/50 px-5 py-2.5">
                <h2 className="truncate text-sm font-semibold text-ink">{group.title}</h2>
                <p className="shrink-0 text-xs text-ink-3">{pluralize(group.batches.length, "batch", "batches")}</p>
              </div>
              <ul className="divide-y divide-line">
                {group.batches.map((batch) => (
                  <BatchRow key={batch.id} batch={batch} showSource={false} />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="px-3 py-3 sm:px-5 sm:py-3.5">
      <dt className="text-sm text-ink-3 max-sm:text-xs max-sm:leading-tight">{label}</dt>
      <dd
        className={`tabular mt-1 font-display text-2xl font-bold sm:mt-0.5 ${highlight ? "text-warning" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}
