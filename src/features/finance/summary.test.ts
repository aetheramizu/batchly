import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeCosts, summarizeOs, summarizePurchases } from "./summary.ts";

type P = Parameters<typeof summarizePurchases>[0][number];

function purchase(overrides: Partial<P>): P {
  return {
    id: "p",
    price: 90_000,
    paid_amount: 0,
    ownership_status: "ACTIVE",
    purchase_origin: "NEW",
    os_price: null,
    os_paid_amount: null,
    ...overrides,
  };
}

test("DASH-04 / FIN-01 / FIN-02: spent and to pay across paid, partial and unpaid", () => {
  const result = summarizePurchases([
    purchase({ id: "paid", price: 100_000, paid_amount: 100_000 }),
    purchase({ id: "partial", price: 120_000, paid_amount: 50_000 }),
    purchase({ id: "unpaid", price: 90_000, paid_amount: 0 }),
  ]);
  assert.equal(result.totalValue, 310_000);
  assert.equal(result.spent, 150_000);
  assert.equal(result.toPay, 160_000);
  assert.equal(result.outstandingCount, 2);
  assert.deepEqual(result.byPayment, {
    PAID: { count: 1, amount: 100_000 },
    PARTIAL: { count: 1, amount: 70_000 },
    UNPAID: { count: 1, amount: 90_000 },
  });
});

test("FIN-05: a Taken OS purchase counts as spending by the amount paid for the OS", () => {
  const taken = purchase({ purchase_origin: "TAKEN_OS", price: 80_000, paid_amount: 80_000 });
  assert.equal(summarizePurchases([taken]).spent, 80_000);
  const os = summarizeOs([taken]);
  assert.equal(os.takenCount, 1);
  assert.equal(os.takenSpent, 80_000);
  assert.equal(os.givenCount, 0);
});

test("FIN-03: additional costs are totalled separately, only for included purchases", () => {
  const costs = [
    { purchase_id: "a", type: "TAX" as const, amount: 25_000, paid: true },
    { purchase_id: "a", type: "PACKING" as const, amount: 5_000, paid: false },
    { purchase_id: "archived", type: "DOMESTIC_SHIPPING" as const, amount: 15_000, paid: false },
  ];
  const result = summarizeCosts(costs, new Set(["a"]));
  assert.equal(result.total, 30_000);
  assert.equal(result.paid, 25_000);
  assert.equal(result.unpaid, 5_000);
  assert.equal(result.unpaidCount, 1);
  assert.equal(result.byType.TAX, 25_000);
  assert.equal(result.byType.DOMESTIC_SHIPPING, 0);
});

test("FIN-04: OS Difference is os_price minus the original price, per Give OS purchase", () => {
  const result = summarizeOs([
    purchase({ id: "loss", ownership_status: "GIVEN_OS", price: 90_000, os_price: 80_000, os_paid_amount: 30_000 }),
    purchase({ id: "gain", ownership_status: "GIVEN_OS", price: 100_000, os_price: 125_000, os_paid_amount: 125_000 }),
    purchase({ id: "active", price: 50_000 }),
  ]);
  assert.equal(result.givenCount, 2);
  assert.equal(result.osPrice, 205_000);
  assert.equal(result.osReceived, 155_000);
  assert.equal(result.osToReceive, 50_000);
  assert.equal(result.difference, 15_000);
});
