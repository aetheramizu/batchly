// Batch list filtering and sorting. Pure — tested with node --test.

import {
  COUNTRIES,
  COUNTRY_LABEL,
  type Country,
  type TrackingStatus,
} from "../../lib/domain.ts";
import type { BatchView } from "./queries.ts";

export type BatchViewMode = "active" | "archived";

export const NEEDS_UPDATE = "needs-update";

export const ACTIVE_TRACKING_STATUSES: TrackingStatus[] = [
  "PURCHASED",
  "WAREHOUSE",
  "IN_TRANSIT",
  "INDONESIA",
  "ADMIN_RECEIVED",
];

export type BatchFilters = {
  q: string;
  status: TrackingStatus | "needs-update" | "";
  country: Country | "";
  view: BatchViewMode;
};

type Params = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parseBatchFilters(params: Params): BatchFilters {
  const rawView = one(params.view);
  const rawStatus = one(params.status);
  const rawCountry = one(params.country);
  const q = one(params.q).trim().slice(0, 100);

  const view: BatchViewMode =
    rawView === "archived" || rawStatus === "DELIVERED" ? "archived" : "active";

  let status: TrackingStatus | "needs-update" | "" = "";
  if (view === "active") {
    if (rawStatus === NEEDS_UPDATE) {
      status = NEEDS_UPDATE;
    } else if (ACTIVE_TRACKING_STATUSES.includes(rawStatus as TrackingStatus)) {
      status = rawStatus as TrackingStatus;
    }
  }

  const country = COUNTRIES.includes(rawCountry as Country)
    ? (rawCountry as Country)
    : "";

  return { q, status, country, view };
}

export function matchesView(batch: BatchView, view: BatchViewMode): boolean {
  if (view === "archived") return batch.status === "DELIVERED";
  return batch.status !== "DELIVERED";
}

export function matchesStatus(batch: BatchView, status: string): boolean {
  if (!status) return true;
  if (status === NEEDS_UPDATE) return batch.stale;
  return batch.status === status;
}

export function matchesCountry(batch: BatchView, country: string): boolean {
  if (!country) return true;
  return batch.country === country;
}

export function matchesSearch(batch: BatchView, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystack = [
    batch.batch_number,
    `batch ${batch.batch_number}`,
    batch.source.name,
    COUNTRY_LABEL[batch.country] ?? "",
    batch.country,
    batch.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function sortBatches(batches: BatchView[]): BatchView[] {
  return [...batches].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
}

export function filterBatches(
  batches: BatchView[],
  filters: BatchFilters,
): BatchView[] {
  const filtered = batches.filter(
    (b) =>
      matchesView(b, filters.view) &&
      matchesStatus(b, filters.status) &&
      matchesCountry(b, filters.country) &&
      matchesSearch(b, filters.q),
  );
  return sortBatches(filtered);
}

export function activeFilterCount(filters: BatchFilters): number {
  let count = 0;
  if (filters.status) count++;
  if (filters.country) count++;
  return count;
}
