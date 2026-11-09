"use client";

import {
  ChevronDown,
  ChevronsUpDown,
  FolderClosed,
  FolderOpen,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Card } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { formatRupiah, pluralize } from "@/lib/format";
import { BatchRow } from "./batch-row";
import type { GroupOrderFolder } from "./grouping";

/**
 * Group Order folder card.
 * Acts as a container for all batches & purchases belonging to 1 Group Order.
 */
export function GoFolderCard({
  folder,
  isOpen,
  onToggle,
  from,
}: {
  folder: GroupOrderFolder;
  isOpen: boolean;
  onToggle: () => void;
  from?: string;
}) {
  const contentId = useId();
  const purchasesHref = `/purchases?source=${encodeURIComponent(folder.source.id)}`;

  return (
    <Card className="overflow-hidden transition-shadow duration-150 hover:shadow-xs">
      {/* Folder Header */}
      <div className="flex items-stretch justify-between gap-2 border-b border-line bg-surface">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left select-none touch-manipulation transition-colors hover:bg-surface-2/50 sm:gap-4 sm:px-5"
        >
          {/* Folder Icon badge */}
          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
              isOpen
                ? "bg-accent-soft text-accent"
                : "bg-surface-2 text-ink-2 group-hover:bg-surface-3 group-hover:text-ink",
            )}
            aria-hidden="true"
          >
            {isOpen ? <FolderOpen className="size-5" /> : <FolderClosed className="size-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-display font-semibold text-ink text-base truncate sm:text-lg">
                {folder.source.name}
              </h2>
              {folder.source.platform && (
                <span className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2">
                  {folder.source.platform}
                </span>
              )}
            </div>

            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-2 sm:text-sm">
              <span className="font-medium text-ink">
                {pluralize(folder.totalBatches, "batch")}
              </span>
              <span className="text-line-strong">·</span>
              <span className="text-ink-2">
                {pluralize(folder.totalPurchases, "purchase")}
              </span>
              <span className="text-line-strong">·</span>
              <span className="tabular text-ink-3">
                {formatRupiah(folder.totalValue)}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {folder.hasStale && (
              <span className="hidden items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning sm:inline-flex">
                Needs update ({folder.staleCount})
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-5 text-ink-3 transition-transform duration-200",
                isOpen && "rotate-180 text-ink",
              )}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Quick action to see all purchases in this GO directly */}
        <div className="flex items-center pr-3 sm:pr-4">
          <Link
            href={purchasesHref}
            title={`View all purchases from ${folder.source.name}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-ink sm:px-3 sm:text-sm"
          >
            <ShoppingBag className="size-3.5 text-ink-3" aria-hidden="true" />
            <span className="hidden sm:inline">Purchases</span>
          </Link>
        </div>
      </div>

      {/* Folder Content (Batches in this GO) */}
      {isOpen && (
        <div id={contentId}>
          <ul className="divide-y divide-line bg-surface/40">
            {folder.batches.map((batch) => (
              <BatchRow key={batch.id} batch={batch} showSource={false} from={from} />
            ))}
          </ul>

          {/* Folder Footer Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-4 py-2.5 text-xs text-ink-2 sm:px-5">
            <p>
              {pluralize(folder.totalPurchases, "purchase")} total in {folder.source.name}
            </p>
            <Link
              href={purchasesHref}
              className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
            >
              View in purchases →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * List of Group Order folders with expand/collapse-all controls.
 */
export function GoFolderList({
  folders,
  isFiltered,
  from,
}: {
  folders: GroupOrderFolder[];
  isFiltered: boolean;
  from?: string;
}) {
  const [prevFiltered, setPrevFiltered] = useState(isFiltered);
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    // If arriving with filters already active (e.g. from a search link), auto-expand
    if (isFiltered) {
      return new Set(folders.map((f) => f.id));
    }
    // Default: all collapsed
    return new Set<string>();
  });

  // When search/filter status changes: auto-expand when filtering, collapse when clearing
  if (isFiltered !== prevFiltered) {
    setPrevFiltered(isFiltered);
    if (isFiltered) {
      setOpenIds(new Set(folders.map((f) => f.id)));
    } else {
      setOpenIds(new Set<string>());
    }
  }

  const allOpen = folders.length > 0 && folders.every((f) => openIds.has(f.id));

  function toggleFolder(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (allOpen) {
      setOpenIds(new Set());
    } else {
      setOpenIds(new Set(folders.map((f) => f.id)));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {folders.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-ink-3">
          <p>
            {pluralize(folders.length, "Group Order folder")}
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink select-none touch-manipulation"
          >
            <ChevronsUpDown className="size-3.5" aria-hidden="true" />
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {folders.map((folder) => (
          <GoFolderCard
            key={folder.id}
            folder={folder}
            isOpen={openIds.has(folder.id)}
            onToggle={() => toggleFolder(folder.id)}
            from={from}
          />
        ))}
      </div>
    </div>
  );
}
