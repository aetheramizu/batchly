import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterBatches,
  matchesCountry,
  matchesSearch,
  matchesStatus,
  matchesView,
  parseBatchFilters,
  sortBatches,
} from "./filters.ts";
import type { BatchView } from "./queries.ts";

function batch(overrides: Partial<BatchView>): BatchView {
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
    source: { id: "s1", name: "Kave GO", type: "GROUP_ORDER", platform: "WhatsApp" },
    purchaseCount: 3,
    totalValue: 300_000,
    daysSinceUpdate: 2,
    stale: false,
    ...overrides,
  } as BatchView;
}

const olderActive = batch({
  id: "b-older",
  batch_number: "10",
  created_at: "2026-08-01T08:00:00Z",
  country: "CHINA",
  status: "WAREHOUSE",
  source: { id: "s1", name: "Alpha GO", type: "GROUP_ORDER", platform: "Twitter" },
});

const newerActive = batch({
  id: "b-newer",
  batch_number: "99",
  created_at: "2026-10-15T12:00:00Z",
  country: "KOREA",
  status: "IN_TRANSIT",
  source: { id: "s2", name: "Omega GO", type: "GROUP_ORDER", platform: "Instagram" },
});

const staleBatch = batch({
  id: "b-stale",
  batch_number: "15",
  created_at: "2026-09-10T09:00:00Z",
  country: "JAPAN",
  status: "INDONESIA",
  stale: true,
  daysSinceUpdate: 20,
});

const deliveredBatch = batch({
  id: "b-delivered",
  batch_number: "5",
  created_at: "2026-07-01T00:00:00Z",
  country: "KOREA",
  status: "DELIVERED",
});

const allBatches = [olderActive, newerActive, staleBatch, deliveredBatch];

test("sortBatches: newest created_at timestamp first", () => {
  const sorted = sortBatches(allBatches);
  assert.equal(sorted[0].id, "b-newer"); // 2026-10-15
  assert.equal(sorted[1].id, "b-stale"); // 2026-09-10
  assert.equal(sorted[2].id, "b-older"); // 2026-08-01
  assert.equal(sorted[3].id, "b-delivered"); // 2026-07-01
});

test("matchesView: active view excludes delivered batches; archived includes only delivered", () => {
  const activeOnly = allBatches.filter((b) => matchesView(b, "active"));
  assert.deepEqual(
    activeOnly.map((b) => b.id),
    ["b-older", "b-newer", "b-stale"],
  );

  const archivedOnly = allBatches.filter((b) => matchesView(b, "archived"));
  assert.deepEqual(
    archivedOnly.map((b) => b.id),
    ["b-delivered"],
  );
});

test("matchesStatus: filters by status and stale needs-update", () => {
  assert.equal(matchesStatus(newerActive, "IN_TRANSIT"), true);
  assert.equal(matchesStatus(newerActive, "WAREHOUSE"), false);
  assert.equal(matchesStatus(staleBatch, "needs-update"), true);
  assert.equal(matchesStatus(newerActive, "needs-update"), false);
  assert.equal(matchesStatus(newerActive, ""), true);
});

test("matchesCountry: filters by country", () => {
  assert.equal(matchesCountry(newerActive, "KOREA"), true);
  assert.equal(matchesCountry(newerActive, "CHINA"), false);
  assert.equal(matchesCountry(newerActive, ""), true);
});

test("matchesSearch: matches batch number, source name, and country", () => {
  assert.equal(matchesSearch(newerActive, "99"), true);
  assert.equal(matchesSearch(newerActive, "Omega"), true);
  assert.equal(matchesSearch(newerActive, "korea"), true);
  assert.equal(matchesSearch(newerActive, "japan"), false);
});

test("filterBatches: combines view, status, country, and search; maintains newest-first order", () => {
  const koreaActive = filterBatches(allBatches, {
    view: "active",
    status: "",
    country: "KOREA",
    q: "",
  });
  assert.deepEqual(
    koreaActive.map((b) => b.id),
    ["b-newer"],
  );

  const combined = filterBatches(allBatches, {
    view: "active",
    status: "IN_TRANSIT",
    country: "KOREA",
    q: "Omega",
  });
  assert.deepEqual(
    combined.map((b) => b.id),
    ["b-newer"],
  );

  const nonMatching = filterBatches(allBatches, {
    view: "active",
    status: "WAREHOUSE",
    country: "KOREA",
    q: "",
  });
  assert.equal(nonMatching.length, 0);
});

test("parseBatchFilters: parses params with defaults and handles DELIVERED redirect", () => {
  const def = parseBatchFilters({});
  assert.equal(def.view, "active");
  assert.equal(def.status, "");
  assert.equal(def.country, "");
  assert.equal(def.q, "");

  const archived = parseBatchFilters({ view: "archived", country: "KOREA" });
  assert.equal(archived.view, "archived");
  assert.equal(archived.country, "KOREA");

  const deliveredParam = parseBatchFilters({ status: "DELIVERED" });
  assert.equal(deliveredParam.view, "archived");

  const invalid = parseBatchFilters({ status: "FAKE_STATUS", country: "MARS" });
  assert.equal(invalid.status, "");
  assert.equal(invalid.country, "");
});
