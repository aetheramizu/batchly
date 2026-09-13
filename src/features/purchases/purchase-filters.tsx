"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { useUpdateParams } from "@/components/ui/url-state";
import { cn } from "@/lib/cn";
import {
  COUNTRIES,
  COUNTRY_LABEL,
  TRACKING_STATUSES,
  TRACKING_STATUS_LABEL,
} from "@/lib/domain";
import {
  activeFilterCount,
  PAYMENT_FILTERS,
  SORTS,
  TABS,
  type PurchaseFilters,
  type PurchaseTab,
} from "./filters";
import type { SourceSummary } from "./queries";

export function PurchaseTabs({
  current,
  counts,
}: {
  current: PurchaseTab;
  counts: Record<PurchaseTab, number>;
}) {
  const { update } = useUpdateParams();
  return (
    <div
      role="tablist"
      aria-label="Purchase views"
      className="flex w-full gap-1 overflow-x-auto rounded-[var(--radius-control)] bg-surface-2 p-1 sm:w-auto"
    >
      {TABS.map((tab) => {
        const selected = tab.value === current;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => update({ tab: tab.value === "all" ? null : tab.value })}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none",
              selected ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink",
            )}
          >
            {tab.label}
            <span className={cn("tabular text-xs", selected ? "text-accent-ink" : "text-ink-3")}>
              {counts[tab.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PurchaseFilterControls({
  filters,
  sources,
}: {
  filters: PurchaseFilters;
  sources: SourceSummary[];
}) {
  const [open, setOpen] = useState(false);
  const { update } = useUpdateParams();
  const count = activeFilterCount(filters);

  const chips = [
    filters.country && { key: "country", label: COUNTRY_LABEL[filters.country] },
    filters.source && {
      key: "source",
      label: sources.find((s) => s.id === filters.source)?.name ?? "Source",
    },
    filters.status && { key: "status", label: TRACKING_STATUS_LABEL[filters.status] },
    filters.payment && {
      key: "payment",
      label: PAYMENT_FILTERS.find((p) => p.value === filters.payment)?.label ?? "",
    },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {count > 0 && (
            <span className="tabular grid size-5 place-items-center rounded-full bg-accent text-xs text-white">
              {count}
            </span>
          )}
        </Button>
        <Select
          aria-label="Sort purchases"
          value={filters.sort}
          onChange={(event) =>
            update({ sort: event.target.value === "newest" ? null : event.target.value })
          }
          className="hidden w-48 md:block"
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </Select>
      </div>

      {chips.length > 0 && (
        <div className="flex basis-full flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update({ [chip.key]: null })}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface pr-2 pl-3 text-sm text-ink hover:border-line-strong"
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
              <X className="size-3.5 text-ink-3" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => update({ country: null, source: null, status: null, payment: null })}
            className="h-8 px-1 text-sm font-medium text-accent-ink hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Filter purchases"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                update({ country: null, source: null, status: null, payment: null, sort: null });
                setOpen(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FilterSelect
            id="filter-country"
            label="Country"
            value={filters.country}
            onChange={(value) => update({ country: value })}
            options={COUNTRIES.map((c) => ({ value: c, label: COUNTRY_LABEL[c] }))}
            anyLabel="All countries"
          />
          <FilterSelect
            id="filter-source"
            label="Source"
            value={filters.source}
            onChange={(value) => update({ source: value })}
            options={sources.map((s) => ({ value: s.id, label: s.name }))}
            anyLabel="All sources"
          />
          <FilterSelect
            id="filter-status"
            label="Tracking status"
            value={filters.status}
            onChange={(value) => update({ status: value })}
            options={TRACKING_STATUSES.map((s) => ({ value: s, label: TRACKING_STATUS_LABEL[s] }))}
            anyLabel="Any status"
          />
          <FilterSelect
            id="filter-payment"
            label="Payment"
            value={filters.payment}
            onChange={(value) => update({ payment: value })}
            options={PAYMENT_FILTERS}
            anyLabel="Any payment"
          />
          <Field id="filter-sort" label="Sort by" className="md:hidden">
            <Select
              id="filter-sort"
              value={filters.sort}
              onChange={(event) =>
                update({ sort: event.target.value === "newest" ? null : event.target.value })
              }
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Dialog>
    </>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
  anyLabel: string;
}) {
  return (
    <Field id={id} label={label}>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
