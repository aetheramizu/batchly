// Group batches by their Group Order (Source). Pure — tested with node --test.

import type { SourceSummary } from "../purchases/queries.ts";
import type { BatchView } from "./queries.ts";

export type GroupOrderFolder = {
  id: string;
  source: SourceSummary;
  batches: BatchView[];
  totalBatches: number;
  totalPurchases: number;
  totalValue: number;
  staleCount: number;
  hasStale: boolean;
  itemPreview: string[];
};

export function groupBatchesBySource(batches: BatchView[]): GroupOrderFolder[] {
  const groups = new Map<
    string,
    {
      source: SourceSummary;
      batches: BatchView[];
      newestTimestamp: number;
    }
  >();

  for (const b of batches) {
    const sourceId = b.source.id;
    let entry = groups.get(sourceId);
    if (!entry) {
      entry = {
        source: b.source,
        batches: [],
        newestTimestamp: 0,
      };
      groups.set(sourceId, entry);
    }
    entry.batches.push(b);
    const ts = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (ts > entry.newestTimestamp) {
      entry.newestTimestamp = ts;
    }
  }

  const folders: GroupOrderFolder[] = Array.from(groups.values()).map(({ source, batches }) => {
    const itemSet = new Set<string>();
    let totalPurchases = 0;
    let totalValue = 0;
    let staleCount = 0;

    for (const b of batches) {
      totalPurchases += b.purchaseCount;
      totalValue += b.totalValue;
      if (b.stale) staleCount++;
      if (b.itemPreview) {
        for (const item of b.itemPreview) {
          itemSet.add(item);
        }
      }
    }

    return {
      id: source.id,
      source,
      batches,
      totalBatches: batches.length,
      totalPurchases,
      totalValue,
      staleCount,
      hasStale: staleCount > 0,
      itemPreview: Array.from(itemSet),
    };
  });

  return folders.sort((a, b) => {
    const timeA = groups.get(a.id)?.newestTimestamp ?? 0;
    const timeB = groups.get(b.id)?.newestTimestamp ?? 0;
    return timeB - timeA;
  });
}
