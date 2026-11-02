import { test } from "node:test";
import assert from "node:assert/strict";
import { groupBatchesBySource } from "./grouping.ts";
import type { BatchView } from "./queries.ts";

function createMockBatch(overrides: Partial<BatchView>): BatchView {
  return {
    id: "b1",
    batch_number: "42",
    batch_date: "2026-09-01",
    created_at: "2026-09-01T10:00:00Z",
    country: "CHINA",
    status: "IN_TRANSIT",
    last_updated_at: "2026-09-01T10:00:00Z",
    notes: null,
    source_id: "s1",
    source: { id: "s1", name: "Alpha GO", type: "GROUP_ORDER", platform: "WhatsApp" },
    purchaseCount: 2,
    totalValue: 150_000,
    daysSinceUpdate: 2,
    stale: false,
    itemPreview: ["Wonwoo PC", "Hanni PC"],
    ...overrides,
  } as BatchView;
}

test("groupBatchesBySource: groups batches by source into folders and calculates totals", () => {
  const b1 = createMockBatch({
    id: "b1",
    source: { id: "s1", name: "Alpha GO", type: "GROUP_ORDER", platform: "WhatsApp" },
    purchaseCount: 2,
    totalValue: 150_000,
    stale: false,
    itemPreview: ["Wonwoo PC"],
    created_at: "2026-09-01T10:00:00Z",
  });
  const b2 = createMockBatch({
    id: "b2",
    source: { id: "s1", name: "Alpha GO", type: "GROUP_ORDER", platform: "WhatsApp" },
    purchaseCount: 3,
    totalValue: 200_000,
    stale: true,
    itemPreview: ["Hanni PC", "Minji PC"],
    created_at: "2026-09-05T10:00:00Z",
  });
  const b3 = createMockBatch({
    id: "b3",
    source: { id: "s2", name: "Beta GO", type: "GROUP_ORDER", platform: "Twitter" },
    purchaseCount: 1,
    totalValue: 50_000,
    stale: false,
    itemPreview: ["Album Version A"],
    created_at: "2026-08-01T10:00:00Z",
  });

  const folders = groupBatchesBySource([b1, b2, b3]);

  assert.equal(folders.length, 2);

  // Alpha GO has newer batch (2026-09-05) than Beta GO (2026-08-01), so Alpha is first
  const alphaFolder = folders[0];
  assert.equal(alphaFolder.source.name, "Alpha GO");
  assert.equal(alphaFolder.totalBatches, 2);
  assert.equal(alphaFolder.totalPurchases, 5);
  assert.equal(alphaFolder.totalValue, 350_000);
  assert.equal(alphaFolder.staleCount, 1);
  assert.equal(alphaFolder.hasStale, true);
  assert.deepEqual(alphaFolder.itemPreview, ["Wonwoo PC", "Hanni PC", "Minji PC"]);

  const betaFolder = folders[1];
  assert.equal(betaFolder.source.name, "Beta GO");
  assert.equal(betaFolder.totalBatches, 1);
  assert.equal(betaFolder.totalPurchases, 1);
  assert.equal(betaFolder.totalValue, 50_000);
  assert.equal(betaFolder.staleCount, 0);
  assert.equal(betaFolder.hasStale, false);
});

test("groupBatchesBySource: returns empty array when given no batches", () => {
  const folders = groupBatchesBySource([]);
  assert.equal(folders.length, 0);
});
