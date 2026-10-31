import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applySecondaryFilters,
  matchesTab,
  parsePurchaseFilters,
  sortPurchases,
} from "./filters.ts";
import type { PurchaseView } from "./queries.ts";

function purchase(overrides: Partial<PurchaseView>): PurchaseView {
  return {
    id: "p",
    item_name: "Juun PC",
    artist_group: "TWS",
    price: 90_000,
    paid_amount: 0,
    purchase_date: "2026-09-01",
    created_at: "2026-09-01T00:00:00Z",
    ownership_status: "ACTIVE",
    purchase_origin: "NEW",
    source: { id: "go-a", name: "GO A", type: "GROUP_ORDER", platform: "WhatsApp" },
    batch: {
      id: "b42",
      batch_number: "42",
      country: "CHINA",
      status: "IN_TRANSIT",
      last_updated_at: "2026-09-01T00:00:00Z",
      batch_date: "2026-09-01",
    },
    effectiveCountry: "CHINA",
    status: "IN_TRANSIT",
    lastUpdatedAt: "2026-09-01T00:00:00Z",
    payment: "UNPAID",
    remaining: 90_000,
    ...overrides,
  } as PurchaseView;
}

const juun = purchase({ id: "juun" });
const ian = purchase({
  id: "ian",
  item_name: "Ian PC",
  price: 120_000,
  paid_amount: 120_000,
  payment: "PAID",
  status: "DELIVERED",
  purchase_date: "2026-09-05",
});
const mingyu = purchase({
  id: "mingyu",
  item_name: "Mingyu PC",
  artist_group: "SEVENTEEN",
  source: { id: "jane", name: "Seller Jane", type: "DIRECT_SELLER", platform: "X" },
  batch: null,
  effectiveCountry: "JAPAN",
  purchase_origin: "TAKEN_OS",
  payment: "PARTIAL",
});
const given = purchase({ id: "given", ownership_status: "GIVEN_OS" });
const all = [juun, ian, mingyu, given];

// FILTER-01..03
test("tabs: active, delivered, OS", () => {
  assert.deepEqual(all.filter((p) => matchesTab(p, "active")).map((p) => p.id), ["juun", "mingyu"]);
  assert.deepEqual(all.filter((p) => matchesTab(p, "delivered")).map((p) => p.id), ["ian"]);
  assert.deepEqual(all.filter((p) => matchesTab(p, "os")).map((p) => p.id), ["mingyu", "given"]);
});

// SEARCH-01..04
test("search matches item, artist, source and batch number", () => {
  const search = (q: string) =>
    applySecondaryFilters(all, parsePurchaseFilters({ q })).map((p) => p.id);
  assert.deepEqual(search("ian"), ["ian"]);
  assert.deepEqual(search("seventeen"), ["mingyu"]);
  assert.deepEqual(search("seller jane"), ["mingyu"]);
  assert.deepEqual(search("batch 42"), ["juun", "ian", "given"]);
});

// FILTER-04
test("combined filters must all match", () => {
  const result = applySecondaryFilters(
    all,
    parsePurchaseFilters({ country: "CHINA", payment: "OUTSTANDING" }),
  );
  assert.deepEqual(result.map((p) => p.id), ["juun", "given"]);
});

test("invalid params fall back to defaults", () => {
  const f = parsePurchaseFilters({ tab: "nope", status: "LOST", sort: "x" });
  assert.equal(f.tab, "active");
  assert.equal(f.status, "");
  assert.equal(f.sort, "newest");
});

test("explicit tab param is preserved", () => {
  assert.equal(parsePurchaseFilters({}).tab, "active");
  assert.equal(parsePurchaseFilters({ tab: "all" }).tab, "all");
  assert.equal(parsePurchaseFilters({ tab: "delivered" }).tab, "delivered");
  assert.equal(parsePurchaseFilters({ tab: "os" }).tab, "os");
});

test("sorting", () => {
  assert.equal(sortPurchases(all, "newest")[0].id, "ian");
  assert.equal(sortPurchases(all, "price-asc")[0].id, "juun");
});
