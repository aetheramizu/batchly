"use client";

import { X } from "lucide-react";
import { Select } from "@/components/ui/field";
import { SearchInput, useUpdateParams } from "@/components/ui/url-state";
import {
  COUNTRIES,
  COUNTRY_LABEL,
  TRACKING_STATUS_LABEL,
  type Country,
  type TrackingStatus,
} from "@/lib/domain";
import {
  ACTIVE_TRACKING_STATUSES,
  NEEDS_UPDATE,
  type BatchFilters as BatchFiltersType,
} from "./filters";

export function BatchFilterControls({
  filters,
  counts,
}: {
  filters: BatchFiltersType;
  counts?: {
    total: number;
    stale: number;
  };
}) {
  const { update } = useUpdateParams();
  const isArchived = filters.view === "archived";

  const chips = [
    filters.status && {
      key: "status",
      label:
        filters.status === NEEDS_UPDATE
          ? "Needs update"
          : TRACKING_STATUS_LABEL[filters.status as TrackingStatus] ?? filters.status,
    },
    filters.country && {
      key: "country",
      label: COUNTRY_LABEL[filters.country as Country] ?? filters.country,
    },
  ].filter(Boolean) as { key: string; label: string }[];

  const hasActiveFilters = chips.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          label={isArchived ? "Search archived batches" : "Search batches"}
          placeholder={
            isArchived
              ? "Search archived batch, source or country"
              : "Search batch number, source, or country"
          }
          className="min-w-0 flex-1"
        />

        <div className="flex items-center gap-2">
          {!isArchived && (
            <Select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) => update({ status: e.target.value || null })}
              className="h-10 text-sm flex-1 sm:w-44 sm:flex-none"
            >
              <option value="">All statuses</option>
              <option value={NEEDS_UPDATE}>
                Needs update{counts?.stale ? ` (${counts.stale})` : ""}
              </option>
              {ACTIVE_TRACKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TRACKING_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          )}

          <Select
            aria-label="Filter by country"
            value={filters.country}
            onChange={(e) => update({ country: e.target.value || null })}
            className={`h-10 text-sm ${isArchived ? "w-full sm:w-40" : "flex-1 sm:w-36 sm:flex-none"}`}
          >
            <option value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABEL[c]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update({ [chip.key]: null })}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface pr-1.5 pl-2.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
              aria-label={`Remove filter: ${chip.label}`}
            >
              <span>{chip.label}</span>
              <X className="size-3 text-ink-3" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => update({ status: null, country: null })}
            className="h-7 px-1.5 text-xs font-medium text-accent-ink hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
